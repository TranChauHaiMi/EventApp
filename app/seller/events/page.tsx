import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SellerEventList from "@/components/SellerEventList";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default async function SellerEventsPage() {
    const { userId } = await auth();
    if (!userId) redirect("/");

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/seller"
                                className="text-pink-500 hover:text-pink-700 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-pink-700">Sự kiện của tôi</h1>
                                <p className="mt-1 text-pink-700">
                                    Quản lý danh sách các sự kiện và theo dõi doanh thu
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/seller/new-event"
                            className="flex items-center justify-center gap-2 bg-pastel-pink text-pink-700 px-4 py-2 rounded-lg hover:bg-pink-200 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Tạo sự kiện
                        </Link>
                    </div>
                </div>

                {/* Event List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <SellerEventList />
                </div>
            </div>
        </div>
    );
}