import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Briefcase, UserCheck, Loader2, Plus, X } from "lucide-react";
import { useGetSalersQuery } from "@/hooks/useUser";
import type { CustomerFormValues } from "../schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SalesRepCardProps {
  disabled?: boolean;
}

export const SalesRepCard = ({ disabled }: SalesRepCardProps) => {
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
        <Controller
          control={control}
          name="saleReps"
          render={({ field }) => {
            const selectedIds = field.value || [];

            const handleToggle = (id: string) => {
              const newIds = selectedIds.includes(id)
                ? selectedIds.filter((i: string) => i !== id)
                : [...selectedIds, id];
              field.onChange(newIds);
            };

            const removeId = (id: string) => {
              field.onChange(selectedIds.filter((i: string) => i !== id));
            };

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700 font-medium flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                    Nhân viên phụ trách
                  </Label>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wider">
                    {selectedIds.length} đã chọn
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[42px] p-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/30">
                  {selectedIds.length === 0 ? (
                    <span className="text-xs text-slate-400 italic flex items-center h-full ml-1">
                      Chưa có nhân viên nào được chọn
                    </span>
                  ) : (
                    selectedIds.map((id: string) => {
                      const user = salers?.find((u: any) => u._id === id);
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="bg-white border-slate-200 text-slate-700 pr-1 pl-2 py-0.5 gap-1 group animate-in fade-in zoom-in duration-200"
                        >
                          <span className="max-w-[120px] truncate">
                            {user?.displayName || "Đang tải..."}
                          </span>
                          {!disabled && (
                            <button
                              type="button"
                              onClick={() => removeId(id)}
                              className="hover:bg-slate-100 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />
                            </button>
                          )}
                        </Badge>
                      );
                    })
                  )}
                </div>

                {!disabled && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-normal"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        {isLoading
                          ? "Đang tải danh sách..."
                          : "Thêm nhân viên phụ trách"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[300px]">
                      <DropdownMenuLabel className="text-[11px] font-bold text-slate-500 uppercase">
                        Danh sách nhân viên
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-[240px] overflow-y-auto">
                        {salers?.map((user: any) => (
                          <DropdownMenuCheckboxItem
                            key={user._id}
                            checked={selectedIds.includes(user._id)}
                            onCheckedChange={() => handleToggle(user._id)}
                            onSelect={(e) => e.preventDefault()}
                          >
                            <div className="flex flex-col py-0.5">
                              <span className="font-medium text-sm">
                                {user.displayName}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase">
                                {user.phoneNumber}
                              </span>
                            </div>
                          </DropdownMenuCheckboxItem>
                        ))}
                        {salers?.length === 0 && (
                          <div className="p-4 text-center text-xs text-slate-400">
                            Không tìm thấy nhân viên
                          </div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          }}
        />
        {errors.saleReps && (
          <p className="text-[11px] font-medium text-red-500 ml-1">
            {errors.saleReps.message}
          </p>
        )}

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
