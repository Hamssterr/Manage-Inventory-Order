import type { UserRole } from "./user";

export interface NavItem {
  title: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  roles: UserRole[];
  items?: {
    title: string;
    url: string;
  }[];
}

export interface NavigationConfig {
  navMain: NavItem[];
}
