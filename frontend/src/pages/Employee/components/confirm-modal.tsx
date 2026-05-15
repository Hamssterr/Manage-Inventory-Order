import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  confirmText?: string;
  variant?: "danger" | "warning" | "primary";
}
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
  confirmText = "Xác nhận",
  variant = "danger",
}: ConfirmModalProps) => {
  const buttonColors = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    primary: "bg-slate-900 hover:bg-slate-800 text-white",
  };
  const iconColors = {
    danger: "text-red-500 bg-red-50",
    warning: "text-amber-500 bg-amber-50",
    primary: "text-blue-500 bg-blue-50",
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isLoading && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className={`p-3 rounded-full shrink-0 ${iconColors[variant]}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-800">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-1 text-slate-500">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-4 border-t border-slate-100 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={buttonColors[variant]}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Đang xử lý..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
