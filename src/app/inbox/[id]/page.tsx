"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/useAuth";
import { fetchJSON } from "@/lib/fetchJSON";

type Message = {
  id: string;
  createdAt: string;
  content: string;
  senderId: string;
  sender?: { id: string; email: string | null; name: string | null };
};

type Conversation = {
  id: string;
  ownerId: string;
  buyerId: string;
  owner?: { id: string; email: string | null };
  buyer?: { id: string; email: string | null };
};

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params?.id;

  const { token, user, loading: authLoading } = useAuth();
  const myId = user?.id ?? null;

  const [convo, setConvo] = useState<Conversation | null>(null);

  const [msgsLoading, setMsgsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  const otherEmail = useMemo(() => {
    if (!convo || !myId) return "";
    const other =
      convo.ownerId === myId ? convo.buyer?.email ?? "" : convo.owner?.email ?? "";
    return other || "";
  }, [convo, myId]);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !myId || !conversationId) {
      setMsgsLoading(false);
      return;
    }

    // Load conversation meta (for email label)
    fetchJSON<{ conversation: Conversation }>(`/api/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((d) => setConvo(d.conversation))
      .catch(() => setConvo(null));

    // Load messages
    setMsgsLoading(true);
    fetchJSON<{ messages: Message[] }>(`/api/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((d) => setMessages(d.messages ?? []))
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load messages");
      })
      .finally(() => setMsgsLoading(false));
  }, [token, myId, conversationId, authLoading]);

  async function send() {
    if (!token || !myId) return toast.error("Sign in first");
    if (!conversationId) return toast.error("Missing conversation id");
    const content = draft.trim();
    if (!content) return;

    try {
      const data = await fetchJSON<{ message: Message }>(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content }),
        }
      );

      setDraft("");
      setMessages((prev) => [...prev, data.message]);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Send failed");
    }
  }

  if (authLoading) return <div className="text-neutral-200">Loading…</div>;

  if (!token || !user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/30 p-10 backdrop-blur-md">
        <div className="text-2xl font-semibold text-white">Inbox</div>
        <div className="mt-2 text-neutral-200">Sign in to view and send messages.</div>
        <Link
          className="mt-6 inline-flex items-center rounded-xl bg-white px-4 py-2 text-black font-semibold hover:bg-neutral-200"
          href="/auth"
        >
          Go to Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-9rem)] sm:h-auto rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md flex flex-col overflow-hidden">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur-md p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-300">Chat</div>
          <div className="font-semibold text-white">
            {otherEmail ? `Chat with ${otherEmail}` : "Conversation"}
          </div>
        </div>
        <Link
          href="/inbox"
          className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-neutral-100 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
        >
          Back
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-auto">
        {msgsLoading && <div className="text-sm text-neutral-200">Loading messages…</div>}

        {!msgsLoading && messages.length === 0 && (
          <div className="text-sm text-neutral-200">No messages yet. Say hi 👋</div>
        )}

        <div className="space-y-3">
          {messages.map((m) => {
            const mine = m.senderId === myId;
            return (
              <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={[
                    "max-w-[85%] rounded-2xl px-4 py-2 border shadow-sm",
                    mine
                      ? "bg-mustang-500/20 border-mustang-300/30 text-white"
                      : "bg-white/10 border-white/15 text-white",
                  ].join(" ")}
                >
                  <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                  <div className="mt-1 text-[10px] text-neutral-200/70">
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky composer */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-md p-3">
        <div className="flex gap-2 items-center">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message…"
            className="flex-1 rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-neutral-200/70 outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />
          <button
            onClick={send}
            className="rounded-2xl px-4 py-3 text-sm font-semibold border border-mustang-300/30 bg-mustang-500/25 text-white hover:bg-mustang-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
          >
            Send
          </button>
        </div>
        <div className="mt-2 text-xs text-neutral-200/80">
          Keep it safe: don’t share sensitive info.
        </div>
      </div>
    </div>
  );
}
