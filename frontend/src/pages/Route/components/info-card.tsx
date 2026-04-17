import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, AlignLeft } from "lucide-react";
import type { RouteFormValues } from "../schema";

interface InfoCardProps {
  disabled?: boolean;
}

export const InfoCard = ({ disabled }: InfoCardProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<RouteFormValues>();

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b py-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
          <Map className="h-4 w-4 text-primary" />
          Thông tin tuyến đường
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="routeName" className="text-slate-700 font-medium">
            Tên tuyến đường <span className="text-red-500">*</span>
          </Label>
          <Input
            id="routeName"
            placeholder="Ví dụ: Tuyến Quận 1 - Chợ Bến Thành"
            disabled={disabled}
            {...register("routeName")}
            className={errors.routeName ? "border-red-500" : "focus-visible:ring-primary"}
          />
          {errors.routeName && (
            <p className="text-[11px] font-medium text-red-500 ml-1">
              {errors.routeName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-700 font-medium flex items-center gap-1.5">
            <AlignLeft className="h-3 w-3" />
            Mô tả
          </Label>
          <Textarea
            id="description"
            placeholder="Ghi chú chi tiết về lộ trình, các điểm dừng quan trọng..."
            rows={4}
            disabled={disabled}
            {...register("description")}
            className="focus-visible:ring-primary resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};
