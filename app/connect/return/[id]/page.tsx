"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Return() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
                        <div className="mb-4 flex justify-center">
                            <CheckCircle2 className="w-16 h-16" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Tài khoản đã được kết nối!</h2>
                        <p className="text-green-100">
                            Tài khoản Stripe của bạn đã được kết nối thành công
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                                <h3 className="font-medium text-pink-900 mb-1">
                                    Tiếp theo sẽ là gì?
                                </h3>
                                <ul className="text-sm text-pink-700 space-y-2">
                                    <li>• Bạn có thể tạo và bán vé cho các sự kiện</li>
                                    <li>
                                        • Thanh toán sẽ được xử lý thông qua tài khoản Stripe của bạn
                                    </li>
                                    <li>• Tiền sẽ được chuyển tự động</li>
                                </ul>
                            </div>

                            <Link
                                href="/seller"
                                className="w-full bg-pastel-pink text-pink-700 text-center py-3 px-4 rounded-lg font-medium hover:bg-pink-200 transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                Đi đến Quản lý bán vé
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}