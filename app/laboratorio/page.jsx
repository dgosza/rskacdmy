"use client";

import TopNav from "@/components/TopNav";
import LaboratorioTabs from "@/components/LaboratorioTabs";
import RequireAuth from "@/components/RequireAuth";

export default function LaboratorioPage() {
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
              Laboratório de Testes
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Espaço de prática guiada para reconhecer padrões de risco e técnicas
              de prompt injection e jailbreak descritas nos dossiês 07 e 08, sem
              tocar sistemas reais — o time de Red Teaming do banco segue
              responsável pelos testes ofensivos formais.
            </p>

            <div className="mt-8">
              <LaboratorioTabs />
            </div>
          </main>
        </div>
      )}
    </RequireAuth>
  );
}
