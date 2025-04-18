"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { createStripeConnectAccountLink } from "@/actions/createStripeConnectAccountLink";

export default function Refresh() {
    const params = useParams();
    const connectedAccountId = params.id as string;
    const [accountLinkCreatePending, setAccountLinkCreatePending] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const createAccountLink = async () => {
            if (connectedAccountId) {
                setAccountLinkCreatePending(true);
                setError(false);
                try {
                    const { url } =
                        await createStripeConnectAccountLink(connectedAccountId);
                    window.location.href = url;
                } catch (error) {
                    console.error("Error creating account link:", error);
                    setError(true);
                }
                setAccountLinkCreatePending(false);
            }
        };

        createAccountLink();
    }, [connectedAccountId]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">Thiết lập tài khoản</h2>
                        <p className="text-blue-100">
                            Hoàn tất thiết lập tài khoản để bắt đầu bán vé
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error ? (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-red-900 mb-1">
                                    Đã xảy ra lỗi
                                </h3>
                                <p className="text-sm text-red-700">
                                    Chúng tôi không thể làm mới liên kết tài khoản của bạn. Vui lòng thử lại
                                    hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
                                </p>
                            </div>
                        </div>
                        ) : (
                            <div className="text-center py-8">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">
                                {accountLinkCreatePending
                                    ? "Đang tạo liên kết tài khoản..."
                                    : "Đang chuyển hướng đến Stripe..."}
                                </p>
                                {connectedAccountId && (
                                <p className="text-xs text-gray-500 mt-4">
                                    Mã tài khoản: {connectedAccountId}
                                </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}