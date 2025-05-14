"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { refundEventTickets } from "@/actions/refundEventTickets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CancelEventButton({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const cancelEvent = useMutation(api.events.cancelEvent);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await refundEventTickets(eventId);
      await cancelEvent({ eventId });
      toast({
        title: "Đã hủy sự kiện",
        description: "Tất cả vé đã được hoàn tiền thành công.",
      });
      router.push("/seller/events");
    } catch (error) {
      console.error("Hủy sự kiện thất bại:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể hủy sự kiện. Vui lòng thử lại.",
      });
    } finally {
      setIsCancelling(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 min-w-20 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Ban className="w-4 h-4" />
          <span>{isCancelling ? "Đang hủy sự kiện..." : "Hủy sự kiện"}</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận hủy sự kiện</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn hủy sự kiện này không? Tất cả vé sẽ được hoàn tiền và hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isCancelling}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
