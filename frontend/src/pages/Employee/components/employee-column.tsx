import type { ColumnDef } from "@/components/table-data";
import type { Employee } from "@/types/employee";
import { Mail, Phone, User } from "lucide-react";

export const EmployeeColumns = (): ColumnDef<Employee & { id: string }>[] => [
  {
    header: "Tên nhân viên",
    className: "w-[220px]", // Tăng chút width cho tên dài
    cell: (row) => (
      <div className="flex items-center gap-3 py-1">
        {/* Đổi avatar sang hình tròn và dùng tông màu cam chủ đạo */}
        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
          <User className="h-4.5 w-4.5 text-orange-600" />
        </div>
        <span className="font-semibold text-slate-800 tracking-tight">
          {row.displayName}
        </span>
      </div>
    ),
  },
  {
    header: "Số điện thoại",
    className: "w-[160px]",
    cell: (row) => (
      <div className="flex items-center gap-2 py-1">
        <Phone className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-medium text-slate-700">{row.phoneNumber}</span>
      </div>
    ),
  },
  {
    header: "Email",
    className: "w-[220px]",
    cell: (row) => (
      <div className="flex items-center gap-2 py-1">
        <Mail className="w-3.5 h-3.5 text-slate-400" />
        {row.email ? (
          <span className="font-medium text-slate-600">{row.email}</span>
        ) : (
          <span className="text-slate-400 italic text-sm font-medium">
            Chưa cập nhật
          </span>
        )}
      </div>
    ),
  },
  {
    header: "Chức vụ",
    className: "w-[150px]",
    cell: (row) => {
      // Logic bóc tách màu sắc dựa trên role
      const isSaler = row.role === "salers";

      return (
        <div className="flex items-center py-1">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
              isSaler
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isSaler ? "Nhân viên Sales" : "Nhân viên kế toán"}
          </span>
        </div>
      );
    },
  },
];
