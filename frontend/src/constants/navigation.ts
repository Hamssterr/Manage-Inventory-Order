import type { NavigationConfig } from "@/types/navigation";

export const navigationConfig: NavigationConfig = {
  navMain: [
    {
      title: "Trang chủ",
      url: "/",
      icon: "Home",
      roles: ["admin", "owner", "accountant", "salers"],
    },
    {
      title: "Sản phẩm",
      url: "/products",
      icon: "Package",
      roles: ["admin", "owner"],
      items: [{ title: "Danh sách sản phẩm", url: "/products" }],
    },
    {
      title: "Kho hàng",
      url: "/inventory",
      icon: "Package",
      roles: ["admin", "owner", "accountant"],
      items: [{ title: "Danh sách kho hàng", url: "/inventory" }],
    },
    {
      title: "Đơn hàng",
      url: "/orders",
      icon: "ShoppingCart",
      roles: ["admin", "owner"],
      items: [{ title: "Danh sách đơn hàng", url: "/orders" }],
    },
    {
      title: "Khách hàng",
      url: "/customers",
      icon: "Users",
      roles: ["admin", "owner"],
      items: [{ title: "Danh sách khách hàng", url: "/customers" }],
    },
    {
      title: "Cài đặt",
      url: "/settings",
      icon: "Settings",
      roles: ["admin"],
      items: [{ title: "Cài đặt", url: "/settings" }],
    },
  ],
};
