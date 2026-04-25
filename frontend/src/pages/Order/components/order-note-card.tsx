import { useFormContext } from "react-hook-form";
import type { CreateOrderFormValues } from "../schema";
import { StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const OrderNoteCard = () => {
  const { register } = useFormContext<CreateOrderFormValues>();

  return (
    <div className="flex flex-col border border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-center gap-2.5 bg-slate-50/80 px-4 py-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
          <StickyNote className="w-4 h-4 text-yellow-600" />
        </div>
        <div>
          <p className="font-bold text-[15px] text-slate-800">
            Ghi chú đơn hàng
          </p>
          <p className="text-slate-500 text-[11.5px] font-medium">
            Lưu ý thêm cho đơn hàng này
          </p>
        </div>
      </div>

      <div className="p-4">
        <Textarea
          {...register("note")}
          placeholder="Ghi chú"
          className="min-h-[100px] bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-sm resize-none"
        />
      </div>
    </div>
  );
};
