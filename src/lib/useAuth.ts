"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

type AuthUser = { id: string; email: string | null };

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();

      const session = data.session;
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      setUser({ id: session.user.id, email: session.user.email ?? null });
      setToken(session.access_token);
      setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        setToken(null);
        return;
      }
      setUser({ id: session.user.id, email: session.user.email ?? null });
      setToken(session.access_token);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, token, loading };
}
