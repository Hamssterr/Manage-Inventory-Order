import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { IChartData, ITopProduct } from "@/types/report";
import { formatCurrency } from "@/utils/helper";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface SalerRevenueChartProps {
  chartData: IChartData[];
  topProducts: ITopProduct[];
}

export const SalerRevenueChart = ({
  chartData,
  topProducts,
}: SalerRevenueChartProps) => {
  return (
    <div className="flex flex-col lg:flex-row h-full p-4 gap-6 flex-1 overflow-hidden">
      <div className="flex-1 min-h-[300px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 10, left: 40, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="salerBarGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                horizontal={false}
                vertical={true}
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                width={10}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.02)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/80 backdrop-blur-md p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-white/20 rounded-xl">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Doanh thu Sale
                        </p>
                        <p className="text-sm font-black text-slate-900">
                          {formatCurrency(payload[0]?.value as number)} vnđ
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                fill="url(#salerBarGradient)"
                radius={[0, 6, 6, 0]}
                maxBarSize={30}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Top Bán Chạy của Sale */}
      <div className="w-full lg:w-[300px] flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
        <h4 className="font-bold text-slate-800 mb-4">Top bán chạy của Sale</h4>

        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-100">
                  #{index + 1}
                </div>
                <div className="min-w-0">
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm font-semibold text-muted-foreground line-clamp-1 cursor-help max-w-[140px] md:max-w-[180px]">
                          {product.name}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px] wrap-break-word">
                        {product.name}
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(product.revenue)}đ
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
