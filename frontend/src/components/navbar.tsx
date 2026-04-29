import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export const Navbar = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-3 p-4 bg-white border-b sticky top-0 z-10 w-full shadow-sm">
      {/* Bên trái: Sidebar + Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 shrink-0 border-r border-slate-200">
          <SidebarTrigger className="-ml-2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" />
        </div>
        <a
          href="/"
          className=" text-md text-muted-foreground hover:text-muted-foreground/80"
        >
          Trang chủ
        </a>
      </div>

      {/* Bên phải: Thông báo & User Profile */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 outline-none">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start text-sm">
                <span className="font-medium leading-none">
                  {user?.displayName}
                </span>
                <span className="text-[11px] text-muted-foreground uppercase">
                  {user?.role}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Hồ sơ cá nhân</DropdownMenuItem>
            <DropdownMenuItem>Cài đặt hệ thống</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
