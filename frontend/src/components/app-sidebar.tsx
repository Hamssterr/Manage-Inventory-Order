import * as React from "react";
import { Link, useLocation } from "react-router-dom";

import { SearchForm } from "@/components/search-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  ChevronRight,
  ChevronDown,
  Home,
  Package,
  ShoppingCart,
  Users,
  Navigation,
  ScrollText,
} from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { navigationConfig } from "@/constants/navigation";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Home,
  Package,
  ShoppingCart,
  Users,
  Navigation,
  ScrollText,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasRole } = usePermission();
  const location = useLocation();

  const filteredNavMain = React.useMemo(() => {
    return navigationConfig.navMain.filter((item) => {
      if (!item.roles) return true;
      return hasRole(item.roles);
    });
  }, [hasRole]);

  return (
    <Sidebar {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEndIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Quản Lý Kho</span>
                  <span className="font-light text-xs">
                    & Quản lý hóa đơn, doanh số
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {filteredNavMain.map((item) => {
              const Icon = item.icon ? ICON_MAP[item.icon] : null;
              const hasSubItems = item.items && item.items.length > 0;
              const isChildActive = item.items?.some(
                (sub) => sub.url === location.pathname,
              );
              const isParentActive = location.pathname === item.url;

              if (hasSubItems) {
                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={isChildActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={isChildActive && !isParentActive}
                          tooltip={item.title}
                        >
                          {Icon && <Icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto group-data-[state=open]/collapsible:hidden" />
                          <ChevronDown className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={location.pathname === subItem.url}
                              >
                                <Link to={subItem.url}>{subItem.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isParentActive}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      {Icon && <Icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
