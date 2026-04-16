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
    <div className="border rounded shadow-sm bg-white">
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

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground px-1 uppercase">
          <div className="col-span-3">Tên đơn vị</div>
          <div className="col-span-3">Giá trị quy đổi</div>
          <div className="col-span-3">Giá mặc định</div>
          <div className="col-span-2 text-center">Mặc định</div>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 items-start gap-2">
            <div className="col-span-3">
              <Controller
                control={control}
                name={`units.${index}.unitName`}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={
                        errors.units?.[index]?.unitName ? "border-red-500" : ""
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
                )}
              />
            </div>

            <div className="col-span-3">
              <Input
                type="number"
                {...register(`units.${index}.exchangeValue`)}
                className={
                  errors.units?.[index]?.exchangeValue ? "border-red-500" : ""
                }
              />
            </div>

            <div className="col-span-3">
              <Controller
                control={control}
                name={`units.${index}.priceDefault`}
                render={({ field: { onChange, value, ref } }) => (
                  <div className="relative">
                    <Input
                      ref={ref}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, "");
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
                  </div>
                )}
              />
            </div>

            <div className="col-span-2 flex justify-center mt-2">
              <Controller
                control={control}
                name={`units.${index}.isDefault`}
                render={({ field: { value } }) => (
                  <input
                    type="radio"
                    className="h-4 w-4 cursor-pointer accent-primary"
                    checked={!!value}
                    onChange={() => handleSetDefault(index)}
                  />
                )}
              />
            </div>

            <div className="col-span-1 flex justify-end">
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
