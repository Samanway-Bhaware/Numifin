import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:   "bg-[rgba(148,175,116,0.15)] text-[#3a5c24] border border-[rgba(148,175,116,0.3)]",
        secondary: "bg-[rgba(26,26,26,0.06)] text-[rgba(26,26,26,0.7)]",
        accent:    "bg-[#c5e88a] text-[#2d4a1a] font-medium",
        success:   "bg-green-50 text-green-700 border border-green-200",
        warning:   "bg-amber-50 text-amber-700 border border-amber-200",
        error:     "bg-red-50 text-red-700 border border-red-200",
        outline:   "border border-[rgba(26,26,26,0.15)] text-[rgba(26,26,26,0.7)]",
        dark:      "bg-[#1a1a1a] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
