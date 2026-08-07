"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import CertificateButton from "@/components/CertificateButton";
import Badge from "@/components/Badge";
import RequireAuth from "@/components/RequireAuth";
import Spinner from "@/components/Spinner";
import { createClient } from "@/lib/supabase/client";
import { BADGES } from "@/lib/badges";

function DashboardContent({ user, profile }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function load() {
      const { data: modules } = await supabase
        .from("modules")
        .select("number, title, is_exam, phase, phase_label")
        .order("number");

      const { data: progress } = await supabase
        .from("user_progress")
        .select("module_number, completed_at")
        .eq("user_id", user.id);

      const { data: certifications } = await supabase
        .from("certifications")
        .select("id, score, total, passed, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (active) {
        setData({
          modules: modules ?? [],
          progress: progress ?? [],
          certifications: certifications ?? [],
        });
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [user.id]);

  if (!data) {
    return (
      <div className="min-h-screen">
        <TopNav email={user.email} isManager={Boolean(profile?.is_manager)} />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <Spinner label="carregando credencial..." />
        </main>
      </div>
    );
  }

  const { modules, progress, certifications } = data;
  const studyModules = modules.filter((m) => !m.is_exam);
  const completedSet = new Set(progress.map((p) => p.module_number));
  const completedCount = studyModules.filter((m) =>
    completedSet.has(m.number)
  ).length;
  const pct = studyModules.length
    ? Math.round((completedCount / studyModules.length) * 100)
    : 0;

  const bestPass = certifications.find((c) => c.passed);
  const bestPassValidUntil = bestPass
    ? new Date(new Date(bestPass.created_at).setFullYear(new Date(bestPass.created_at).getFullYear() + 1))
    : null;
  const isExpired = bestPassValidUntil ? bestPassValidUntil.getTime() < Date.now() : false;

  const earnedBadgeCount =
    BADGES.filter((b) => b.number < 10 && completedSet.has(b.number)).length +
    (bestPass ? 1 : 0);

  const phaseGroups = [1, 2, 3].map((n) => {
    const items = studyModules.filter((m) => m.phase === n);
    const done = items.filter((m) => completedSet.has(m.number)).length;
    return {
      phase: n,
      label: items[0]?.phase_label ?? `Fase ${n}`,
      done,
      total: items.length,
    };
  });

  return (
    <div className="min-h-screen">
      <TopNav email={user.email} isManager={Boolean(profile?.is_manager)} />

      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-400">
          Ficha de credencial
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
          {user.email}
        </h1>

        <div className="mt-6 rounded-lg border border-line bg-panel p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Progresso geral
            </p>
            <p className="font-mono text-sm font-bold text-signal-400">
              {String(completedCount).padStart(2, "0")}/
              {String(studyModules.length).padStart(2, "0")} · {pct}%
            </p>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-void">
            <div
              className="h-full rounded-full bg-signal-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {phaseGroups.map((g) => (
              <div
                key={g.phase}
                className="rounded border border-line/70 bg-void/40 px-4 py-3"
              >
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
                  {g.label}
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-ink">
                  {g.done}/{g.total}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-line bg-panel p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
              Badges conquistadas
            </p>
            <p className="font-mono text-xs text-muted">
              {String(earnedBadgeCount).padStart(2, "0")}/{String(BADGES.length).padStart(2, "0")}
            </p>
          </div>
          <p className="mt-1 text-sm text-muted">
            Cada dossiê concluído libera uma badge temática. A badge final é
            liberada com a aprovação na avaliação de certificação.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-y-6 sm:grid-cols-5">
            {BADGES.map((b) => {
              const earned =
                b.number === 10 ? Boolean(bestPass) : completedSet.has(b.number);
              return <Badge key={b.number} badge={b} earned={earned} size="md" />;
            })}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-line bg-panel p-6">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
            Status de certificação
          </p>

          {certifications.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Nenhuma tentativa registrada. A avaliação final (dossiê 10) é
              liberada após a conclusão dos 9 módulos anteriores.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {certifications.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between rounded border px-4 py-2.5 font-mono text-xs ${
                    c.passed
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-line bg-void/40"
                  }`}
                >
                  <span className="text-muted">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")} —{" "}
                    {c.score}/{c.total}
                  </span>
                  <span
                    className={
                      c.passed
                        ? "font-bold uppercase tracking-wide text-emerald-400"
                        : "uppercase tracking-wide text-muted"
                    }
                  >
                    {c.passed ? "Aprovado" : "Não aprovado"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {bestPass && (
            <div
              className={`mt-4 rounded border px-4 py-3 font-mono text-xs ${
                isExpired
                  ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {isExpired ? (
                <>
                  ⚠ CREDENCIAL EXPIRADA em{" "}
                  {bestPassValidUntil.toLocaleDateString("pt-BR")} — a AI Risk
                  Academy exige recertificação anual. Refaça a avaliação no{" "}
                  <Link href="/trilha/10" className="underline">
                    dossiê 10
                  </Link>
                  .
                </>
              ) : (
                <>✓ CREDENCIAL VÁLIDA até {bestPassValidUntil.toLocaleDateString("pt-BR")}</>
              )}
            </div>
          )}

          {bestPass && (
            <div className="mt-5">
              <CertificateButton
                userEmail={user.email}
                score={bestPass.score}
                total={bestPass.total}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      {(user, profile) => <DashboardContent user={user} profile={profile} />}
    </RequireAuth>
  );
}
