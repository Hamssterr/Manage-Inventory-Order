import { Controller, useFormContext } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import type { ComboFormValues } from "../schema";

export const StatusCard = () => {
  const { control } = useFormContext<ComboFormValues>();

  return (
    <div className="border rounded-xl shadow-sm bg-white">
      <div className="flex flex-col bg-gray-100 p-3 rounded-t">
        <p className="font-bold text-md">Trạng thái</p>
        <p className="text-muted-foreground text-xs">Cấu hình bán hàng</p>
      </div>

      <div className="p-4 space-y-3">
        <label className="flex gap-3 items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-slate-50 transition-colors">
          <div>
            <p className="text-sm font-medium">Sản phẩm kinh doanh (Combo)</p>
            <p className="text-xs text-muted-foreground">
              Cho phép hiển thị để kinh doanh trên App Sale
            </p>
          </div>
          <Controller
            name="isSale"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </label>
      </div>
    </div>
  );
};
