"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import TicketCard from "@/components/TicketCard";
import { Ticket } from "lucide-react";

function Ticekts() {
    const { user } = useUser();
    const tickets = useQuery(api.events.getUserTickets, {
        userId: user?.id ?? "",
    });

    if (!tickets) return null;

    const validTickets = tickets.filter((t) => t.status === "valid");
    const otherTickets = tickets.filter((t) => t.status !== "valid");

    const upcomingTickets = validTickets.filter(
        (t) => t.event && t.event.eventDate > Date.now()
    );
    const pastTickets = validTickets.filter(
        (t) => t.event && t.event.eventDate <= Date.now()
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-pink-700">Vé của tôi</h1>
                        <p className="mt-2 text-pink-700">
                            Quản lý vé xem tất cả vé của bạn tại đây
                        </p>
                    </div>
                     <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-pastel-pink-100">
                        <div className="flex items-center gap-2 text-pink-700">
                            <span className="font-medium">
                                Tổng số vé {tickets.length}
                            </span>
                            <Ticket className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {upcomingTickets.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-pink-700 mb-4">
                            Sự kiện sắp diễn ra
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingTickets.map((ticket) => (
                                <TicketCard key={ticket._id} ticketId={ticket._id} />
                            ))}
                        </div>
                    </div>
                )}

                {pastTickets.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-pink-700 mb-4">
                            Sự kiện đã diễn ra
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pastTickets.map((ticket) => (
                                <TicketCard key={ticket._id} ticketId={ticket._id} />
                            ))}
                        </div>
                    </div>
                )}

                {otherTickets.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-pink-700 mb-4">
                            Các vé khác
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherTickets.map((ticket) => (
                                <TicketCard key={ticket._id} ticketId={ticket._id} />
                            ))}
                        </div>
                    </div>
                )}

                {tickets.length === 0 && (
                    <div className="text-center py-12">
                        <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">
                            Chưa có vé nào
                        </h3>
                        <p className="text-gray-600 mt-1">
                            Khi bạn mua vé, chúng sẽ hiển thị tại đây
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Ticekts
