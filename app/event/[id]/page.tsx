'use client';

import EventCard from "@/components/EventCard";
import JoinQueue from "@/components/JoinQueue";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

function EventPage() {
    const { user } = useUser();
    const params = useParams();
    const event = useQuery(api.events.getById, {
        eventId: params.id as Id<"events">,
    });
    const availability = useQuery(api.events.getEventAvailability, {
        eventId: params.id as Id<"events">,
    });
    const imageUrl = useStorageUrl(event?.imageStorageId);

    if (!event || !availability) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Event Details */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Event Image */}
                    {imageUrl && (
                        <div className="aspect-[21/9] relative w-full">
                            <Image
                                src={imageUrl}
                                alt={event.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Event Details in depth */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Column - Event Details */}
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                        {event.name}
                                    </h1>
                                    <p className="text-lg text-gray-600">{event.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <CalendarDays className="w-5 h-5 mr-2 text-pink-700" />
                                            <span className="text-sm font-medium">Giờ và ngày diễn ra</span>
                                        </div>
                                        <p className="text-gray-900">
                                            {new Date(event.eventDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) + ' - ' + new Date(event.eventDate).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <MapPin className="w-5 h-5 mr-2 text-pink-700" />
                                            <span className="text-sm font-medium">Địa chỉ</span>
                                        </div>
                                        <p className="text-gray-900">{event.location}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <Ticket className="w-5 h-5 mr-2 text-pink-700" />
                                            <span className="text-sm font-medium">Giá vé</span>
                                        </div>
                                        <p className="text-gray-900">{event.price.toLocaleString('vi-VN')}đ</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <Users className="w-5 h-5 mr-2 text-pink-700" />
                                            <span className="text-sm font-medium">Tình trạng vé</span>
                                        </div>
                                        <p className="text-gray-900">
                                            Còn {availability.totalTickets - availability.purchasedCount}{" "}
                                            / {availability.totalTickets} vé
                                        </p>
                                    </div>
                                </div>

                                {/* Additional Event Information */}
                                <div className="bg-pink-50 border border-pink-100 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-pink-900 mb-2">
                                        Chú thích sự kiện
                                    </h3>
                                    <ul className="space-y-2 text-pink-700">
                                        <li>• Vui lòng có mặt trước giờ sự kiện bắt đầu 30 phút</li>
                                        <li>• Vé đã mua sẽ không được hoàn trả (trừ khi có lỗi xảy ra từ phía tổ chức sự kiện)</li>
                                        <li>• Giới hạn độ tuổi: 18+</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column - Ticket Purchase Card */}
                            <div>
                                <div className="sticky top-8 space-y-4">
                                    <EventCard eventId={params.id as Id<"events">} />

                                    {user ? (
                                        <JoinQueue
                                            eventId={params.id as Id<"events">}
                                            userId={user.id}
                                        />
                                    ) : (
                                        <SignInButton>
                                            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                                                Đăng nhập để mua vé
                                            </Button>
                                        </SignInButton>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventPage
