import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export const HeaderActions = () => {
  const navigate = useNavigate();
  return (
    <div className=" flex items-center gap-2 border-b bg-white p-2 sticky top-0 z-10 shadow-sm sm:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-10" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink
              onClick={() => navigate(-1)}
              className="cursor-pointer hover:text-primary"
            >
              Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-primary">
              Thông tin tài khoản
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
