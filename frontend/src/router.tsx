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
import { ProductPage } from "./pages/Product";
import { ProductModal } from "./pages/Product/product-modal";
import { CustomerPage } from "./pages/Customer";
import { CustomerModal } from "./pages/Customer/customer-modal";
import { RoutePage } from "./pages/Route";
import { RouteModal } from "./pages/Route/route-modal";
import { OrderPage } from "./pages/Order";
import { OrderModal } from "./pages/Order/order-modal";
import { OrderInvoiceDetails } from "./pages/Order/order-invoice-details";
import { ExportTicketPage } from "./pages/Export-Ticket";
import { ExportTicketDetail } from "./pages/Export-Ticket/export-ticket-details";

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
                // Inventory
                { path: "inventory", element: <InventoryPage /> },
                { path: "inventory/add", element: <InventoryModal /> },
                { path: "inventory/:id", element: <InventoryModal /> },
                { path: "inventory/:id/edit", element: <InventoryModal /> },
                { path: "inventory/:id/import", element: <InventoryModal /> },

                // Product
                { path: "products", element: <ProductPage /> },
                { path: "products/add", element: <ProductModal /> },
                { path: "products/:id", element: <ProductModal /> },
                { path: "products/:id/edit", element: <ProductModal /> },

                // Customer
                { path: "customers", element: <CustomerPage /> },
                { path: "customers/add", element: <CustomerModal /> },
                { path: "customers/:id", element: <CustomerModal /> },
                { path: "customers/:id/edit", element: <CustomerModal /> },

                // Route
                { path: "routes", element: <RoutePage /> },
                { path: "routes/add", element: <RouteModal /> },
                { path: "routes/:id", element: <RouteModal /> },
                { path: "routes/:id/edit", element: <RouteModal /> },

                // Orders
                { path: "orders", element: <OrderPage /> },
                { path: "orders/add", element: <OrderModal /> },
                { path: "orders/:id", element: <OrderInvoiceDetails /> },
                { path: "orders/:id/edit", element: <OrderModal /> },

                // Export-Tickets
                { path: "export-tickets", element: <ExportTicketPage /> },
                { path: "export-tickets/:id", element: <ExportTicketDetail /> },
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
