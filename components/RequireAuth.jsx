"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Spinner from "./Spinner";

// Client-side auth gate for the static export (GitHub Pages has no server
// to check sessions on every request, so this replaces the old
// middleware.js + per-page redirect() pattern). Real data protection still
// comes from Supabase RLS — this is routing/UX only.
export default function RequireAuth({ children }) {
  const router = useRouter();
  const [state, setState] = useState({ status: "loading", user: null, profile: null });

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_manager")
        .eq("id", user.id)
        .maybeSingle();

      if (active) setState({ status: "ready", user, profile });
    }

    load();
    return () => {
      active = false;
    };
  }, [router]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="carregando..." />
      </div>
    );
  }

  return children(state.user, state.profile);
}
