import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#111827] text-white",
        planned: "border-transparent bg-[#EFF6FF] text-[#2563EB]",
        inProgress: "border-transparent bg-[#FFFBEB] text-[#D97706]",
        done: "border-transparent bg-[#ECFDF5] text-[#059669]",
        outline: "text-[#6B7280] border-[#E5E7EB] bg-white",
        secondary: "border-transparent bg-[#F3F4F6] text-[#374151]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
