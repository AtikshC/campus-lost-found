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

type ConversationMini = {
  id: string;
  ownerId: string;
  buyerId: string;
  owner?: { id: string; email: string | null; name: string | null };
  buyer?: { id: string; email: string | null; name: string | null };
};

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params?.id;

  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [msgsLoading, setMsgsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  // Optional: fetch conversation list so we can show the other email
  const [conv, setConv] = useState<ConversationMini | null>(null);

  const otherEmail = useMemo(() => {
    if (!conv || !userId) return null;
    return conv.ownerId === userId ? conv.buyer?.email : conv.owner?.email;
  }, [conv, userId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !conversationId) return;

    fetchJSON<{ conversations: ConversationMini[] }>("/api/conversations")
      .then((d) => {
        const found = (d.conversations ?? []).find((x) => x.id === conversationId) ?? null;
        setConv(found);
      })
      .catch(() => {});
  }, [authLoading, user, conversationId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !userId || !conversationId) {
      setMsgsLoading(false);
      return;
    }

    setMsgsLoading(true);
    fetchJSON<{ messages: Message[] }>(`/api/conversations/${conversationId}/messages`)
      .then((d) => setMessages(d.messages ?? []))
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load messages");
      })
      .finally(() => setMsgsLoading(false));
  }, [user, userId, conversationId, authLoading]);

  async function send() {
    if (!user || !userId) return toast.error("Sign in first");
    if (!conversationId) return toast.error("Missing conversation id");
    const content = draft.trim();
    if (!content) return;

    try {
      const data = await fetchJSON<{ message: Message }>(
        `/api/conversations/${conversationId}/messages`,
        { method: "POST", body: JSON.stringify({ content }) }
      );

      setDraft("");
      setMessages((prev) => [...prev, data.message]);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Send failed");
    }
  }

  if (authLoading) return <div className="text-neutral-300">Loading…</div>;

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/30 p-10 backdrop-blur-md">
        <div className="text-2xl font-semibold">Inbox</div>
        <div className="mt-2 text-neutral-300">Sign in to view and send messages.</div>
        <Link
          className="mt-6 inline-flex items-center rounded-xl border border-white/20 px-4 py-2 hover:bg-white/5"
          href="/auth"
        >
          Go to Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md flex flex-col">
      <div className="border-b border-white/10 p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-400">Chat</div>
          <div className="font-semibold">
            Conversation • {otherEmail ?? "Unknown"}
          </div>
        </div>
        <Link
          href="/inbox"
          className="rounded-xl border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
        >
          Back
        </Link>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {msgsLoading && <div className="text-sm text-neutral-300">Loading messages…</div>}

        {!msgsLoading && messages.length === 0 && (
          <div className="text-sm text-neutral-300">No messages yet. Say hi 👋</div>
        )}

        <div className="space-y-3">
          {messages.map((m) => {
            const mine = m.senderId === userId;
            return (
              <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={[
                    "max-w-[80%] rounded-2xl px-4 py-2 border",
                    mine ? "bg-white/10 border-white/15" : "bg-black/30 border-white/10",
                  ].join(" ")}
                >
                  <div className="text-sm text-neutral-100 whitespace-pre-wrap">{m.content}</div>
                  <div className="mt-1 text-[10px] text-neutral-400">
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2 items-center">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message…"
            className="flex-1 rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-neutral-300 outline-none focus:border-white/30"
          />
          <button
            onClick={send}
            className="rounded-2xl px-4 py-3 text-sm border border-white/20 bg-white text-black hover:bg-neutral-200"
          >
            Send
          </button>
        </div>
        <div className="mt-2 text-xs text-neutral-300">
          Keep it safe: don’t share sensitive info.
        </div>
      </div>
    </div>
  );
}
