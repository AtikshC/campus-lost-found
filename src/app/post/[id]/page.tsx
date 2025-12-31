"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { fetchJSON } from "@/lib/fetchJSON";
import { useAuth } from "@/lib/useAuth";
type PostType = "LOST" | "FOUND";
const PostType = { LOST: "LOST", FOUND: "FOUND" } as const;

type Img = { id: string; url: string };
type User = { id: string; email: string };
type Post = {
  id: string;
  type: PostType;
  title: string;
  description: string;
  category: string;
  locationText: string;
  dateOccurred: string;
  status: "OPEN" | "MATCHED" | "CLOSED";
  createdAt: string;
  createdById: string;
  createdBy: User;
  images: Img[];
};

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user: localUser } = useAuth();

  const id = params?.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<null | "delete">(null);


  const isOwner = useMemo(() => {
  if (!post?.createdById) return false;
  if (!localUser?.id) return false;
  return localUser.id === post.createdById;
}, [localUser?.id, post?.createdById]);


  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchJSON<{ post: Post }>(`/api/posts/${id}`);
      setPost(data.post);
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn’t load post");
      setPost(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function startConversation() {
  if (!token) return toast.error("Sign in first");
  if (!post?.id) return toast.error("Missing post id");
  if (!post?.createdById) return toast.error("Missing owner id");

  try {
    const res = await fetch("/api/conversations/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        postId: post.id,
        ownerId: post.createdById, // IMPORTANT: must match API expects "ownerId"
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? "Failed to start conversation");

    // go to inbox with the created conversation selected
    router.push(`/inbox/${data.conversation.id}`);
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message ?? "Failed to start conversation");
  }
}




  async function deletePost() {
    if (!token) return toast.error("Sign in first.");
    if (!id) return;

    setBusy("delete");
    const t = toast.loading("Deleting...", { id: "post-action" });

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to delete");

      toast.success("Deleted", { id: "post-action" });
      router.push("/feed");
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed", { id: "post-action" });
      setBusy(null);
    }
  }
  

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-mustang-500/20 blur-3xl" />
        <div className="space-y-4">
          <div className="h-7 w-64 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-xl bg-white/10 animate-pulse" />
          <div className="grid gap-4 md:grid-cols-3 mt-8">
            <div className="md:col-span-2 h-64 rounded-2xl bg-white/10 animate-pulse" />
            <div className="h-64 rounded-2xl bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/30 p-8">
        <div className="text-xl font-semibold text-white">Couldn’t load this post</div>
        <div className="text-sm text-neutral-300 mt-2">It may have been deleted or the link is wrong.</div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={load}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
          >
            Retry
          </button>
          <Link
            href="/feed"
            className="rounded-xl bg-white text-black px-4 py-2 text-sm hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
          >
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const badge =
    post.status === "OPEN"
      ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/30"
      : post.status === "MATCHED"
      ? "bg-sky-400/15 text-sky-200 border-sky-400/30"
      : "bg-neutral-400/15 text-neutral-200 border-neutral-400/30";

  return (
    <div className="relative">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-mustang-500/18 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-mustang-400/14 blur-3xl" />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-neutral-300">
                  {post.type === "LOST" ? "Lost item" : "Found item"} • {post.category}
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {post.title}
                </h1>
              </div>

              <div className={`rounded-full border px-3 py-1 text-xs ${badge}`}>
                {post.status}
              </div>
            </div>

            <div className="mt-4 text-neutral-200 leading-relaxed">
              {post.description}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-neutral-300">Location</div>
                <div className="mt-1 text-sm text-white">{post.locationText}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-neutral-300">Date/time</div>
                <div className="mt-1 text-sm text-white">
                  {new Date(post.dateOccurred).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Images / gallery */}
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-white">Photos</div>
              <div className="text-xs text-neutral-300">{post.images?.length ?? 0} attached</div>
            </div>

            {post.images?.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {post.images.map((img) => (
                  <a
                    key={img.id}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt=""
                      className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-neutral-300">
                No photos for this post yet.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-md">
            <div className="text-sm text-neutral-300">Posted by</div>
            <div className="mt-2 font-medium text-white">{post.createdBy?.email}</div>

            <div className="mt-5 flex flex-col gap-2">
  <button
    onClick={startConversation}
    className="w-full rounded-xl bg-white text-black px-4 py-2 font-semibold hover:bg-neutral-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustang-300"
  >
    Message
  </button>

  {isOwner ? (
    <button
      disabled={busy !== null}
      onClick={deletePost}
      className="rounded-xl bg-red-500/15 border border-red-400/30 px-4 py-2 text-sm text-red-100 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60"
    >
      Delete post
    </button>
  ) : (
    <div className="text-xs text-neutral-300 mt-2">
      You don’t have access to modify this post.
    </div>
  )}
</div>

          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-md">
            <div className="text-sm font-semibold text-white">Safety tips</div>
            <ul className="mt-3 space-y-2 text-sm text-neutral-200">
              <li>• Meet in a public place on campus.</li>
              <li>• Don’t share sensitive info in chat.</li>
              <li>• If it’s valuable, bring a friend.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
