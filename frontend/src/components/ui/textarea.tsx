import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn("flex min-h-[80px] w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#111827] disabled:cursor-not-allowed disabled:opacity-50", className)}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"
export { Textarea }
