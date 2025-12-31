"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { fetchJSON } from "@/lib/fetchJSON";

export function InboxNavLink() {
  const { token, user, loading } = useAuth();
  const [hasAny, setHasAny] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!token || !user?.id) {
      setHasAny(false);
      return;
    }

    fetchJSON<{ conversations: any[] }>("/api/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((d) => setHasAny((d.conversations ?? []).length > 0))
      .catch(() => setHasAny(false));
  }, [token, user?.id, loading]);

  return (
    <Link
      href="/inbox"
      className="relative rounded-xl px-3 py-2 hover:text-white hover:bg-white/5
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
    >
      Inbox
      {hasAny && (
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-mustang-400 ring-2 ring-black/40" />
      )}
    </Link>
  );
}
