'use client';

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { XCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function ReleaseTicket({
    eventId,
    waitingListId,
}: {
    eventId: Id<"events">;
    waitingListId: Id<"waitingList">;
}) {
    const [isReleasing, setIsReleasing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const releaseTicket = useMutation(api.waitingList.releaseTicket);

    const handleRelease = async () => {
        try {
            setIsReleasing(true);
            await releaseTicket({
                eventId,
                waitingListId,
            });
            setIsOpen(false);
        } catch (error) {
            console.error("Error releasing ticket:", error);
        } finally {
            setIsReleasing(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 bg-amber-100 text-red-700 rounded-lg hover:.bg-amber-200 transition">
                    <XCircle className="w-4 h-4" />
                    Hủy Giữ Vé
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xác nhận hủy giữ vé</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn hủy giữ vé này không? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isReleasing}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleRelease}
                        disabled={isReleasing}
                    >
                        {isReleasing ? "Đang hủy giữ vé..." : "Xác nhận hủy"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ReleaseTicket
