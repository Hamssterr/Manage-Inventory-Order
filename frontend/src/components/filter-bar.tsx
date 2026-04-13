import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface CategoryOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  onSearch: (value: string) => void;
  onAddNew?: () => void;
  onCategoryChange?: (value: string) => void;
  categories?: CategoryOption[];
}

export const FilterBar = ({
  onSearch,
  onAddNew,
  onCategoryChange,
  categories = [],
}: FilterBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Kỹ thuật Debounce: Chờ 500ms sau khi người dùng ngừng gõ mới trigger onSearch
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

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
        {onCategoryChange && categories.length > 0 && (
          <Select onValueChange={onCategoryChange} defaultValue="">
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Khu vực Hành động */}
      {onAddNew && (
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo mã vật tư
        </Button>
      )}
    </div>
  );
};
