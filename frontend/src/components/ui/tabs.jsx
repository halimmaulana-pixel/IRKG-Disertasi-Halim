import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-9 items-center rounded-lg bg-[var(--bg2)] p-1 border border-[var(--border)]",
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium",
        "text-[var(--muted)] transition-all",
        "data-[state=active]:bg-[var(--card)] data-[state=active]:text-[var(--text)] data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-2 focus-visible:outline-none", className)}
      {...props}
    />
  )
}
