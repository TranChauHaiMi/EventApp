'use client';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel'
import { useStorageUrl } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { CalendarDays, Check, CircleArrowRight, LoaderCircle, MapPin, PencilIcon, StarIcon, Ticket, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PurchaseTicket from './PurchaseTicket';

function EventCard({ eventId }: { eventId: Id<"events"> }) {
    const { user } = useUser();
    const router = useRouter();
    const event = useQuery(api.events.getById, { eventId });
    const availability = useQuery(api.events.getEventAvailability, { eventId });
    const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
        eventId,
        userId: user?.id ?? "",
    });

    const queuePosition = useQuery(api.waitingList.getQueuePosition, {
        eventId,
        userId: user?.id ?? "",
    });

    const imageUrl = useStorageUrl(event?.imageStorageId);

    if (!event || !availability) {
        return null;
    }
    
    const isPastEvent = event.eventDate < Date.now();
    const isEventOwner = user?.id === event?.userId;

    const renderQueuePosition = () => {
        if (!queuePosition || queuePosition.status !== "waiting") return null;

        if (availability.purchasedCount >= availability.totalTickets) {
            return (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                        <Ticket className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">Sự kiện này đã hết vé</span>
                    </div>
                </div>
            );
        }

        if (queuePosition.position === 2) {
            return (
                <div className="flex flex-col lg:flex-row items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center">
                        <CircleArrowRight className="w-5 h-5 text-amber-500 mr-2" />
                        <span className="text-amber-700 font-medium">
                            Bạn là người tiếp theo trong hàng chờ!! (Vị trí hàng chờ:{" "}
                            {queuePosition.position})
                        </span>
                    </div>
                    <div className="flex items-center">
                        <LoaderCircle className="w-4 h-4 mr-1 animate-spin text-amber-500" />
                        <span className="text-amber-600 text-sm">Đang chờ vé</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-100">
                <div className="flex items-center">
                    <LoaderCircle className="w-4 h-4 mr-2 animate-spin text-pink-500" />
                    <span className="text-pinke-700">Vị trí trong hàng chờ</span>
                </div>
                <span className="bg-blue-100 text-pink-700 px-3 py-1 rounded-full font-medium">
                    #{queuePosition.position}
                </span>
            </div>
        );
    };

    const renderTicketStatus = () => {
        if (!user) return null;

        if (isEventOwner) {
            return (
                <div className="mt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/seller/events/${eventId}/edit`);
                        }}
                        className="w-full bg-pastel-pink text-pink-700 px-6 py-3 rounded-lg font-medium hover:bg-pink-200 transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
                    >
                        <PencilIcon className="w-5 h-5" />
                        Chỉnh sửa sự kiện
                    </button>
                </div>
            );
        }

        if (userTicket) {
            return (
                <div className="mt-4 flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-100">
                    <div className="flex items-center">
                        <Check className="w-5 h-5 text-pink-700 mr-2" />
                        <span className="text-pink-800 font-medium">
                            Bạn đã mua vé!
                        </span>
                    </div>
                    <button
                        onClick={() => router.push(`/tickets/${userTicket._id}`)}
                        className="text-sm bg-pastel-pink hover:bg-pink-200 text-pink-700 px-3 py-1.5 rounded-full font-medium shadow-sm transition-colors duration-200 flex items-center gap-1"
                    >
                        Xem vé
                    </button>
                </div>
            );
        }

        if (queuePosition) {
            return (
                <div className="mt-4">
                    {queuePosition.status === "offered" && (
                        <PurchaseTicket eventId={eventId} />
                    )}

                    {renderQueuePosition()}
                    {queuePosition.status === "expired" && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <span className="text-red-700 font-medium flex items-center">
                                <XCircle className="w-5 h-5 mr-2" />
                                Thời gian mua vé đã hết
                            </span>
                        </div>
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div
            onClick={() => router.push(`/event/${eventId}`)}
            className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden relative flex flex-col h-full ${
                isPastEvent ? "opacity-75 hover:opacity-100" : ""
            }`}
        >
            {/* Event Image */}
            {imageUrl && (
                <div className="relative w-full h-48">
                    <Image
                        src={imageUrl}
                        alt={event.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
            )}

            {/* Nội dung card */}
            <div className={`p-6 ${imageUrl ? "relative" : ""} flex-1 flex flex-col`}> 
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex flex-col items-start gap-2">
                            {isEventOwner && (
                                <span className="inline-flex items-center gap-1 bg-pastel-pink text-pink-700 px-2 py-1 rounded-full text-xs font-medium">
                                    <StarIcon className="w-3 h-3" />
                                    Sự kiện của bạn
                                </span>
                            )}
                            <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
                        </div>
                        {isPastEvent && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                                Sự kiện đã diễn ra
                            </span>
                        )}
                    </div>

                    {/* Price Tag */}
                    <div className="flex flex-col items-end gap-2 ml-4">
                        <span
                            className={`px-4 py-1.5 font-semibold rounded-full ${
                                isPastEvent
                                ? "bg-gray-50 text-gray-500"
                                : "bg-pink-50 text-pink-700"
                            }`}
                        >
                            {event.price.toLocaleString('vi-VN')}đ
                        </span>
                        {availability.purchasedCount >= availability.totalTickets && (
                            <span className="px-4 py-1.5 bg-red-50 text-red-700 font-semibold rounded-full text-sm">
                                Hết vé
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{event.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                        <CalendarDays className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                            {new Date(event.eventDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) + ' - ' + new Date(event.eventDate).toLocaleDateString()} {isPastEvent && "(Đã kết thúc)"}
                        </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                        <Ticket className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                            {availability.totalTickets - availability.purchasedCount} /{" "}
                            {availability.totalTickets} vé
                            {!isPastEvent && availability.activeOffers > 0 && (
                                <span className="text-amber-600 text-sm ml-2">
                                    ({availability.activeOffers} người đang mua vé)
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                <p className="mt-4 text-gray-600 text-sm line-clamp-2">
                    {event.description}
                </p>
            </div>

            {/* Nút ở dưới cùng card */}
            {!isPastEvent && (
                <div className="p-6 pt-0" onClick={(e) => e.stopPropagation()}>
                    {renderTicketStatus()}
                </div>
            )}
        </div>
    )
}

export default EventCard
