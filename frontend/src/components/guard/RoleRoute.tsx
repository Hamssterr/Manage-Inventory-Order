import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";
import { usePermission } from "@/hooks/usePermission";
import type { UserRole } from "@/types/user";
import { LoadingSpinner } from "../ui/loading";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { accessToken, user } = useAuthStore();
  const { hasRole } = usePermission();

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  // Đang load dở user
  if (accessToken && !user) {
    return <LoadingSpinner />;
  }

  // Không có quyền
  if (!hasRole(allowedRoles)) {
    // Có thể điều hướng về trang lỗi 403 nếu muốn
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
