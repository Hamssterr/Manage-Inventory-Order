import { Outlet } from "react-router-dom";
import { TooltipProvider } from "./ui/tooltip";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Navbar } from "./navbar";

export const Layout = () => {
  return (
    <TooltipProvider>
      <SidebarProvider className="h-screen overflow-hidden">
        <AppSidebar />

        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          <Navbar />

          {/* Content - Page */}
          <main className="p-2 flex-1 flex flex-col bg-background relative overflow-hidden">
            <Outlet />
          </main>

          {/* Footer */}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};
