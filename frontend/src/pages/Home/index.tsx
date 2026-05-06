import { Navbar } from "@/pages/Home/components/navbar";
import { SiteHeader } from "./site-header";
import { RevenueBarChart } from "./revenue-bar-chart";
import { RevenueSalesBarChart } from "./revenue-sales-bar-chart";
import { usePermission } from "@/hooks/usePermission";
import { SalerSellingProducts } from "./components/saler-selling-products";

export const HomePage = () => {
  const { hasRole } = usePermission();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col flex-1 overflow-auto">
        <div className="p-4">
          <SiteHeader />
        </div>

        <div className="p-4 flex-1 flex flex-col gap-6">
          <div className="w-full">
            <RevenueBarChart />
          </div>

          {hasRole(["admin", "owner", "accountant"]) && (
            <div className="w-full">
              <RevenueSalesBarChart />
            </div>
          )}

          {hasRole(["salers"]) && (
            <div className="w-full">
              <SalerSellingProducts />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
