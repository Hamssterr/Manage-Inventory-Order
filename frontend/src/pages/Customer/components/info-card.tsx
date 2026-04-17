import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Hash } from "lucide-react";
import type { CustomerFormValues } from "../schema";

export const InfoCard = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CustomerFormValues>();

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b py-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
          <User className="h-4 w-4 text-primary" />
          Thông tin chung
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name" className="text-slate-700 font-medium">
            Tên khách hàng <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="name"
              placeholder="Nhập tên khách hàng..."
              {...register("name")}
              className={`pl-3 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"}`}
            />
          </div>
          {errors.name && (
            <p className="text-[11px] font-medium text-red-500 ml-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-slate-700  font-medium">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              Số điện thoại <span className="text-red-500">*</span>
            </span>
          </Label>
          <Input
            id="phoneNumber"
            placeholder="0987654321"
            {...register("phoneNumber")}
            className={
              errors.phoneNumber
                ? "border-red-500 focus-visible:ring-red-500"
                : "focus-visible:ring-primary"
            }
          />
          {errors.phoneNumber && (
            <p className="text-[11px] font-medium text-red-500 ml-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxCode" className="text-slate-700  font-medium">
            <span className="flex items-center gap-1.5">
              <Hash className="h-3 w-3" />
              Mã số thuế
            </span>
          </Label>
          <Input
            id="taxCode"
            placeholder="Nhập MST (nếu có)"
            {...register("taxCode")}
            className="focus-visible:ring-primary"
          />
        </div>
      </CardContent>
    </Card>
  );
};
