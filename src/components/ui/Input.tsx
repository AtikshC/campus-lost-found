import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-mustang-400/60 focus:ring-2 focus:ring-mustang-500/25",
        className
      )}
      {...props}
    />
  );
}
