import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Route as RouteIcon, Loader2 } from "lucide-react";
import { useGetInfiniteRouteQuery } from "@/hooks/useRoute";
import type { CustomerFormValues } from "../schema";
import { useMemo, useRef, useCallback } from "react";

interface AddressCardProps {
  disabled?: boolean;
  initialRouteName?: string;
}

export const AddressCard = ({
  disabled,
  initialRouteName,
}: AddressCardProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CustomerFormValues>();

  const {
    data: routeData,
    isLoading: isLoadingRoutes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInfiniteRouteQuery({
    limit: 10,
  });

  const routes = useMemo(() => {
    return routeData?.pages.flatMap((page) => page.data) || [];
  }, [routeData]);

  // Infinite scroll observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingRoutes || isFetchingNextPage) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        { rootMargin: "50px" },
      );

      if (node) observer.current.observe(node);
    },
    [isLoadingRoutes, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b py-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
          <MapPin className="h-4 w-4 text-primary" />
          Địa chỉ & Lộ trình
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Province/City */}
        <div className="space-y-2">
          <Label htmlFor="province" className="text-slate-700 font-medium">
            Tỉnh / Thành phố <span className="text-red-500">*</span>
          </Label>
          <Input
            id="province"
            placeholder="Ví dụ: TP Hồ Chí Minh"
            {...register("addresses.province")}
            className={
              errors.addresses?.province
                ? "border-red-500 focus-visible:ring-red-500"
                : "focus-visible:ring-primary"
            }
          />
          {errors.addresses?.province && (
            <p className="text-[11px] font-medium text-red-500 ml-1">
              {errors.addresses.province.message}
            </p>
          )}
        </div>

        {/* District */}
        <div className="space-y-2">
          <Label htmlFor="district" className="text-slate-700  font-medium">
            Quận / Huyện <span className="text-red-500">*</span>
          </Label>
          <Input
            id="district"
            placeholder="Ví dụ: Quận 1"
            {...register("addresses.district")}
            className={
              errors.addresses?.district
                ? "border-red-500 focus-visible:ring-red-500"
                : "focus-visible:ring-primary"
            }
          />
          {errors.addresses?.district && (
            <p className="text-[11px] font-medium text-red-500 ml-1">
              {errors.addresses.district.message}
            </p>
          )}
        </div>

        {/* Ward */}
        <div className="space-y-2">
          <Label htmlFor="ward" className="text-slate-700 font-medium">
            Phường / Xã <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ward"
            placeholder="Ví dụ: Phường Bến Nghé"
            {...register("addresses.ward")}
            className={
              errors.addresses?.ward
                ? "border-red-500 focus-visible:ring-red-500"
                : "focus-visible:ring-primary"
            }
          />
          {errors.addresses?.ward && (
            <p className="text-[11px] font-medium text-red-500 ml-1">
              {errors.addresses.ward.message}
            </p>
          )}
        </div>

        {/* Detail Address */}
        <div className="space-y-2">
          <Label
            htmlFor="addressDetail"
            className="text-slate-700  font-medium"
          >
            Số nhà, tên đường <span className="text-red-500">*</span>
          </Label>
          <Input
            id="addressDetail"
            placeholder="Ví dụ: 123 Lê Duẩn"
            {...register("addresses.addressDetail")}
            className={
              errors.addresses?.addressDetail
                ? "border-red-500 focus-visible:ring-red-500"
                : "focus-visible:ring-primary"
            }
          />
          {errors.addresses?.addressDetail && (
            <p className="text-[11px] font-medium text-red-500 ml-1">
              {errors.addresses.addressDetail.message}
            </p>
          )}
        </div>

        {/* Route Selector */}
        <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-100 mt-2">
          <Label className="text-slate-700 font-medium flex items-center gap-1.5 mb-2">
            <RouteIcon className="h-3.5 w-3.5 text-slate-500" />
            Tuyến đường giao hàng (Tùy chọn)
          </Label>
          <Controller
            control={control}
            name="addresses.routeId"
            render={({ field }) => (
              <Select
                disabled={disabled}
                value={field.value || "none"}
                onValueChange={(val) =>
                  field.onChange(val === "none" ? "" : val)
                }
              >
                <SelectTrigger className="w-full bg-white transition-all focus:ring-primary focus:border-primary">
                  <SelectValue placeholder="Chọn tuyến đường">
                    {isLoadingRoutes ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Đang tải...
                      </span>
                    ) : (
                      routes.find((r: any) => r._id === field.value)
                        ?.routeName ||
                      initialRouteName ||
                      "Chọn tuyến đường"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[200px]">
                  <SelectItem value="none" className="text-slate-400 italic">
                    Không gán tuyến
                  </SelectItem>
                  {routes.map((route: any) => (
                    <SelectItem key={route._id} value={route._id}>
                      {route.routeName} ({route.description})
                    </SelectItem>
                  ))}
                  <div ref={lastElementRef} className="h-1" />
                  {isFetchingNextPage && (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-[11px] text-muted-foreground italic pl-1">
            * Gán tuyến đường giúp việc lập lộ trình giao hàng tự động trở nên
            chính xác hơn.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
