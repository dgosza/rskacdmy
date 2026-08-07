"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/Spinner";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      router.replace(user ? "/inicio" : "/login");
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner label="carregando..." />
    </div>
  );
}
