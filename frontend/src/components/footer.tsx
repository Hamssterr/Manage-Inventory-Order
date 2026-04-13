import * as React from "react";
import { cn } from "@/lib/utils";

// Định nghĩa các thuộc tính cơ bản
interface PageFooterProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  sticky?: boolean; // Tùy chọn để cố định hoặc không
}

export const PageFooter = React.forwardRef<HTMLElement, PageFooterProps>(
  ({ className, children, sticky = true, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          "h-16 border-t bg-background px-6 flex items-center shrink-0",
          sticky && "sticky bottom-0 z-10",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between w-full gap-4">
          {children}
        </div>
      </footer>
    );
  },
);

PageFooter.displayName = "PageFooter";
