'use client';

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStorageUrl } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().min(1, "Tên sự kiện là bắt buộc"),
    description: z.string().min(1, "Mô tả là bắt buộc"),
    location: z.string().min(1, "Địa điểm là bắt buộc"),
    eventDate: z
        .date()
        .min(
            new Date(new Date().setHours(0, 0, 0, 0)),
            "Ngày sự kiện phải trong tương lai"
        ),
    price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    totalTickets: z.number().min(1, "Phải có ít nhất 1 vé"),
});

const formatNumber = (value: string) => {
    // Loại bỏ tất cả các ký tự không phải số
    const numericValue = value.replace(/\D/g, '');
    // Thêm dấu chấm phân cách hàng nghìn
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

type FormData = z.infer<typeof formSchema>;

interface InitialEventData {
    _id: Id<"events">;
    name: string;
    description: string;
    location: string;
    eventDate: number;
    price: number;
    totalTickets: number;
    imageStorageId?: Id<"_storage">;
}

interface EventFormProps {
    mode: "create" | "edit";
    initialData?: InitialEventData;
}

function EventForm({ mode, initialData }: EventFormProps) {
    const { user } = useUser();
    const createEvent = useMutation(api.events.create);
    const updateEvent = useMutation(api.events.updateEvent);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const currentImageUrl = useStorageUrl(initialData?.imageStorageId);

    // Image upload
    const imageInput = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
    const updateEventImage = useMutation(api.storage.updateEventImage);
    const deleteImage = useMutation(api.storage.deleteImage);

    const [removedCurrentImage, setRemovedCurrentImage] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            location: initialData?.location ?? "",
            eventDate: initialData ? new Date(initialData.eventDate) : new Date(new Date().setDate(new Date().getDate() + 1)),
            price: initialData?.price ?? 0,
            totalTickets: initialData?.totalTickets ?? 1,
        },
    });

    async function onSubmit(values: FormData) {
        if (!user?.id) return;

        startTransition(async () => {
            try {
                let imageStorageId = null;

                // Handle image changes
                if (selectedImage) {
                    // Upload new image
                    imageStorageId = await handleImageUpload(selectedImage);
                }

                // Handle image deletion/update in edit mode
                if (mode === "edit" && initialData?.imageStorageId) {
                    if (removedCurrentImage || selectedImage) {
                    // Delete old image from storage
                    await deleteImage({
                        storageId: initialData.imageStorageId,
                    });
                    }
                }

                if (mode === "create") {
                    const eventId = await createEvent({
                        ...values,
                        userId: user.id,
                        eventDate: values.eventDate.getTime(),
                    });
          
                    if (imageStorageId) {
                        await updateEventImage({
                            eventId,
                            storageId: imageStorageId as Id<"_storage">,
                        });
                    }
          
                    router.push(`/event/${eventId}`);
                } else {
                    // Ensure initialData exists before proceeding with update
                    if (!initialData) {
                      throw new Error("Initial event data is required for updates");
                    }
          
                    // Update event details
                    await updateEvent({
                      eventId: initialData._id,
                      ...values,
                      eventDate: values.eventDate.getTime(),
                    });
          
                    // Update image - this will now handle both adding new image and removing existing image
                    if (imageStorageId || removedCurrentImage) {
                      await updateEventImage({
                            eventId: initialData._id,
                            // If we have a new image, use its ID, otherwise if we're removing the image, pass null
                            storageId: imageStorageId
                            ? (imageStorageId as Id<"_storage">)
                            : null,
                        });
                    }

                    toast({
                        title: "Cập nhật sự kiện",
                        description: "Sự kiện của bạn đã được cập nhật thành công.",
                    });
            
                    router.push(`/event/${initialData._id}`);
                }
            } catch (error) {
                console.error("Failed to handle event:", error);
                toast({
                    variant: "destructive",
                    title: "Có lỗi xảy ra!",
                    description: "Đã có vấn đề với yêu cầu của bạn.",
                });
            }
        })
    }

    async function handleImageUpload(file: File): Promise<string | null> {
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            return storageId;
        } catch (error) {
            console.error("Failed to upload image:", error);
            return null;
        }
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Form fields */}
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên sự kiện</FormLabel>
                                <FormControl>
                                <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                         render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô tả</FormLabel>
                                <FormControl>
                                <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Địa chỉ</FormLabel>
                                <FormControl>
                                <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giờ và ngày diễn ra</FormLabel>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                value={field.value ? 
                                                    `${new Date(field.value).getHours().toString().padStart(2, '0')}:${new Date(field.value).getMinutes().toString().padStart(2, '0')}` 
                                                    : ""}
                                                onChange={(e) => {
                                                    try {
                                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                                        const newDate = new Date(field.value || new Date());
                                                        newDate.setHours(hours, minutes, 0, 0);
                                                        field.onChange(newDate);
                                                    } catch (error) {
                                                        console.log("Lỗi giờ:", error);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        {/* <p className="text-xs text-gray-500 mt-1">Chọn giờ</p> */}
                                    </div>
                                    <div>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                onChange={(e) => {
                                                    try {
                                                        // Giữ giờ hiện tại khi chỉ thay đổi ngày
                                                        const currentDate = field.value || new Date();
                                                        const newDate = new Date(e.target.value);
                                                        newDate.setHours(
                                                            currentDate.getHours(),
                                                            currentDate.getMinutes(),
                                                            0, 0
                                                        );
                                                        field.onChange(newDate);
                                                    } catch (error) {
                                                        console.log("Lỗi ngày:", error);
                                                    }
                                                }}
                                                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                            />
                                        </FormControl>
                                        {/* <p className="text-xs text-gray-500 mt-1">Chọn ngày</p> */}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá vé</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            {...field}
                                            value={field.value ? formatNumber(field.value.toString()) : ''}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/\D/g, '');
                                                field.onChange(Number(numericValue));
                                            }}
                                            className="pl-6"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="totalTickets"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số lượng vé được bán</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        {...field}
                                        value={field.value ? formatNumber(field.value.toString()) : ''}
                                        onChange={(e) => {
                                            const numericValue = e.target.value.replace(/\D/g, '');
                                            field.onChange(Number(numericValue));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Image Upload */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Hình ảnh sự kiện
                        </label>

                        <div className="mt-1 flex items-center gap-4">
                            {imagePreview || (!removedCurrentImage && currentImageUrl) ? (
                                <div className="relative w-32 aspect-square bg-gray-100 rounded-lg">
                                    <Image
                                        src={imagePreview || currentImageUrl!}
                                        alt="Preview"
                                        fill
                                        className="object-contain rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                        setSelectedImage(null);
                                        setImagePreview(null);
                                        setRemovedCurrentImage(true);
                                        if (imageInput.current) {
                                            imageInput.current.value = "";
                                        }
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    ref={imageInput}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-pink-50 file:text-pink-700
                                        hover:file:bg-pink-100"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-pastel-pink to-pastel-pink hover:from-pink-200 hover:to-pink-200 text-pink-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {mode === "create" ? "Đang tạo sự kiện..." : "Đang cập nhật sự kiện..."}
                        </>
                    ) : mode === "create" ? (
                        "Tạo sự kiện"
                    ) : (
                        "Cập nhật sự kiện"
                    )}
                </Button>
            </form>
        </Form>
    )
}

export default EventForm
