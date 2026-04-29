import { DollarSign, ShoppingBag, User } from "lucide-react";
import { StartCard } from "./components/start-card";
import { useGetDashboardStatsQuery } from "@/hooks/useReport";

export const SiteHeader = () => {
  const { data: stats, isLoading } = useGetDashboardStatsQuery();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  if (isLoading) {
    return (
      <div className="mx-auto grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-3 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-3">
      <StartCard
        title="Tổng doanh thu"
        value={formatCurrency(stats?.totalRevenue || 0)}
        trend={`${(stats?.revenueTrend ?? 0) >= 0 ? "+" : ""}${stats?.revenueTrend}%`}
        trendType={(stats?.revenueTrend ?? 0) >= 0 ? "up" : "down"}
        icon={DollarSign}
      />
      <StartCard
        title="Đơn hàng (Tháng này)"
        value={formatNumber(stats?.totalOrders || 0)}
        trend={`${(stats?.ordersTrend ?? 0) >= 0 ? "+" : ""}${stats?.ordersTrend}%`}
        trendType={(stats?.ordersTrend ?? 0) >= 0 ? "up" : "down"}
        icon={ShoppingBag}
      />
      <StartCard
        title="Khách hàng mới"
        value={formatNumber(stats?.newCustomers || 0)}
        trend={`${(stats?.customersTrend ?? 0) >= 0 ? "+" : ""}${stats?.customersTrend}%`}
        trendType={(stats?.customersTrend ?? 0) >= 0 ? "up" : "down"}
        icon={User}
      />
    </div>
  );
};
