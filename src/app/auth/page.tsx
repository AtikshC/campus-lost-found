"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  function isWesternEmail(e: string) {
  const domain = e.trim().toLowerCase().split("@")[1] ?? "";
  return domain === "uwo.ca" || domain === "westernu.ca";
}


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentEmail(data.user?.email ?? null));
  }, []);

  async function submit() {
  const e = email.trim().toLowerCase();
  if (!e || !password) return toast.error("Enter email + password");

  if (!isWesternEmail(e)) {
    return toast.error("Please use your Western email (uwo.ca or westernu.ca).");
  }

  if (mode === "signup") {
    const { error } = await supabase.auth.signUp({ email: e, password });

    if (error) {
      // if the email is already registered, push them to sign in
      const msg = error.message.toLowerCase();

      if (
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("user already") ||
        msg.includes("already been registered") ||
        msg.includes("already exists")
      ) {
        toast.error("That email is already registered. Please sign in instead.");
        setMode("signin");
        return;
      }

      return toast.error(error.message);
    }

    toast.success("Account created! Now sign in.");
    setMode("signin");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: e, password });
  if (error) return toast.error(error.message);

  toast.success(`Welcome back${data.user?.email ? `, ${data.user.email}` : ""}!`);
  setCurrentEmail(data.user?.email ?? null);
}


  async function signOut() {
    await supabase.auth.signOut();
    setCurrentEmail(null);
    toast.success("Signed out.");
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Card className="p-6 space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Welcome</h1>
          <p className="text-sm text-neutral-300">
            Sign in to post items, message owners, and track matches.
          </p>
        </div>

        {currentEmail ? (
          <Card className="p-4 border-mustang-500/25 bg-mustang-500/10">
            <div className="text-sm text-neutral-200">Signed in as</div>
            <div className="font-semibold">{currentEmail}</div>
            <div className="mt-3 flex gap-2">
              <Link href="/feed"><Button>Go to Feed</Button></Link>
              <Button variant="secondary" onClick={signOut}>Sign out</Button>
            </div>
          </Card>
        ) : (
          <>
            <Input
              placeholder="email@school.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button onClick={submit} className="w-full py-3 text-base">
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              Switch to {mode === "signin" ? "Sign up" : "Sign in"}
            </Button>
            <Button
  variant="ghost"
  className="w-full"
  onClick={async () => {
    if (!email) return toast.error("Enter your email first.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent!");
  }}
>
  Forgot password?
</Button>

          </>
          
        )}
      </Card>
    </div>
  );
}
