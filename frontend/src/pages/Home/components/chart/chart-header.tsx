import { Button } from "@/components/ui/button";

interface ChartHeaderProps {
  title: string;
  filterOptions: string[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const ChartHeader = ({
  title,
  filterOptions,
  selectedFilter,
  onSelectFilter,
}: ChartHeaderProps) => {
  return (
    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="font-bold texts-slate-800 text-lg">{title}</h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-primary">
            {selectedFilter}
          </span>
        </div>
      </div>

      <div className="flex items-center p-1">
        {filterOptions.map((option) => (
          <Button
            key={option}
            onClick={() => onSelectFilter(option)}
            className={`px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-xl ${selectedFilter === option ? "bg-primary text-white" : "bg-white text-slate-700"}`}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};
