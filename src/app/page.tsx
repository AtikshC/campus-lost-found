"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  MessagesSquare,
  Search,
  Wand2,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/Chip";



function GlowBlob({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: "easeOut" }}
      className={`glow-blob ${className}`}
    />
  );
}

function Feature({
  icon,
  title,
  desc,
  tag,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: string;
}) {
  return (
    <Card className="p-5 hover:shadow-glow transition">
      <div className="flex items-start justify-between gap-4">
        <div className="h-11 w-11 rounded-2xl bg-mustang-500/15 border border-mustang-500/25 grid place-items-center">
          {icon}
        </div>
        <Chip className="border-mustang-500/25 bg-mustang-500/10">{tag}</Chip>
      </div>
      <div className="mt-4 text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-neutral-200 leading-relaxed">{desc}</div>
    </Card>
  );
}

function Step({
  n,
  title,
  desc,
  icon,
}: {
  n: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-white/7 border border-white/10 grid place-items-center">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <Chip className="bg-white/5 border-white/10">{n}</Chip>
          <div className="font-semibold">{title}</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-neutral-200 leading-relaxed">{desc}</p>
    </Card>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card className="p-5 text-center">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-neutral-300">{label}</div>
    </Card>
  );
}

export default function HomePage() {
  return (
    <div className="relative">
      {/* Animated glow blobs (background life) */}
      <GlowBlob
        delay={0.15}
        className="left-[-140px] top-[120px] h-[320px] w-[320px] rounded-full bg-mustang-500/40"
      />
      <GlowBlob
        delay={0.25}
        className="right-[-120px] top-[80px] h-[280px] w-[280px] rounded-full bg-mustang-400/30"
      />
      <GlowBlob
        delay={0.35}
        className="left-[20%] top-[420px] h-[260px] w-[260px] rounded-full bg-mustang-600/25"
      />

      {/* HERO */}
      <section className="relative">
        <motion.div
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center"
        >
          <motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.05, duration: 0.45, ease: "easeOut" }}
>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Chip className="border-mustang-500/25 bg-mustang-500/10">
                Mustangs Purple
              </Chip>
              <Chip>Campus-first</Chip>
              <Chip>Safe messaging</Chip>
              <Chip>Smart matching</Chip>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Find what you lost.{" "}
              <span className="text-mustang-300">Return what you found.</span>
            </h1>

            <p className="mt-4 text-base md:text-lg text-neutral-200 leading-relaxed max-w-xl">
              Campus Lost & Found with verified posts, in-app messaging,
              and match suggestions
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/create">
                <Button className="px-6 py-3 text-base">
                  Post an item <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/feed">
                <Button variant="secondary" className="px-6 py-3 text-base">
                  Browse feed
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-neutral-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-mustang-300" />
                Keep communication in-app
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-mustang-300" />
                Search + filters
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-mustang-300" />
                Polished UX
              </div>
            </div>
          </motion.div>

          {/* Right side “product preview” */}
          <motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.05, duration: 0.45, ease: "easeOut" }}
>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Lost/Found Items</div>
                <Chip className="border-mustang-500/25 bg-mustang-500/10">
                  Demo cards
                </Chip>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  {
                    t: "LOST • WALLET",
                    title: "Black wallet near UCC",
                    sub: "Has a student card + a small silver keychain.",
                    meta: "UCC Cafeteria • 2h ago",
                  },
                  {
                    t: "FOUND • AIRPODS",
                    title: "Found AirPods in Taylor",
                    sub: "White case, minor scratch on the lid.",
                    meta: "Taylor Library • 1d ago",
                  },
                  {
                    t: "LOST • KEYS",
                    title: "Keys with purple lanyard",
                    sub: "3 keys + gym tag. Might be near the Rec Centre.",
                    meta: "Rec Centre • 3d ago",
                  },
                ].map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
                  >
                    <Card className="p-4 border-mustang-500/10">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Chip className="border-mustang-500/25 bg-mustang-500/10">
                          {c.t}
                        </Chip>
                        <Chip>{c.meta}</Chip>
                      </div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-sm text-neutral-200 mt-1">
                        {c.sub}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="mt-14">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.05, duration: 0.45, ease: "easeOut" }}
>           

           
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            <Feature
              icon={<MessagesSquare className="h-5 w-5 text-mustang-300" />}
              title="Safe messaging"
              desc="Message owners directly without sharing personal contact details."
              tag="Inbox"
            />
            <Feature
              icon={<Search className="h-5 w-5 text-mustang-300" />}
              title="Search + filters"
              desc="Find posts fast using type, category, and keyword search."
              tag="Feed"
            />
            <Feature
              icon={<Wand2 className="h-5 w-5 text-mustang-300" />}
              title="Match suggestions"
              desc="Score-based match candidates shown on each post for faster reunions."
              tag="Matches"
            />
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-14">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.05, duration: 0.45, ease: "easeOut" }}
>

            <h2 className="text-2xl font-semibold">How It Works</h2>
            <br></br>
            
          </motion.div>
        
          <div className="grid md:grid-cols-3 gap-4">
            <Step
              n="Step 1"
              title="Post in seconds"
              desc="Use the guide to add details + photos."
              icon={<Sparkles className="h-5 w-5 text-mustang-300" />}
            />
            <Step
              n="Step 2"
              title="Browse + search"
              desc="Filters, categories, and a clean feed help users find things fast."
              icon={<MapPin className="h-5 w-5 text-mustang-300" />}
            />
            <Step
              n="Step 3"
              title="Message + return"
              desc="In-app chat keeps things private and organized."
              icon={<Clock className="h-5 w-5 text-mustang-300" />}
            />
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="mt-14">
        <div className="grid md:grid-cols-4 gap-4">
          <Stat value="80+" label="Feed loads fast" />
          <Stat value="≤ 6" label="Photos per post" />
          <Stat value="1 click" label="Message owner" />
          <Stat value="Polished" label="UX + animations" />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mt-14">
        <Card className="p-7 border-mustang-500/20 bg-mustang-500/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h3 className="text-2xl font-semibold">
                Ready to reunite someone with their stuff?
              </h3>
              <p className="text-sm text-neutral-200 mt-1">
                Post an item or browse the feed — it takes seconds.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/create">
                <Button className="px-6 py-3 text-base">
                  Post now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/feed">
                <Button variant="secondary" className="px-6 py-3 text-base">
                  Browse feed
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
