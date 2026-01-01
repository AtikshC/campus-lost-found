"use client";

import "./globals.css";
import Link from "next/link";
import { Toaster } from "sonner";
import { useState } from "react";

function BrandMark() {
  return (
    <div className="h-10 w-10 rounded-2xl bg-mustang-500/15 border border-mustang-400/35 grid place-items-center">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 22s7-4.3 7-11a7 7 0 1 0-14 0c0 6.7 7 11 7 11Z"
          fill="rgba(167,139,250,0.18)"
          stroke="rgba(196,181,253,0.75)"
          strokeWidth="1.4"
        />
        <circle cx="12" cy="11" r="2.2" fill="rgba(196,181,253,0.9)" />
      </svg>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const links = [
    ["Feed", "/feed"],
    ["Post", "/create"],
    ["Inbox", "/inbox"],
    ["Sign in", "/auth"],
  ];

  return (
    <html lang="en">
      <body>
        <Toaster richColors position="top-right" />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <BrandMark />
              <div className="leading-tight hidden sm:block">
                <div className="font-semibold text-white">Campus Lost & Found</div>
                <div className="text-xs text-neutral-300">Western University</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-2 text-sm text-neutral-200">
              {links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="sm:hidden rounded-xl border border-white/15 px-3 py-2 text-sm text-white"
            >
              ☰
            </button>
          </div>

          {/* Mobile dropdown */}
          {open && (
            <div className="sm:hidden border-t border-white/10 bg-black/60 backdrop-blur-md">
              <nav className="flex flex-col px-4 py-3 gap-2">
                {links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
