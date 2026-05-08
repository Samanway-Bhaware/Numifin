import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors",
            "border-[rgba(26,26,26,0.12)] placeholder:text-[rgba(26,26,26,0.3)] text-[#1a1a1a]",
            "focus:outline-none focus:ring-2 focus:ring-[#94af74]/40 focus:border-[#94af74]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F7F7F5]",
            error && "border-red-400 focus:ring-red-200 focus:border-red-400",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
