"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { fetchJSON } from "@/lib/fetchJSON";

type Conversation = {
  id: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    type?: "LOST" | "FOUND";
    images: { url: string }[];
  };
  owner?: { id: string; email: string | null };
  buyer?: { id: string; email: string | null };
  ownerId: string;
  buyerId: string;
};

function whoAmIEmail(convo: Conversation, myId: string | null) {
  if (!myId) return "";
  const other =
    convo.ownerId === myId ? convo.buyer?.email ?? "" : convo.owner?.email ?? "";
  return other || "";
}

export default function InboxPage() {
  const { token, user, loading: authLoading } = useAuth();
  const myId = user?.id ?? null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchJSON<{ conversations: Conversation[] }>("/api/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((d) => setConversations(d.conversations ?? []))
      .finally(() => setLoading(false));
  }, [token, user, authLoading]);

  const unreadHint = useMemo(() => {
    // Optional: you can replace this with a real unread count later
    return conversations.length > 0;
  }, [conversations.length]);

  if (authLoading || loading) {
    return (
      <div className="text-neutral-200">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-md">
          Loading inbox…
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur-md">
        <h1 className="text-xl font-semibold text-white">Inbox</h1>
        <p className="mt-2 text-neutral-200">Sign in to see your conversations.</p>
        <Link
          href="/auth"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-black font-semibold hover:bg-neutral-200"
        >
          Go to Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          Inbox
          {unreadHint && (
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-mustang-300 shadow-glow" />
          )}
        </h1>
        <div className="text-xs text-neutral-300">
          {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur-md">
          <p className="text-neutral-200">No conversations yet.</p>
          <p className="mt-2 text-sm text-neutral-300">
            Go to any post and tap <b>Message</b>.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {conversations.map((c) => {
            const thumb = c.post.images?.[0]?.url;
            const otherEmail = whoAmIEmail(c, myId);
            const kind = c.post.type === "FOUND" ? "Found" : "Lost";

            return (
              <Link
                key={c.id}
                href={`/inbox/${c.id}`}
                className="group rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur-md hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/10 bg-white/5 grid place-items-center shrink-0">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-[10px] text-neutral-300">IMG</div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs text-neutral-300">
                      {kind} • {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-white font-semibold truncate">{c.post.title}</div>
                    <div className="text-xs text-neutral-200 truncate">
                      {otherEmail ? `Chat with ${otherEmail}` : "Open conversation"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <span className="text-xs text-neutral-200 group-hover:text-white">
                    Open →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
