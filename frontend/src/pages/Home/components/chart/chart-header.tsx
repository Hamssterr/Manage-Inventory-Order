import { Button } from "@/components/ui/button";

interface ChartHeaderProps {
  title: string;
  filterOptions: string[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  extraControl?: React.ReactNode;
}

export const ChartHeader = ({
  title,
  filterOptions,
  selectedFilter,
  onSelectFilter,
  extraControl,
}: ChartHeaderProps) => {
  return (
    <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Cụm Tiêu đề và Status */}
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-slate-800 text-base md:text-lg">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-primary">
            {selectedFilter}
          </span>
        </div>
      </div>

      {/* Extra Control (nếu có) */}
      {extraControl && (
        <div className="flex-1 flex justify-end md:px-4">{extraControl}</div>
      )}

      {/* Cụm Button: Luôn nằm bên phải trên cả mobile và desktop */}
      <div className="flex items-center p-1 gap-3 self-end md:self-auto">
        {filterOptions.map((option) => (
          <Button
            key={option}
            variant="ghost" // Hoặc style tùy ý bạn
            onClick={() => onSelectFilter(option)}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium transition-all duration-200 rounded-xl ${
              selectedFilter === option
                ? "bg-primary text-white hover:bg-primary/95"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};
