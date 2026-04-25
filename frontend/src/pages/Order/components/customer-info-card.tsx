import { CustomerSelector } from "./form-sections/customer-selector";
import { SaleSelector } from "./form-sections/sale-selector";
import { Users } from "lucide-react";

export const CustomerInfoCard = () => {
  return (
    <div className="flex flex-col border border-slate-200 rounded-2xl shadow-sm bg-white transition-all hover:shadow-md">
      <div className="flex items-center justify-between bg-slate-50/80 px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-[15px] text-slate-800">
              Thông tin hóa đơn
            </p>
            <p className="text-slate-500 text-[11.5px] font-medium">
              Chọn đối tượng cho đơn hàng này
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <CustomerSelector />
        <SaleSelector />
      </div>
    </div>
  );
};
