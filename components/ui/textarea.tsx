import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors",
            "border-[#E1E1E1] placeholder:text-gray-400 text-gray-900 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-[#3C366B]/30 focus:border-[#3C366B]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            error && "border-red-400 focus:ring-red-200",
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
Textarea.displayName = "Textarea";

export { Textarea };
