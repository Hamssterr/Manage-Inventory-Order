import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, UserCheck, Loader2 } from "lucide-react";
import { useGetSalersQuery } from "@/hooks/useUser";
import type { CustomerFormValues } from "../schema";

interface SalesRepCardProps {
  disabled?: boolean;
  initialDisplay?: string;
}

export const SalesRepCard = ({
  disabled,
  initialDisplay,
}: SalesRepCardProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<CustomerFormValues>();

  const { data: salers, isLoading } = useGetSalersQuery();

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden sticky top-[80px]">
      <CardHeader className="bg-slate-50/50 border-b py-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
          <Briefcase className="h-4 w-4 text-primary" />
          Phụ trách & Quản lý
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium flex items-center gap-2">
            <UserCheck className="h-3.5 w-3.5 text-slate-500" />
            Nhân viên phụ trách
          </Label>
          <Controller
            control={control}
            name="saleRep"
            render={({ field }) => (
              <Select
                disabled={disabled}
                value={field.value || "none"}
                onValueChange={(val) =>
                  field.onChange(val === "none" ? "" : val)
                }
              >
                <SelectTrigger
                  className={`w-full bg-white ${errors.saleRep ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Chọn nhân viên">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Đang tải...
                      </span>
                    ) : (
                      salers?.find((u: any) => u._id === field.value)
                        ?.displayName ||
                      initialDisplay ||
                      "Chọn nhân viên"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[300px]">
                  <SelectItem value="none" className="text-slate-400 italic">
                    Chưa phân công
                  </SelectItem>
                  {salers?.map((user: any) => (
                    <SelectItem key={user._id} value={user._id}>
                      <div className="flex flex-col py-0.5">
                        <span className="font-medium text-sm">
                          {user.displayName}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.saleRep && (
            <p className="text-[11px] font-medium text-red-500 ml-1">
              {errors.saleRep.message}
            </p>
          )}
        </div>

        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-2">
          <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
            * Nhân viên phụ trách sẽ nhận được thông báo và có quyền quản lý
            trực tiếp các đơn hàng liên quan đến khách hàng này.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
