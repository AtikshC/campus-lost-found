import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  type,
  onMouseUp,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition " +
    "active:scale-[0.99] focus:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-mustang-200/80 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-mustang-500 to-mustang-400 hover:from-mustang-400 hover:to-mustang-300 text-white shadow-glow"
      : variant === "secondary"
      ? "bg-white/7 hover:bg-white/10 text-white border border-white/10"
      : variant === "danger"
      ? "bg-red-500/90 hover:bg-red-500 text-white"
      : "hover:bg-white/10 text-white";

  return (
    <button
      type={type ?? "button"} // ✅ IMPORTANT FIX
      className={cn(base, styles, className)}
      onMouseUp={(e) => {
        onMouseUp?.(e);
        e.currentTarget.blur(); // keeps focus ring from sticking
      }}
      {...props}
    />
  );
}
