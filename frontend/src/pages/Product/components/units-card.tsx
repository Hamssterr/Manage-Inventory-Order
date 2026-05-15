import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import type { ComboFormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BASE_UNIT_OPTIONS } from "@/constants/category-value";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/helper";

export const UnitsCard = () => {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ComboFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });

  const handleSetDefault = (selectedIndex: number) => {
    fields.forEach((_, index) => {
      setValue(`units.${index}.isDefault`, index === selectedIndex, {
        shouldValidate: true,
      });
    });
  };

  return (
    <div className="border rounded-xl shadow-sm bg-white">
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-t">
        <div>
          <p>Thiết lập đơn vị</p>
          <p className="text-muted-foreground text-xs">
            Cấu hình quy đổi và giá bán
          </p>
        </div>
        <Button
          onClick={() =>
            append({
              unitName: "",
              exchangeValue: 1,
              priceDefault: 0,
              tax: 0,
              salaryPerUnit: 0,
              isDefault: false,
            })
          }
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Thêm đơn vị
        </Button>
      </div>

      <div className="p-4 space-y-6 lg:space-y-4">
        {/* Tiêu đề cột - Chỉ hiển thị trên Desktop */}
        <div className="hidden lg:grid grid-cols-12 text-[10px] font-semibold text-muted-foreground px-1 uppercase gap-2">
          <div className="col-span-2">Tên đơn vị</div>
          <div className="col-span-2">Quy đổi</div>
          <div className="col-span-2 ml-1">Giá bán</div>
          <div className="col-span-2 ml-1">Thuế</div>
          <div className="col-span-2 ml-1">Lương</div>
          <div className="col-span-1 text-center">Mặc định</div>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative  flex flex-col lg:grid lg:grid-cols-12 items-start gap-4 lg:gap-2 p-6 lg:p-0 border lg:border-0 rounded-xl lg:rounded-none bg-slate-50/50 lg:bg-transparent"
          >
            {/* Nút xóa trên Mobile */}
            <div className="absolute top-2 right-2 lg:hidden">
              <Button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Tên đơn vị & Quy đổi */}
            <div className="grid grid-cols-2 lg:contents gap-4 w-full">
              <div className="col-span-1 lg:col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block lg:hidden">
                  Tên đơn vị
                </label>
                <Controller
                  control={control}
                  name={`units.${index}.unitName`}
                  render={({ field }) => (
                    <div>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={
                            errors.units?.[index]?.unitName
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {BASE_UNIT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.units?.[index]?.unitName && (
                        <p className="text-red-500 text-[10px] mt-1 leading-tight">
                          {errors.units?.[index]?.unitName?.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="col-span-1 lg:col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block lg:hidden">
                  Quy đổi
                </label>
                <Input
                  type="number"
                  {...register(`units.${index}.exchangeValue`, {
                    valueAsNumber: true,
                  })}
                  className={
                    errors.units?.[index]?.exchangeValue ? "border-red-500" : ""
                  }
                />
                {errors.units?.[index]?.exchangeValue && (
                  <p className="text-red-500 text-[10px] mt-1 leading-tight">
                    {errors.units?.[index]?.exchangeValue?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Giá bán & Thuế */}
            <div className="grid grid-cols-2 lg:contents gap-4 w-full">
              <div className="col-span-1 lg:col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block lg:hidden">
                  Giá bán
                </label>
                <Controller
                  control={control}
                  name={`units.${index}.priceDefault`}
                  render={({ field: { onChange, value, ref } }) => (
                    <div className="relative">
                      <Input
                        ref={ref}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9]/g,
                            "",
                          );
                          onChange(rawValue === "" ? "" : Number(rawValue));
                        }}
                        value={formatCurrency(value)}
                        type="text"
                        inputMode="numeric"
                        className={
                          errors.units?.[index]?.priceDefault
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors.units?.[index]?.priceDefault && (
                        <p className="text-red-500 text-[10px] mt-1 leading-tight">
                          {errors.units?.[index]?.priceDefault?.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="col-span-1 lg:col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block lg:hidden">
                  Thuế
                </label>
                <Controller
                  control={control}
                  name={`units.${index}.tax`}
                  render={({ field: { onChange, value, ref } }) => (
                    <div className="relative">
                      <Input
                        ref={ref}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9]/g,
                            "",
                          );
                          onChange(rawValue === "" ? "" : Number(rawValue));
                        }}
                        value={formatCurrency(value)}
                        type="text"
                        inputMode="numeric"
                        className={
                          errors.units?.[index]?.tax ? "border-red-500" : ""
                        }
                      />
                      {errors.units?.[index]?.tax && (
                        <p className="text-red-500 text-[10px] mt-1 leading-tight">
                          {errors.units?.[index]?.tax?.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Lương & Mặc định */}
            <div className="grid grid-cols-2 lg:contents gap-4 w-full">
              <div className="col-span-1 lg:col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block lg:hidden">
                  Lương
                </label>
                <Controller
                  control={control}
                  name={`units.${index}.salaryPerUnit`}
                  render={({ field: { onChange, value, ref } }) => (
                    <div className="relative">
                      <Input
                        ref={ref}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9]/g,
                            "",
                          );
                          onChange(rawValue === "" ? "" : Number(rawValue));
                        }}
                        value={formatCurrency(value)}
                        type="text"
                        inputMode="numeric"
                        className={
                          errors.units?.[index]?.salaryPerUnit
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors.units?.[index]?.salaryPerUnit && (
                        <p className="text-red-500 text-[10px] mt-1 leading-tight">
                          {errors.units?.[index]?.salaryPerUnit?.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="col-span-1 lg:col-span-1 flex flex-col items-center lg:mt-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block lg:hidden">
                  Mặc định
                </label>
                <Controller
                  control={control}
                  name={`units.${index}.isDefault`}
                  render={({ field: { value } }) => (
                    <input
                      type="radio"
                      className="h-4 w-4 cursor-pointer accent-primary mt-2 lg:mt-0"
                      checked={!!value}
                      onChange={() => handleSetDefault(index)}
                    />
                  )}
                />
              </div>
            </div>

            {/* Nút xóa trên Desktop */}
            <div className="hidden lg:flex col-span-1 justify-end">
              <Button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
