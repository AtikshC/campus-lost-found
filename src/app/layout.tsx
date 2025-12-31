import "./globals.css";
import Link from "next/link";
import { Toaster } from "sonner";
import { InboxNavLink } from "@/components/ui/InboxNavLink";


function BrandMark() {
  return (
    <div className="h-10 w-10 rounded-2xl bg-mustang-500/15 border border-mustang-400/35 grid place-items-center shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        {/* pin */}
        <path
          d="M12 22s7-4.3 7-11a7 7 0 1 0-14 0c0 6.7 7 11 7 11Z"
          fill="rgba(167,139,250,0.18)"
          stroke="rgba(196,181,253,0.75)"
          strokeWidth="1.4"
        />
        <circle cx="12" cy="11" r="2.2" fill="rgba(196,181,253,0.9)" />
        {/* sparkle */}
        <path
          d="M18.4 4.6l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z"
          fill="rgba(255,255,255,0.85)"
        />
      </svg>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-md">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="transition group-hover:scale-[1.02]">
                  <BrandMark />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold tracking-tight text-white">Campus Lost & Found</div>
                  <div className="text-xs text-neutral-300">Western University</div>
                </div>
              </Link>

              <nav className="flex items-center gap-3 text-sm text-neutral-200">
  <Link
    href="/feed"
    className="rounded-xl px-3 py-2 hover:text-white hover:bg-white/5
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
  >
    Feed
  </Link>

  <Link
    href="/create"
    className="rounded-xl px-3 py-2 hover:text-white hover:bg-white/5
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
  >
    Post
  </Link>

  <InboxNavLink />

  <Link
    href="/auth"
    className="rounded-xl px-3 py-2 hover:text-white hover:bg-white/5
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
  >
    Sign in
  </Link>
</nav>

            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
