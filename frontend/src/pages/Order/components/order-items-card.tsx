import { useFieldArray, useFormContext } from "react-hook-form";
import type { CreateOrderFormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, ShoppingBag } from "lucide-react";
import { ItemsSelector } from "./items-selector/items-selector";

export const OrderItemsCard = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateOrderFormValues>();

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <div className="flex flex-col border border-slate-200 rounded-2xl shadow-sm bg-white transition-all hover:shadow-md">
      <div className="flex items-center justify-between bg-slate-50/80 px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-[15px] text-slate-800">
              Danh sách sản phẩm
            </p>
            <p className="text-slate-500 text-[11.5px] font-medium">
              Thêm các mặt hàng vào đơn hàng này
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8.5 gap-1.5 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
          onClick={() =>
            append({
              productId: "",
              unitName: "",
              quantity: 1,
              note: "",
            })
          }
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="text-[13px] font-semibold">Thêm sản phẩm</span>
        </Button>
      </div>

      <div className="p-3">
        {/* Header Bảng */}
        <div className="hidden md:grid grid-cols-12 px-3 py-2.5 mb-1.5 bg-slate-50/50 rounded-lg gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider items-center">
          <div className="col-span-4">Tên sản phẩm</div>
          <div className="col-span-2">Đơn vị tính</div>
          <div className="col-span-1 text-center font-bold">SL</div>
          <div className="col-span-2 text-right">Đơn giá</div>
          <div className="col-span-2 text-right">Thành tiền</div>
          <div className="col-span-1 text-center"></div>
        </div>

        {/* Nội dung Bảng */}
        <div className="space-y-1">
          {fields.map((field, index) => (
            <ItemsSelector
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
            />
          ))}
        </div>

        {/* Trạng thái trống */}
        {fields.length === 0 && (
          <div className="py-14 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-slate-300" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 font-bold text-[14px]">
                Giỏ hàng đang trống
              </p>
              <p className="text-slate-400 text-[12px]">
                Vui lòng nhấn nút "Thêm sản phẩm" để bắt đầu
              </p>
            </div>
          </div>
        )}

        {errors.items?.root?.message && (
          <p className="text-red-500 text-[13px] mt-4 p-3 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {errors.items.root.message}
          </p>
        )}
      </div>
    </div>
  );
};
