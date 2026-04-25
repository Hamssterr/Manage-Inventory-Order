import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, indeterminate, ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => internalRef.current!);

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate]);

    return (
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          className={cn(
            "peer h-4.5 w-4.5 shrink-0 appearance-none rounded-md border border-slate-300 bg-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary",
            className
          )}
          ref={internalRef}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <Check className="absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" />
        {indeterminate && (
          <div className="absolute h-0.5 w-2.5 bg-slate-400 rounded-px pointer-events-none" />
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
