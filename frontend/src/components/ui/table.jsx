import { cn } from "@/lib/utils"

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("border-b border-[var(--border)]", className)} {...props} />
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-[var(--border)] transition-colors",
        "hover:bg-[var(--bg2)] data-[state=selected]:bg-[var(--bg3)]",
        className
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "h-9 px-4 text-left align-middle font-medium text-[var(--muted)] text-xs uppercase tracking-wider",
        className
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }) {
  return (
    <td className={cn("px-4 py-2.5 align-middle text-[var(--text)]", className)} {...props} />
  )
}

export function TableCaption({ className, ...props }) {
  return <caption className={cn("mt-4 text-sm text-[var(--muted)]", className)} {...props} />
}
