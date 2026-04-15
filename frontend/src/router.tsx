import { useRoutes } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { AboutPage } from "./pages/About";
import { Layout } from "./components/layout";
import { SignUpPage } from "./pages/Sign-Up";
import { SignInPage } from "./pages/Sign-In";
import { ProtectedRoute } from "./components/guard/ProtectedRoute";
import { PublicRoute } from "./components/guard/PublicRoute";
import { RoleRoute } from "./components/guard/RoleRoute";
import { InventoryPage } from "./pages/Inventory";
import { InventoryModal } from "./pages/Inventory/inventory-modal";

export const AppRoutes = () => {
  const element = useRoutes([
    {
      // Auth Routes - No Sidebar/Navbar
      element: <PublicRoute />,
      children: [
        { path: "/signin", element: <SignInPage /> },
        { path: "/signup", element: <SignUpPage /> },
      ],
    },
    {
      // Main Application Layout
      path: "/",
      element: <Layout />,
      children: [
        {
          element: <ProtectedRoute />, // 1. Lớp cửa số 1: Bắt buộc đã Đăng Nhập
          children: [
            { index: true, element: <HomePage /> },

            // 2. Lớp cửa số 2: Phân quyền theo Nhóm Role
            {
              // Bất cứ ai chạm vào khu vực /admin đều phải có quyền owner hoặc admin
              element: <RoleRoute allowedRoles={["owner", "admin"]} />,
              children: [
                {
                  path: "admin",
                  element: <div>Chào mừng sếp lớn Admin/Owner!</div>,
                },
                {
                  path: "admin/users",
                  element: <div>Trang quản lý nhân viên</div>,
                },
              ],
            },
            {
              element: (
                <RoleRoute
                  allowedRoles={["accountant", "owner", "admin", "salers"]}
                />
              ),
              children: [
                { path: "inventory", element: <InventoryPage /> },
                { path: "inventory/add", element: <InventoryModal /> },
                { path: "inventory/:id", element: <InventoryModal /> },
                { path: "inventory/:id/edit", element: <InventoryModal /> },
                { path: "inventory/:id/import", element: <InventoryModal /> },
              ],
            },

            {
              // Khu vực dành riêng cho Sales và Kế Toán (chủ/admin vẫn có thể vào nếu bạn đưa vào mảng này)
              element: (
                <RoleRoute
                  allowedRoles={["salers", "accountant", "owner", "admin"]}
                />
              ),
              children: [
                {
                  path: "orders",
                  element: <div>Trang xem Đơn Hàng của Sales/Kế toán</div>,
                },
              ],
            },
          ],
        },
        { path: "about", element: <AboutPage /> },
      ],
    },
  ]);
  return element;
};
