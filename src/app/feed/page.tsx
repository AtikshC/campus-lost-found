"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";

type Post = {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  category: string;
  locationText: string;
  dateOccurred: string;
  createdAt: string;
  images: { url: string }[];
};

const categories = [
  "ALL",
  "PHONE",
  "WALLET",
  "KEYS",
  "LAPTOP",
  "ID_CARD",
  "AIRPODS",
  "BAG",
  "CLOTHING",
  "OTHER",
] as const;

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<"ALL" | "LOST" | "FOUND">("ALL");
  const [cat, setCat] = useState<(typeof categories)[number]>("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (type !== "ALL" && p.type !== type) return false;
      if (cat !== "ALL" && p.category !== cat) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.locationText.toLowerCase().includes(query)
      );
    });
  }, [posts, type, cat, q]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">Feed</h2>
          <p className="text-sm text-neutral-200">
            Search, filter, and find matches fast.
          </p>
        </div>
        <Link href="/create">
          <Button>Post an item</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 items-center">
          <Input
            placeholder="Search title, location, description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {/* ✅ FIXED segmented control */}
          <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 gap-1 justify-self-start">
            {(["ALL", "LOST", "FOUND"] as const).map((x) => {
              const selected = type === x;
              return (
                <button
                  key={x}
                  type="button"
                  onClick={() => setType(x)}
                  className={[
                    "px-4 py-2 rounded-2xl text-sm font-semibold transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-mustang-200/70",
                    selected
                      ? "bg-mustang-500/20 border border-mustang-400/30 text-white shadow-glow"
                      : "text-neutral-200 hover:bg-white/10 border border-transparent",
                  ].join(" ")}
                >
                  {x}
                </button>
              );
            })}
          </div>

          <select
            className="rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white outline-none focus:border-mustang-400/60 focus:ring-2 focus:ring-mustang-500/25"
            value={cat}
            onChange={(e) => setCat(e.target.value as any)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-44 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </Card>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-xl font-semibold">No results</div>
          <p className="text-sm text-neutral-200 mt-2">
            Try clearing filters or searching a different keyword.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p) => (
            <Link key={p.id} href={`/post/${p.id}`}>
              <Card className="overflow-hidden hover:shadow-glow transition">
                <div className="h-44 bg-white/5 border-b border-white/10">
                  {p.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0].url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-sm text-neutral-200">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Chip className="border-mustang-500/25 bg-mustang-500/10">
                      {p.type}
                    </Chip>
                    <Chip>{p.category}</Chip>
                    <Chip>{p.locationText}</Chip>
                  </div>
                  <div className="font-semibold line-clamp-1">{p.title}</div>
                  <div className="text-sm text-neutral-200 line-clamp-2">
                    {p.description}
                  </div>
                  <div className="text-xs text-neutral-300">
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
