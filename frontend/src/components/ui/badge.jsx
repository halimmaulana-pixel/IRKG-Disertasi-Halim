import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:  "border-transparent bg-usu2 text-white",
        core:     "border-transparent bg-cyan-700 text-cyan-100",
        adjacent: "border-transparent bg-blue-900 text-blue-200",
        outside:  "border-transparent bg-gray-700 text-gray-300",
        gold:     "border-transparent bg-amber-800 text-amber-200",
        outline:  "border-border2 text-[var(--text)] bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
