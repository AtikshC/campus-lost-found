"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { fetchJSON } from "@/lib/fetchJSON";

type Conversation = {
  id: string;
  createdAt: string;
  ownerId: string;
  buyerId: string;
  owner?: { id: string; email: string | null; name: string | null };
  buyer?: { id: string; email: string | null; name: string | null };
  post: { id: string; title: string; images: { url: string }[] };
};

export default function InboxPage() {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchJSON<{ conversations: Conversation[] }>("/api/conversations")
      .then((d) => setConversations(d.conversations ?? []))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="text-neutral-300">Loading inbox…</div>;

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/30 p-8">
        <h1 className="text-xl font-semibold text-white">Inbox</h1>
        <p className="mt-2 text-neutral-300">Sign in to see your conversations.</p>
        <Link href="/auth" className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-black">
          Go to Sign in
        </Link>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/30 p-8">
        <h1 className="text-xl font-semibold text-white">Inbox</h1>
        <p className="mt-2 text-neutral-300">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Inbox</h1>

      {conversations.map((c) => {
        const otherEmail =
          c.ownerId === user.id ? c.buyer?.email : c.owner?.email;

        return (
          <Link
            key={c.id}
            href={`/inbox/${c.id}`}
            className="block rounded-2xl border border-white/10 bg-black/30 p-4 hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              {c.post.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.post.images[0].url}
                  className="h-12 w-12 rounded-lg object-cover"
                  alt=""
                />
              )}
              <div className="min-w-0">
                <div className="text-white font-medium truncate">{c.post.title}</div>
                <div className="text-xs text-neutral-400 truncate">
                  Conversation • {otherEmail ?? "Unknown"}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
