import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Eye, MoreHorizontal, Plus, SquarePen, Trash2 } from "lucide-react";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  className?: string;
  cell?: (row: T) => React.ReactNode;
}

interface TableDataProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onView?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (row: T) => void;
  onImport?: (row: T) => void;
  enableSelection?: boolean; // Enable checkbox selection
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionWidth?: string;
}

export function TableData<T extends { id: string | number }>({
  data,
  columns,
  onView,
  onUpdate,
  onDelete,
  onImport,
  enableSelection = false,
  selectedIds = [],
  onSelectionChange,
  actionWidth = "w-[80px]",
}: TableDataProps<T>) {
  const isAllSelected =
    data.length > 0 &&
    data.every((item) => selectedIds.includes(String(item.id)));
  const isIndeterminate =
    selectedIds.length > 0 &&
    !isAllSelected &&
    data.some((item) => selectedIds.includes(String(item.id)));

  const handleToggleAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const currentPageIds = data.map((item) => String(item.id));
      const newSelected = Array.from(
        new Set([...selectedIds, ...currentPageIds]),
      );
      onSelectionChange(newSelected);
    } else {
      const currentPageIds = data.map((item) => String(item.id));
      const newSelected = selectedIds.filter(
        (id) => !currentPageIds.includes(id),
      );
      onSelectionChange(newSelected);
    }
  };

  const handleToggleRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    }
  };

  return (
    <div className="rounded-md border-b [&_div[data-slot=table-container]]:overflow-visible">
      <Table>
        <TableHeader className="sticky top-0 bg-gray-100 backdrop-blur-sm z-10">
          <TableRow>
            {enableSelection && (
              <TableHead className="w-[40px] px-4">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onCheckedChange={handleToggleAll}
                />
              </TableHead>
            )}
            <TableHead
              className={cn(
                actionWidth,
                "text-center font-bold text-slate-800 uppercase text-[11px] tracking-wider bg-slate-50/50 border-b-0",
              )}
            >
              Thao tác
            </TableHead>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  "font-bold whitespace-nowrap py-4",
                  column.className,
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-muted/50 transition-colors"
              >
                {enableSelection && (
                  <TableCell className="px-4">
                    <Checkbox
                      checked={selectedIds.includes(String(row.id))}
                      onCheckedChange={(checked) =>
                        handleToggleRow(String(row.id), checked)
                      }
                    />
                  </TableCell>
                )}
                {/* Action column */}
                <TableCell className="align-middle py-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-slate-100 hover:text-slate-900 data-[state=open]:bg-slate-200/50 transition-all duration-200 focus-visible:ring-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Hành động</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      sideOffset={8}
                      className="w-[180px] p-1.5 rounded-xl shadow-xl border-slate-200/60 bg-white/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
                    >
                      {onView && (
                        <DropdownMenuItem
                          onClick={() => onView(row)}
                          className="rounded-lg py-2 cursor-pointer transition-colors focus:bg-blue-50 focus:text-blue-600"
                        >
                          <Eye className="mr-2 h-4 w-4 opacity-70" />
                          <span className="font-medium">Xem chi tiết</span>
                        </DropdownMenuItem>
                      )}
                      {onUpdate && (
                        <DropdownMenuItem
                          onClick={() => onUpdate(row)}
                          className="rounded-lg py-2 cursor-pointer transition-colors focus:bg-amber-50 focus:text-amber-600"
                        >
                          <SquarePen className="mr-2 h-4 w-4 opacity-70" />
                          <span className="font-medium">Cập nhật</span>
                        </DropdownMenuItem>
                      )}
                      {onImport && (
                        <DropdownMenuItem
                          onClick={() => onImport(row)}
                          className="rounded-lg py-2 cursor-pointer transition-colors focus:bg-emerald-50 focus:text-emerald-600"
                        >
                          <Plus className="mr-2 h-4 w-4 opacity-70" />
                          <span className="font-medium">Nhập kho</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="my-1.5 opacity-50" />
                      {onDelete && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(row)}
                          className="rounded-lg py-2 cursor-pointer focus:bg-red-50 focus:text-red-600 transition-colors"
                        >
                          <Trash2 className="mr-2 h-4 w-4 opacity-70" />
                          <span className="font-medium">Xóa dữ liệu</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                {/* {Data column} */}
                {columns.map((column, index) => (
                  <TableCell
                    key={index}
                    className={cn("align-middle py-4", column.className)}
                  >
                    {column.cell
                      ? column.cell(row)
                      : column.accessorKey
                        ? (row[
                            column.accessorKey as keyof T
                          ] as React.ReactNode)
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + (enableSelection ? 2 : 1)}
                className="h-24 text-center"
              >
                Không có dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
