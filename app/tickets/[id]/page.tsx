"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { redirect, useParams } from "next/navigation";
import Ticket from "@/components/Ticket";
import Link from "next/link";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useEffect, useRef } from "react";
import html2canvas from "html2canvas";

function MyTicket() {
    const params = useParams();
    const { user } = useUser();
    const ticketRef = useRef<HTMLDivElement>(null);
    const ticket = useQuery(api.tickets.getTicketWithDetails, {
        ticketId: params.id as Id<"tickets">,
    });

    // Thêm trạng thái loading
    const isLoading = user === undefined || ticket === undefined;

    useEffect(() => {
        if (isLoading) return; // Chờ dữ liệu load xong
        if (!user) {
          redirect("/");
        }
    
        if (!ticket || ticket.userId !== user.id) {
          redirect("/tickets");
        }
    
        if (!ticket.event) {
          redirect("/tickets");
        }
    }, [user, ticket, isLoading]);
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500 text-lg font-medium">Đang tải dữ liệu vé...</div>
            </div>
        );
    }

    if (!ticket || !ticket.event) {
        return null;
    }

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        
        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
            });
            
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `ve-${ticket.event!.name.replace(/\s+/g, '-').toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Lỗi khi tải xuống vé:", error);
            alert("Không thể tải xuống vé. Vui lòng thử lại sau.");
        }
    };

    const handleShare = async () => {
        if (!ticketRef.current || !ticket.event) return;
        
        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
            });
            
            const image = canvas.toDataURL("image/png");
            
            if (navigator.share) {
                // Sử dụng Web Share API nếu trình duyệt hỗ trợ
                const blob = await (await fetch(image)).blob();
                const file = new File([blob], `ve-${ticket.event.name.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
                
                try {
                    await navigator.share({
                        title: `Vé sự kiện: ${ticket.event.name}`,
                        text: `Vé của tôi cho sự kiện ${ticket.event.name} vào ngày ${new Date(ticket.event.eventDate).toLocaleDateString()}`,
                        files: [file]
                    });
                } catch (error) {
                    // Fallback cho trường hợp không hỗ trợ chia sẻ file
                    await navigator.share({
                        title: `Vé sự kiện: ${ticket.event.name}`,
                        text: `Vé của tôi cho sự kiện ${ticket.event.name} vào ngày ${new Date(ticket.event.eventDate).toLocaleDateString()}`
                    });
                }
            } else {
                // Fallback khi trình duyệt không hỗ trợ Web Share API
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head>
                                <title>Chia sẻ vé: ${ticket.event.name}</title>
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <style>
                                    body { display: flex; flex-direction: column; align-items: center; font-family: Arial, sans-serif; padding: 20px; }
                                    img { max-width: 100%; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                                    p { margin-top: 20px; }
                                </style>
                            </head>
                            <body>
                                <h2>Vé sự kiện của bạn</h2>
                                <img src="${image}" alt="Vé sự kiện" />
                                <p>Bạn có thể lưu hình ảnh này và chia sẻ qua email hoặc các ứng dụng nhắn tin.</p>
                            </body>
                        </html>
                    `);
                }
            }
        } catch (error) {
            console.error("Lỗi khi chia sẻ vé:", error);
            alert("Không thể chia sẻ vé. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 space-y-8">
                    {/* Navigation and Actions */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/tickets"
                            className="flex items-center text-pink-600 hover:text-pink-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại Vé của tôi
                        </Link>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                            >
                                <Download className="w-4 h-4" />
                                <span className="text-sm">Lưu</span>
                            </button>
                            <button 
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm">Chia sẻ</span>
                            </button>
                        </div>
                    </div>

                    {/* Event Info Summary */}
                    <div
                        className={`bg-white p-6 rounded-lg shadow-sm border ${ticket.event.is_cancelled ? "border-red-200" : "border-gray-100"}`}
                    >
                        <h1 className="text-2xl font-bold text-gray-900">
                            {ticket.event.name}
                        </h1>
                        <p className="mt-1 text-gray-600">
                            {new Date(ticket.event.eventDate).toLocaleDateString()} at{" "}
                            {ticket.event.location}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    ticket.event.is_cancelled
                                        ? "bg-red-50 text-red-700"
                                        : "bg-pink-50 text-pink-700"
                                }`}
                            >
                                {ticket.event.is_cancelled ? "Đã hủy" : "Vé hợp lệ"}
                            </span>
                            <span className="text-sm text-gray-500">
                                Đã mua vào ngày {new Date(ticket.purchasedAt).toLocaleDateString()}
                            </span>
                        </div>
                        {ticket.event.is_cancelled && (
                            <p className="mt-4 text-sm text-red-600">
                                Sự kiện này đã bị hủy. Việc hoàn tiền sẽ được xử lý nếu chưa được thực hiện trước đó.
                            </p>
                        )}
                    </div>
                </div>

                {/* Ticket Component with ref */}
                <div ref={ticketRef}>
                    <Ticket ticketId={ticket._id} />
                </div>

                {/* Additional Information */}
                <div
                    className={`mt-8 rounded-lg p-4 ${
                        ticket.event.is_cancelled
                        ? "bg-red-50 border-red-100 border"
                        : "bg-pink-50 border-pink-100 border"
                    }`}
                >
                    <h3
                        className={`text-sm font-medium ${
                        ticket.event.is_cancelled ? "text-red-900" : "text-pink-700"
                        }`}
                    >
                        Cần trợ giúp?
                    </h3>
                    <p
                        className={`mt-1 text-sm ${
                        ticket.event.is_cancelled ? "text-red-700" : "text-pink-700"
                        }`}
                    >
                        {ticket.event.is_cancelled
                        ? "Nếu bạn có thắc mắc về việc hoàn tiền hoặc hủy sự kiện, vui lòng liên hệ đội ngũ hỗ trợ của chúng tôi qua địa chỉ myevent@gmail.com"
                        : "Nếu bạn gặp sự cố với vé của mình, vui lòng liên hệ đội ngũ hỗ trợ của chúng tôi qua địa chỉ myevent@gmail.com"}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default MyTicket
