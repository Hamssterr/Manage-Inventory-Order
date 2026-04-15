import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
}

export const FilterBar = ({
  onSearch,
  onAddNew,
  filters = [],
  defaultValue = "",
}: FilterBarProps) => {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const debouncedSearchTerm = useDebounce(searchTerm, 350);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  // Sync with defaultValue if it changes from parent
  useEffect(() => {
    setSearchTerm(defaultValue);
  }, [defaultValue]);

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
      {/* Khu vực Lọc / Tìm kiếm */}
      <div className="flex items-center gap-3">
        <div className="relative w-[300px]">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, SKU..."
            className="pl-8 bg-muted/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sau này bạn có thể nhét thêm Dropdown Lọc theo Category ở đây */}
        {filters.map((filter) => (
          <div key={filter.key} className="relative flex items-center gap-1">
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filter.value && filter.value !== "" && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 h-5 w-5 text-muted-foreground hover:text-destructive"
                onClick={() => filter.onChange("")}
              >
                <X className="h-1.5 w-1.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Khu vực Hành động */}
      {onAddNew && (
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm mới
        </Button>
      )}
    </div>
  );
};
