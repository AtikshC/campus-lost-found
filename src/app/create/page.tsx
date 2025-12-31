"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/lib/useSession";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Chip } from "@/components/ui/Chip";



const categories = [
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

const MAX_FILES = 6;
const MAX_MB = 6;

function isValidImage(file: File) {
  return {
    okType: file.type.startsWith("image/"),
    okSize: file.size <= MAX_MB * 1024 * 1024,
  };
}

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2.5 w-2.5 rounded-full border ${
            i === step
              ? "bg-mustang-500 border-mustang-400 shadow-glow"
              : "bg-white/5 border-white/10"
          }`}
        />
      ))}
    </div>
  );
}

export default function CreatePage() {
  const { token } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0); // 0..3
  const total = 4;

  const [type, setType] = useState<"LOST" | "FOUND">("LOST");
  
  const [category, setCategory] =
    useState<(typeof categories)[number]>("OTHER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [dateOccurred, setDateOccurred] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const preview = useMemo(() => {
    const img = files[0] ? URL.createObjectURL(files[0]) : null;
    return { img };
  }, [files]);

  async function uploadImages(): Promise<string[]> {
    if (files.length === 0) return [];
    const urls: string[] = [];

    for (const f of files.slice(0, MAX_FILES)) {
      const { okType, okSize } = isValidImage(f);
      if (!okType) throw new Error(`${f.name} is not an image`);
      if (!okSize) throw new Error(`${f.name} exceeds ${MAX_MB}MB`);

      const ext = (f.name.split(".").pop() ?? "jpg").toLowerCase();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage.from("post-images").upload(path, f, {
        cacheControl: "3600",
        upsert: false,
        contentType: f.type,
      });

      if (error) throw new Error(error.message);

      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    return urls;
  }

  function canNext() {
    if (step === 0) return true;
    if (step === 1) return title.trim().length >= 3 && description.trim().length >= 10;
    if (step === 2) return locationText.trim().length >= 2;
    return true;
  }

  async function publish() {
    if (!token) return toast.error("Please sign in first.");

    // lightweight validation
    if (title.trim().length < 3) return toast.error("Title is too short.");
    if (description.trim().length < 10) return toast.error("Description needs more detail.");
    if (locationText.trim().length < 2) return toast.error("Location is required.");

    setLoading(true);
    toast.loading("Publishing...", { id: "publish" });

    try {
      const imageUrls = await uploadImages();

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          title,
          description,
          category,
          locationText,
          dateOccurred: new Date(dateOccurred).toISOString(),
          imageUrls,
        }),
      });

      // ✅ FIX: never parse HTML as JSON
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server returned non-JSON: ${text.slice(0, 160)}...`);
      }

      const raw = await res.text();

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Server returned non-JSON: ${raw.slice(0, 200)}...`);
      }

      if (!res.ok) {
        console.error("Create post failed:", data);
        throw new Error(data?.error ?? `Failed to create post (status ${res.status})`);
      }


      toast.success("Posted!", { id: "publish" });
      router.push(`/post/${data.post.id}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Something went wrong", { id: "publish" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Create a Post</h1>
          <p className="text-sm text-neutral-300">
            A smooth wizard flow — clean, fast, and safe.
          </p>
        </div>
        <StepDots step={step} total={total} />
      </div>

      <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-5">
        <Card className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              {step === 0 && (
                <>
                  <div className="space-y-1">
                    <div className="text-sm text-neutral-200">Step 1</div>
                    <div className="text-xl font-semibold">Lost or Found?</div>
                    <div className="text-sm text-neutral-300">
                      Pick the post type, category, and optionally add photos.
                    </div>
                  </div>

                  <div className="flex gap-2">
  <button
    type="button"
    onClick={() => setType("LOST")}
    className={[
      "rounded-xl px-4 py-2 text-sm border transition",
      type === "LOST"
        ? "bg-white text-black border-white"
        : "bg-white/5 text-white border-white/15 hover:bg-white/10",
    ].join(" ")}
  >
    Lost
  </button>

  <button
    type="button"
    onClick={() => setType("FOUND")}
    className={[
      "rounded-xl px-4 py-2 text-sm border transition",
      type === "FOUND"
        ? "bg-white text-black border-white"
        : "bg-white/5 text-white border-white/15 hover:bg-white/10",
    ].join(" ")}
  >
    Found
  </button>
</div>

                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`rounded-full px-3 py-1 text-xs border transition ${
                          category === c
                            ? "bg-mustang-500/20 border-mustang-400/40 text-white"
                            : "bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Photos (optional)</div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setFiles(Array.from(e.target.files ?? []).slice(0, MAX_FILES))
                      }
                    />
                    {files.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {files.map((f, i) => (
                          <div
                            key={i}
                            className="text-xs truncate rounded-xl bg-white/7 border border-white/10 px-3 py-2"
                          >
                            {f.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-1">
                    <div className="text-sm text-neutral-200">Step 2</div>
                    <div className="text-xl font-semibold">Describe it</div>
                    <div className="text-sm text-neutral-300">
                      Clear details help matching later.
                    </div>
                  </div>

                  <Input
                    placeholder="Title (e.g., Black wallet with student card)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Describe it clearly. Any identifying marks?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[140px]"
                  />

                  <div className="flex flex-wrap gap-2">
                    <Chip>{type}</Chip>
                    <Chip>{category}</Chip>
                    <Chip>{title.trim().length}/80 title</Chip>
                    <Chip>{description.trim().length}/2000 desc</Chip>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-1">
                    <div className="text-sm text-neutral-200">Step 3</div>
                    <div className="text-xl font-semibold">Where & when</div>
                    <div className="text-sm text-neutral-300">
                      Location text + date/time.
                    </div>
                  </div>

                  <Input
                    placeholder="Location (e.g., UCC Cafeteria)"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                  />
                  <div className="space-y-2">
                    <div className="text-sm text-neutral-200">Date / time</div>
                    <input
                      type="datetime-local"
                      className="rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-mustang-400/60 focus:ring-2 focus:ring-mustang-500/25"
                      value={dateOccurred}
                      onChange={(e) => setDateOccurred(e.target.value)}
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-1">
                    <div className="text-sm text-neutral-200">Step 4</div>
                    <div className="text-xl font-semibold">Preview & publish</div>
                    <div className="text-sm text-neutral-300">
                      Make sure it looks right.
                    </div>
                  </div>

                  <Card className="p-4 border-mustang-500/20">
                    <div className="flex gap-4">
                      <div className="h-24 w-28 rounded-2xl bg-white/7 border border-white/10 overflow-hidden">
                        {preview.img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={preview.img}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-xs text-neutral-300">
                            No photo
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex gap-2 flex-wrap mb-2">
                          <Chip className="border-mustang-500/25 bg-mustang-500/10">
                            {type}
                          </Chip>
                          <Chip>{category}</Chip>
                          <Chip>{locationText || "No location yet"}</Chip>
                        </div>
                        <div className="font-semibold truncate">
                          {title || "Untitled"}
                        </div>
                        <div className="text-sm text-neutral-200 line-clamp-2">
                          {description || "No description yet"}
                        </div>
                        <div className="text-xs text-neutral-300 mt-1">
                          {new Date(dateOccurred).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Button
                    className="w-full py-3 text-base"
                    disabled={loading}
                    onClick={publish}
                  >
                    {loading ? "Publishing..." : "Publish"}
                  </Button>
                </>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0 || loading}
                >
                  Back
                </Button>

                {step < total - 1 ? (
                  <Button
                    onClick={() => {
                      if (!canNext()) return toast.error("Finish this step first.");
                      setStep((s) => Math.min(total - 1, s + 1));
                    }}
                    disabled={loading}
                  >
                    Next
                  </Button>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="font-semibold">Pro tips</div>
            <ul className="mt-2 space-y-2 text-sm text-neutral-200">
              <li>• Add 1 unique detail (sticker, scratch, keychain).</li>
              <li>• Use the building name + room area.</li>
              <li>• For wallets/IDs, avoid sensitive numbers.</li>
            </ul>
          </Card>

          <Card className="p-5 border-mustang-500/20 bg-mustang-500/10">
            <div className="font-semibold">Safety</div>
            <p className="mt-2 text-sm text-neutral-200">
              Keep communication in-app. Meet in public. Don’t share addresses.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
