import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Employee, ISalaryReportData } from "@/types/employee";
import { Printer } from "lucide-react";

interface SalaryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ISalaryReportData | null;
  employee: Employee | null;
}
export const SalaryModalPreview = ({
  isOpen,
  onClose,
  reportData,
  employee,
}: SalaryPreviewModalProps) => {
  if (!employee || !reportData) return null;

  const { summary, details = [] } = reportData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 text-center uppercase tracking-wide">
            Phiếu Tính Lương
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {/* 1. Thông tin chung */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Nhân viên:</span>
              <span className="font-bold text-slate-800">
                {employee.displayName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kỳ lương:</span>
              <span className="font-bold text-slate-800">
                Tháng {summary.month} / {summary.year}
              </span>
            </div>
          </div>

          {/* 2. Chi tiết sản phẩm bán được */}
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3 border-b pb-2">
              Chi tiết doanh số & Hoa hồng
            </h4>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
              {details.length === 0 ? (
                <p className="text-sm text-slate-500 text-center italic py-4">
                  Không có dữ liệu bán hàng trong tháng này.
                </p>
              ) : (
                details.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start text-sm"
                  >
                    {/* Sử dụng displayText mà BE trả về cho tiện */}
                    <span className="text-slate-600 flex-1 pr-4 leading-relaxed">
                      {item.displayText.split(":")[0]}
                    </span>
                    <span className="font-semibold text-slate-800 whitespace-nowrap">
                      {item.totalSalary.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Tổng kết */}
          <div className="border-t-2 border-dashed border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng sản phẩm:</span>
              <span className="font-semibold text-slate-800">
                {summary.totalProductsSold}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-bold text-slate-800">Tổng tiền nhận:</span>
              <span className="font-bold text-emerald-600">
                {summary.totalSalaryEarned.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Printer className="w-4 h-4 mr-2" />
            In phiếu lương
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
