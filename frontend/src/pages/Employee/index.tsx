import { FilterBar } from "@/components/filter-bar";
import { PageFooter } from "@/components/footer";
import { TableData } from "@/components/table-data";
import { TableError, TableLoading } from "@/components/table-loading";
import { Button } from "@/components/ui/button";
import { useEmployeePageLogic } from "@/hooks/useEmployee";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmployeeModal } from "./employee-modal";
import { ConfirmModal } from "./components/confirm-modal";
import type { Employee } from "@/types/employee";
import { ExportSalaryModal } from "./components/confirm-salary-modal";
import { SalaryModalPreview } from "./components/salary-preview-modal";

export const EmployeePage = () => {
  const {
    search,
    isModalOpen,
    page,
    totalPages,
    employees,
    columns,
    totalItems,
    startItem,
    endItem,
    isLoading,
    isError,
    isFetching,
    createEmployeePending,
    refetch,
    handleSearch,
    handleCreateEmployee,
    handleNextPage,
    handlePrevPage,
    openModal,
    closeModal,
    selectedEmployee,
    modalType,
    isConfirming,
    handleOpenDelete,
    handleOpenReset,
    closeConfirmModal,
    handleConfirmAction,

    isExportModalOpen,
    handleOpenExport,
    handleCloseExport,
    isExporting,
    handleExportSalary,
    isPreviewOpen,
    reportData,
    closePreviewModal,
  } = useEmployeePageLogic();

  return (
    <div className="flex flex-col h-full w-full flex-1 overflow-hidden bg-slate-50/30">
      <FilterBar
        onSearch={handleSearch}
        defaultValue={search}
        onAddNew={openModal}
      />

      <div className="flex flex-col p-4 flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
          {isFetching && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden z-50">
              <div className="h-full bg-primary animate-[loading_1.5s_infinite_linear] w-[40%]" />
            </div>
          )}

          <div className="flex-1 overflow-auto scrollbar-hide">
            {isLoading ? (
              <TableLoading />
            ) : isError ? (
              <TableError onRetry={refetch} />
            ) : (
              <TableData
                data={employees}
                columns={columns}
                onExport={handleOpenExport}
                onResetPassword={(row) => {
                  handleOpenReset(row as Employee);
                }}
                onDelete={(row) => {
                  handleOpenDelete(row as Employee);
                }}
              />
            )}
          </div>

          <PageFooter className="bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Hiển thị</span>{" "}
              <span className="font-bold text-foreground">
                {startItem} - {endItem}
              </span>
              <span>trên</span>{" "}
              <span className="font-bold text-foreground">{totalItems}</span>{" "}
              <span>kết quả</span>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handlePrevPage}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleNextPage}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </PageFooter>
        </div>
      </div>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleCreateEmployee}
        isLoading={createEmployeePending}
      />

      <ConfirmModal
        isOpen={modalType !== null}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        isLoading={isConfirming}
        title={modalType === "delete" ? "Xóa nhân viên?" : "Đặt lại mật khẩu?"}
        description={
          modalType === "delete"
            ? `Bạn có chắc chắn muốn xóa nhân viên "${selectedEmployee?.displayName}" không? Hành động này không thể hoàn tác.`
            : `Hệ thống sẽ gửi yêu cầu cấp lại mật khẩu mới cho nhân viên "${selectedEmployee?.displayName}". Bạn có muốn tiếp tục?`
        }
        variant={modalType === "delete" ? "danger" : "warning"}
        confirmText={modalType === "delete" ? "Xóa vĩnh viễn" : "Gửi yêu cầu"}
      />

      <ExportSalaryModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExport}
        onExport={handleExportSalary}
        isLoading={isExporting}
      />

      <SalaryModalPreview
        isOpen={isPreviewOpen}
        onClose={closePreviewModal}
        reportData={reportData as any}
        employee={selectedEmployee as Employee}
      />
    </div>
  );
};
