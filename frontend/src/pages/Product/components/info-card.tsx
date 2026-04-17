import { Input } from "@/components/ui/input";
import { Controller, useFormContext } from "react-hook-form";
import type { ComboFormValues } from "../schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BASE_UNIT_OPTIONS,
  CATEGORY_OPTIONS,
} from "@/constants/category-value";

export const InfoCard = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ComboFormValues>();

  return (
    <div className="border rounded-xl shadow-sm bg-white">
      <div className="flex flex-col bg-gray-100 p-3 rounded-t">
        <p className="font-bold text-md">Thiết lập chung</p>
        <p className="text-muted-foreground text-xs">
          Thông tin cơ bản của sản phẩm (COMBO)
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-col">
          <p className="text-sm font-medium mb-1">
            Tên sản phẩm <span className="text-red-500">*</span>
          </p>
          <Input
            {...register("name")}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium mb-1">
              Mã SKU <span className="text-red-500">*</span>
            </p>
            <Input
              {...register("sku")}
              className={errors.sku ? "border-red-500" : ""}
            />
            {errors.sku && (
              <p className="text-xs text-red-500 mt-1">{errors.sku.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-medium mb-1">
              Danh mục <span className="text-red-500">*</span>
            </p>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem value={opt.value} key={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-medium mb-1">
            Đơn vị tính <span className="text-red-500">*</span>
          </p>
          <Controller
            name="baseUnit"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className={errors.baseUnit ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Chọn đơn vị tính" />
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
          {errors.baseUnit && (
            <p className="text-xs text-red-500 mt-1">
              {errors.baseUnit.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
