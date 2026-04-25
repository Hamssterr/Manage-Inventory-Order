import { useFormContext, useWatch } from "react-hook-form";
import type { CreateOrderFormValues } from "../schema";
import { formatCurrency } from "@/utils/helper";
import { Calculator, CreditCard, Receipt } from "lucide-react";

export const OrderSummaryCard = () => {
  const { control } = useFormContext<CreateOrderFormValues>();
  
  // Theo dõi mảng items để tính toán ngay lập tức
  const items = useWatch({
    control,
    name: "items",
  }) || [];

  // Tính toán các chỉ số
  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const grandTotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + (qty * price);
  }, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-blue-600" />
        <span className="font-bold text-[15px] text-slate-800">Tổng kết đơn hàng</span>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Số lượng */}
        <div className="flex items-center justify-between text-[13.5px]">
          <div className="flex items-center gap-2 text-slate-500">
            <Receipt className="w-4 h-4 opacity-70" />
            <span>Tổng số lượng sản phẩm:</span>
          </div>
          <span className="font-semibold text-slate-700">{totalQuantity} SP</span>
        </div>

        {/* Phân tách */}
        <div className="border-t border-dashed border-slate-100 my-2" />

        {/* Tổng tiền */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-[13.5px] mb-1">
            <CreditCard className="w-4 h-4 opacity-70" />
            <span>Tổng thành tiền:</span>
          </div>
          <div className="text-2xl font-black text-blue-600 tabular-nums">
            {formatCurrency(grandTotal)}
            <span className="text-sm font-bold ml-1 uppercase">đ</span>
          </div>
        </div>

        {/* Gợi ý / Trạng thái */}
        {grandTotal === 0 && (
          <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
            <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
              Vui lòng thêm sản phẩm và chọn đơn vị tính để xem tổng số tiền cần thanh toán.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
