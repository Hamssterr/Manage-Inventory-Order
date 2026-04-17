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
      roles: ["admin", "owner", "accountant", "salers"],
      items: [{ title: "Danh sách sản phẩm", url: "/products" }],
    },
    {
      title: "Kho hàng",
      url: "/inventory",
      icon: "Package",
      roles: ["admin", "owner", "accountant", "salers"],
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
      roles: ["admin", "owner", "accountant", "salers"],
      items: [{ title: "Danh sách khách hàng", url: "/customers" }],
    },
    {
      title: "Tuyến đường",
      url: "/routes",
      icon: "Navigation",
      roles: ["admin"],
      items: [{ title: "Danh sách tuyến đường", url: "/routes" }],
    },
  ],
};
