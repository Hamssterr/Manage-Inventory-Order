import type { LucideIcon } from "lucide-react";

interface StartCardProps {
  title: string;
  value: string;
  trend?: string;
  trendType?: "up" | "down";
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export const StartCard = ({
  title,
  value,
  trend,
  trendType = "up",
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
}: StartCardProps) => {
  return (
    <div className=" p-4 flex flex-col w-full gap-4 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
      {/* Header Card */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </p>
      </div>

      {/* Body Card */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className=" relative w-fit">
            <span className="font-bold text-3xl tracking-tight text-slate-900">
              {value}
            </span>
            {trend && (
              <span
                className={`absolute left-full -top-1 ml-1 whitespace-nowrap  text-xs font-bold ${trendType === "up" ? "text-emerald-500" : "text-rose-500"}`}
              >
                {trendType === "up" ? "↑" : "↓"} {trend}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 font-medium">
            So với tháng trước
          </p>
        </div>

        {/* Icon Container */}
        <div
          className={`p-4 ${iconBg} ${iconColor} rounded-2xl ring-1 ring-inset ring-black/5 shadow-sm`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
