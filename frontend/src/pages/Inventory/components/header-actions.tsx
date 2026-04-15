import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderActionsProps {
  isPending: boolean;
  onCancel: () => void;
  isViewMode?: boolean;
  isEditMode?: boolean;
  isImportMode?: boolean;
}

export const HeaderActions = ({
  isPending,
  onCancel,
  isViewMode,
  isEditMode,
  isImportMode,
}: HeaderActionsProps) => {
  const getPageTitle = () => {
    if (isViewMode) return "Chi tiết sản phẩm";
    if (isEditMode) return "Cập nhật sản phẩm";
    if (isImportMode) return "Nhập kho";
    return "Thêm mới sản phẩm";
  };

  return (
    <div className="flex items-center gap-2 border-b bg-white p-2 sticky top-0 z-10">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-10" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/inventory">
              Danh sách kho hàng
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          {isViewMode ? "Quay lại" : "Hủy bỏ"}
        </Button>
        {/* Nút submit kích hoạt hàm onSubmit của Form */}
        {!isViewMode && (
          <Button type="submit" disabled={isPending}>
            {isPending ? "Đang lưu..." : "Lưu lại"}
          </Button>
        )}
      </div>
    </div>
  );
};
