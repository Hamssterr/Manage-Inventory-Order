import { Navbar } from "@/components/navbar";
import { SiteHeader } from "./site-header";
import { BarChart } from "./bar-chart";

export const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col flex-1 overflow-auto">
        <div className="p-4">
          <SiteHeader />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <BarChart />
        </div>
      </div>
    </div>
  );
};
