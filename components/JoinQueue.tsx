'use client';

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import Spinner from "./Spinner";
import { WAITING_LIST_STATUS } from "@/convex/constants";
import { Clock, OctagonXIcon } from "lucide-react";

function JoinQueue({
    eventId,
    userId,
}: {
    eventId: Id<"events">;
    userId: string;
}) {
    const { toast } = useToast();
    const joinWaitingList = useMutation(api.events.joinWaitingList);
    const queuePosition = useQuery(api.waitingList.getQueuePosition, {
        eventId,
        userId,
    });
    const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
        eventId,
        userId,
    });
    const availability = useQuery(api.events.getEventAvailability, { eventId });
    const event = useQuery(api.events.getById, { eventId });

    const isEventOwner = userId === event?.userId;

    const handleJoinQueue = async () => {
        try {
            const result = await joinWaitingList({ eventId, userId });
            if (result.success) {
                console.log("Thêm vào danh sách chờ thành công");
                toast({
                    title: result.message,
                    duration: 5000,
                });
            }
        } catch (error) {
            if (
                error instanceof ConvexError &&
                error.message.includes("Bạn đã tham gia danh sách chờ quá nhiều lần")
            ) {
                toast({
                variant: "destructive",
                title: "Chậm lại nào!",
                description: error.data,
                duration: 5000,
                });
            } else {
                console.error("Lỗi khi tham gia danh sách chờ:", error);
                toast({
                variant: "destructive",
                title: "Đã xảy ra lỗi.",
                description: "Có lỗi xảy ra khi tham gia danh sách chờ. Vui lòng thử lại sau.",
                });
            }
        }
    };

    if (queuePosition === undefined || availability === undefined || !event) {
        return <Spinner />;
    }
    
    if (userTicket) {
        return null;
    }

    const isPastEvent = event.eventDate < Date.now();

    return (
        <div>
            {(!queuePosition ||
                queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
                (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
                    queuePosition.offerExpiresAt &&
                    queuePosition.offerExpiresAt <= Date.now())) && (
                <>
                    {isEventOwner ? (
                        <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
                            <OctagonXIcon className="w-5 h-5" />
                            <span>Bạn không thể mua vé sự kiện do chính bạn tổ chức</span>
                        </div>
                    ) : isPastEvent ? (
                        <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                            <Clock className="w-5 h-5" />
                            <span>Sự kiện đã kết thúc</span>
                        </div>
                    ) : availability.purchasedCount >= availability?.totalTickets ? (
                        <div className="text-center p-4">
                            <p className="text-lg font-semibold text-red-600">
                                Xin lỗi, sự kiện này đã hết vé
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handleJoinQueue}
                            disabled={isPastEvent || isEventOwner}
                            className="w-full bg-pastel-pink text-pink-700 px-6 py-3 rounded-lg font-medium hover:bg-pink-200 transition-colors duration-200 shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Mua Vé
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

export default JoinQueue
