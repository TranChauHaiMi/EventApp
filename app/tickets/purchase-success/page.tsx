import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Ticket from "@/components/Ticket";

async function TicketSuccess() {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const convex = getConvexClient();
    const tickets = await convex.query(api.events.getUserTickets, { userId });
    const latestTicket = tickets[tickets.length - 1];

    if (!latestTicket) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-pink-700">
                        Mua vé thành công!
                    </h1>
                    <p className="mt-2 text-pink-700">
                        Vé của bạn đã được xác nhận và sẵn sàng để sử dụng
                    </p>
                </div>

                <Ticket ticketId={latestTicket._id} />
            </div>
        </div>
    );
}

export default TicketSuccess;