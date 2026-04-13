import { useAuthStore } from "@/stores/useAuthStore";
import type { UserRole } from "@/types/user";

export const usePermission = () => {
  const { user } = useAuthStore();

  const hasRole = (allowedRoles: UserRole[]) => {
    // Chưa đăng nhập thì không có quyền
    if (!user) return false;

    // Kiểm tra xem role của user hiện tại có nằm trong mảng cho phép không
    return allowedRoles.includes(user.role);
  };

  return { hasRole, userRole: user?.role };
};
