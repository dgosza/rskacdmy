"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";
import ComplianceReport from "@/components/ComplianceReport";
import MaturityIndex from "@/components/MaturityIndex";
import RequireAuth from "@/components/RequireAuth";
import Spinner from "@/components/Spinner";
import { createClient } from "@/lib/supabase/client";

function RelatorioContent({ user, profile }) {
  const isManager = Boolean(profile?.is_manager);
  const [data, setData] = useState(isManager ? null : { rows: [], maturity: null, error: null, maturityError: null });

  useEffect(() => {
    if (!isManager) return;
    let active = true;
    const supabase = createClient();

    async function load() {
      const { data: rows, error } = await supabase.rpc("get_team_compliance_report");
      const { data: maturityRows, error: maturityError } = await supabase.rpc("get_maturity_index");

      if (active) {
        setData({
          rows: rows ?? [],
          maturity: maturityRows?.[0] ?? null,
          error,
          maturityError,
        });
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isManager]);

  return (
    <div className="min-h-screen">
      <TopNav email={user.email} isManager={isManager} />

      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-400">
          Evidência de conformidade
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
          Relatório de Conformidade do Time
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Visão agregada de progresso e certificação por colaborador — pronta
          para exportação como evidência em auditorias regulatórias.
        </p>

        <div className="mt-8 space-y-6">
          {!isManager ? (
            <div className="rounded-lg border border-line bg-panel p-6 text-sm text-muted">
              <span className="font-mono text-signal-400">🔒 ACESSO RESTRITO —</span>{" "}
              este relatório é visível apenas para gestores do time de
              Riscos. Fale com seu administrador da AI Risk Academy se
              precisar de acesso.
            </div>
          ) : !data ? (
            <Spinner label="carregando relatório..." />
          ) : (
            <>
              {data.maturityError ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400">
                  ERRO: {data.maturityError.message}
                </div>
              ) : (
                data.maturity && <MaturityIndex data={data.maturity} />
              )}

              {data.error ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400">
                  ERRO: {data.error.message}
                </div>
              ) : (
                <ComplianceReport rows={data.rows} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RelatorioPage() {
  return (
    <RequireAuth>
      {(user, profile) => <RelatorioContent user={user} profile={profile} />}
    </RequireAuth>
  );
}
