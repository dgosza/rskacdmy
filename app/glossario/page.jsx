"use client";

import TopNav from "@/components/TopNav";
import GlossaryPanel from "@/components/GlossaryPanel";
import RequireAuth from "@/components/RequireAuth";

export default function GlossarioPage() {
  return (
    <RequireAuth>
      {(user, profile) => (
        <div className="min-h-screen">
          <TopNav email={user.email} isManager={Boolean(profile?.is_manager)} />

          <main className="mx-auto max-w-3xl px-4 py-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-400">
              Letramento em riscos de IA
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
              Glossário
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Referência rápida de siglas e conceitos usados ao longo dos 9
              dossiês da trilha.
            </p>

            <div className="mt-8">
              <GlossaryPanel />
            </div>
          </main>
        </div>
      )}
    </RequireAuth>
  );
}
