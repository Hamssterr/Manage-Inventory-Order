import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, X, ListFilter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  key: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}

interface FilterBarProps {
  onSearch: (value: string) => void;
  onAddNew?: () => void;
  filters?: FilterDefinition[];
  defaultValue?: string;
  children?: React.ReactNode;
}

export const FilterBar = ({
  onSearch,
  onAddNew,
  filters = [],
  defaultValue = "",
  children,
}: FilterBarProps) => {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const lastSearchedTerm = useRef(defaultValue);

  useEffect(() => {
    if (debouncedSearchTerm !== lastSearchedTerm.current) {
      lastSearchedTerm.current = debouncedSearchTerm;
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  useEffect(() => {
    setSearchTerm(defaultValue);
  }, [defaultValue]);

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-y-3 gap-x-3 p-4 bg-white border-b sticky top-0 z-10 w-full shadow-sm">
      {/* 1. KHU VỰC TRÁI: Trigger & Search */}
      {/* flex-1 giúp khu vực này chiếm trọn không gian còn lại, đẩy nút Thêm Mới dạt sang phải */}
      <div className="flex flex-1 items-center gap-2 md:gap-3 order-1 min-w-[200px]">
        {/* Sidebar Trigger */}
        <div className="flex items-center gap-2 shrink-0 border-r border-slate-200">
          <SidebarTrigger className="-ml-2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" />
        </div>

        {/* Ô Tìm Kiếm */}
        <div className="relative w-full md:max-w-xs lg:max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, SKU..."
            className="pl-9 pr-9 h-9 w-full bg-slate-50 border-slate-200 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary/30 transition-all rounded-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Nút Clear Search */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center rounded-full hover:bg-slate-100"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. NÚT HÀNH ĐỘNG (Thêm mới) */}
      {/* order-2 trên Mobile (nằm cạnh Search), order-3 trên Desktop (dạt ra biên phải) */}
      {onAddNew && (
        <Button
          onClick={onAddNew}
          className="order-2 md:order-3 h-9 gap-1.5 rounded-lg px-4 shadow-sm shrink-0 transition-transform active:scale-[0.98] md:ml-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Thêm mới</span>
        </Button>
      )}

      {/* 3. BỘ LỌC (Filters) */}
      {filters.length > 0 && (
        <div
          className={`order-3 md:order-2 w-full md:w-auto flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:pl-3 border-slate-200 
            ${!onAddNew ? "lg:mr-3" : ""}`}
        >
          <div className="hidden lg:flex items-center text-sm text-muted-foreground gap-1.5 mr-1 shrink-0">
            <ListFilter className="h-4 w-4" />
            <span className="font-medium">Lọc:</span>
          </div>

          {filters.map((filter) => {
            const isActive = filter.value && filter.value !== "";

            return (
              <div key={filter.key} className="relative group/filter shrink-0">
                <Select value={filter.value} onValueChange={filter.onChange}>
                  <SelectTrigger
                    className={`h-9 min-w-[150px] lg:min-w-[180px] transition-all rounded-lg 
    outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none
    ${isActive ? "pr-8 border-primary/40 bg-primary/5 text-primary font-medium" : "border-slate-200 bg-white text-slate-600"}`}
                  >
                    <SelectValue placeholder={filter.placeholder} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="rounded-xl shadow-lg border-slate-100"
                  >
                    {filter.options.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="rounded-lg cursor-pointer my-0.5"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Nút Clear Filter */}
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      filter.onChange("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 hover:text-slate-700 transition-colors z-10"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            );
          })}

          {children}
        </div>
      )}

      {filters.length === 0 && children && (
        <div className="order-3 md:order-2 w-full md:w-auto flex items-center gap-2 md:pl-3 border-slate-200">
          {children}
        </div>
      )}
    </div>
  );
};
