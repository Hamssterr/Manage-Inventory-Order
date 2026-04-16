import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
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
  actionWidth?: string;
}

export function TableData<T extends { id: string | number }>({
  data,
  columns,
  onView,
  onUpdate,
  onDelete,
  onImport,
  actionWidth = "w-[80px]",
}: TableDataProps<T>) {
  return (
    <div className="rounded-md border-b overflow-hidden">
      <Table>
        <TableHeader className="sticky top-0 bg-secondary/90 backdrop:-blur-sm z-10">
          <TableRow>
            <TableHead className={cn(actionWidth, "font-bold")}>
              Thao tác
            </TableHead>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn("font-bold whitespace-nowrap", column.className)}
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
                {/* Action column */}
                <TableCell className="align-middle py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      sideOffset={10}
                      className="w-[160px]"
                    >
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(row)}>
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                          Xem chi tiết
                        </DropdownMenuItem>
                      )}
                      {onUpdate && (
                        <DropdownMenuItem onClick={() => onUpdate(row)}>
                          <SquarePen className="mr-2 h-4 w-4 text-muted-foreground" />
                          Cập nhật
                        </DropdownMenuItem>
                      )}
                      {onImport && (
                        <DropdownMenuItem onClick={() => onImport(row)}>
                          <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                          Nhập kho
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {onDelete && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(row)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
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
                colSpan={columns.length + 1}
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
