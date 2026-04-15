import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ImportInventoryFormValues } from "../schema";
import type { IProductUnit } from "@/types/product";
import { Textarea } from "@/components/ui/textarea";

interface ImportCardProps {
  form: UseFormReturn<ImportInventoryFormValues>;
  units: IProductUnit[];
  isImportMode?: boolean;
}

export const ImportCard = ({ form, units, isImportMode }: ImportCardProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  if (!isImportMode) return null;

  return (
    <div className="border rounded shadow-sm bg-white">
      <div className="flex flex-col bg-gray-100 p-3 rounded-t">
        <p className="font-bold text-md">Nhập kho</p>
        <p className="text-muted-foreground text-xs">
          Chọn đơn vị và số lượng cần nhập
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Chọn đơn vị */}
        <div className="flex flex-col">
          <p className="text-sm font-medium mb-1">
            Đơn vị tính <span className="text-red-500">*</span>
          </p>
          <Controller
            name="unitName"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className={errors.unitName ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {units.map((u, index) => (
                    <SelectItem
                      key={u.unitName || index}
                      value={u.unitName}
                      className="capitalize"
                    >
                      {u.unitName} (x{u.exchangeValue})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.unitName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.unitName.message}
            </p>
          )}
        </div>

        {/* Số lượng */}
        <div className="flex flex-col">
          <p className="text-sm font-medium mb-1">
            Số lượng <span className="text-red-500">*</span>
          </p>
          <Input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            className={errors.quantity ? "border-red-500" : ""}
          />
          {errors.quantity && (
            <p className="text-xs text-red-500 mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {/* Ghi chú */}
        <div className="flex flex-col">
          <p className="text-sm font-medium mb-1">Ghi chú</p>
          <Textarea
            {...register("note")}
            placeholder="VD: Nhập lô hàng từ nhà cung cấp ABC"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};
