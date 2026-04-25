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
import { Save, X } from "lucide-react";

interface HeaderActionsProps {
  isEditMode?: boolean;
  isPending: boolean;
  onCancel: () => void;
}

export const HeaderActions = ({
  isEditMode,
  isPending,
  onCancel,
}: HeaderActionsProps) => {
  const getTitle = () => {
    if (isEditMode) return "Chỉnh sửa đơn hàng";
    return "Tạo đơn hàng";
  };

  return (
    <div className=" flex items-center gap-2 border-b bg-white p-2 sticky top-0 z-10 shadow-sm sm:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-10" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/customers">
              Danh sách khách hàng
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-primary">
              {getTitle()}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex gap-2 ml-auto">
        <Button
          type="button"
          variant={"outline"}
          onClick={onCancel}
          size={"sm"}
          disabled={isPending}
          className="h-9 px-4 lg:px-6"
        >
          <X className="h-4 w-4 mr-2" />
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="h-9 px-4 lg:px-6 shadow-md shadow-primary/20"
        >
          {isPending ? (
            "Đang lưu..."
          ) : (
            <span className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Lưu đơn hàng
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
