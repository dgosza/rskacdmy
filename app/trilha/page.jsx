"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import DownloadAllModulesButton from "@/components/DownloadAllModulesButton";
import RequireAuth from "@/components/RequireAuth";
import Spinner from "@/components/Spinner";
import { createClient } from "@/lib/supabase/client";
import { PHASE_DESCRIPTIONS } from "@/lib/phases";

function clearanceLevel({ phase1Done, phase2Done, phase3Done, examPassed, anyDone }) {
  if (examPassed) return { n: "05", label: "Certificado" };
  if (phase3Done) return { n: "04", label: "Apto à certificação" };
  if (phase2Done) return { n: "03", label: "Pronto para integração" };
  if (phase1Done) return { n: "02", label: "Operacional — Fase 02" };
  if (anyDone) return { n: "01", label: "Em formação — Fase 01" };
  return { n: "00", label: "Sem credencial" };
}

function TrilhaContent({ user, profile }) {
  const [locked, setLocked] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocked(new URLSearchParams(window.location.search).get("locked") === "exam");
    }
  }, []);

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
        .select("module_number")
        .eq("user_id", user.id);

      const { data: certifications } = await supabase
        .from("certifications")
        .select("score, total, passed, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

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
          <Spinner label="carregando trilha..." />
        </main>
      </div>
    );
  }

  const { modules, progress, certifications } = data;
  const completed = new Set(progress.map((p) => p.module_number));
  const bestCert = certifications[0];

  const studyModules = modules.filter((m) => !m.is_exam);
  const completedStudyCount = studyModules.filter((m) =>
    completed.has(m.number)
  ).length;
  const examUnlocked = completedStudyCount === studyModules.length;

  const phase1 = studyModules.filter((m) => m.phase === 1);
  const phase2 = studyModules.filter((m) => m.phase === 2);
  const phase3 = studyModules.filter((m) => m.phase === 3);
  const phase1Done = phase1.length > 0 && phase1.every((m) => completed.has(m.number));
  const phase2Done = phase2.length > 0 && phase2.every((m) => completed.has(m.number));
  const phase3Done = phase3.length > 0 && phase3.every((m) => completed.has(m.number));

  const certValidUntil = bestCert
    ? new Date(new Date(bestCert.created_at).setFullYear(new Date(bestCert.created_at).getFullYear() + 1))
    : null;
  const certExpired = certValidUntil ? certValidUntil.getTime() < Date.now() : false;

  const clearance = clearanceLevel({
    phase1Done,
    phase2Done,
    phase3Done,
    examPassed: Boolean(bestCert?.passed) && !certExpired,
    anyDone: completedStudyCount > 0,
  });

  const phases = [1, 2, 3, 4].map((n) => ({
    phase: n,
    label: modules.find((m) => m.phase === n)?.phase_label ?? `Fase ${n}`,
    items: modules.filter((m) => m.phase === n),
  }));

  return (
    <div className="min-h-screen">
      <TopNav email={user.email} isManager={Boolean(profile?.is_manager)} />

      <main className="mx-auto max-w-3xl px-4 py-10">
        {locked && (
          <div className="mb-6 rounded-lg border border-signal-400/30 bg-signal-400/5 p-4 text-sm text-muted">
            <span className="font-mono text-signal-400">🔒 ACESSO BLOQUEADO —</span>{" "}
            a avaliação final é liberada somente após a conclusão dos 9
            dossiês anteriores.
          </div>
        )}

        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-400">
              Trilha operacional
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
              10 dossiês // do fundamento normativo à certificação
            </h1>
          </div>

          <div className="shrink-0 rounded-lg border border-line bg-panel px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Nível de credencial
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-signal-400">
              {clearance.n}{" "}
              <span className="text-sm font-normal text-ink">
                {clearance.label}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-8 flex justify-end">
          <DownloadAllModulesButton />
        </div>

        <div className="space-y-10">
          {phases.map((ph) => (
            <section key={ph.phase}>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
                  {ph.label}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <p className="mb-4 text-sm leading-relaxed text-muted">
                {PHASE_DESCRIPTIONS[ph.phase]}
              </p>

              <ol className="space-y-3">
                {ph.items.map((m) => {
                  const isDone = completed.has(m.number);
                  const isLocked = m.is_exam && !examUnlocked;

                  const content = (
                    <>
                      <div className="flex items-center gap-4">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded border font-mono text-xs font-bold ${
                            isLocked
                              ? "border-line text-muted/60"
                              : isDone
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : m.is_exam
                              ? "border-signal-400/40 bg-signal-400/10 text-signal-400"
                              : "border-line text-muted"
                          }`}
                        >
                          {isLocked ? "—" : isDone ? "✓" : String(m.number).padStart(2, "0")}
                        </span>
                        <div>
                          <p
                            className={`font-display text-sm font-semibold ${
                              isLocked ? "text-muted" : "text-ink"
                            }`}
                          >
                            {m.title}
                          </p>
                          {m.is_exam && (
                            <p
                              className={`font-mono text-[10px] uppercase tracking-wide ${
                                isLocked ? "text-muted" : "text-signal-400"
                              }`}
                            >
                              {isLocked
                                ? `Bloqueado · ${completedStudyCount}/${studyModules.length} dossiês arquivados`
                                : "Avaliação final · 60 questões"}
                            </p>
                          )}
                        </div>
                      </div>
                      {!isLocked && (
                        <span className="font-mono text-xs font-medium text-signal-400">
                          {m.is_exam ? "INICIAR →" : isDone ? "REVISAR →" : "ABRIR →"}
                        </span>
                      )}
                    </>
                  );

                  if (isLocked) {
                    return (
                      <li key={m.number}>
                        <div className="flex cursor-not-allowed items-center justify-between rounded-lg border border-line bg-panel/40 px-5 py-4 opacity-60">
                          {content}
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={m.number}>
                      <Link
                        href={`/trilha/${m.number}`}
                        className="flex items-center justify-between rounded-lg border border-line bg-panel px-5 py-4 transition hover:border-signal-400/50 hover:bg-panel-2"
                      >
                        {content}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>

        {bestCert && (
          <div
            className={`mt-10 rounded-lg border p-5 ${
              bestCert.passed
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-signal-400/30 bg-signal-400/10"
            }`}
          >
            <p className="font-mono text-xs uppercase tracking-wide text-muted">
              Última tentativa de certificação
            </p>
            <p className="mt-1 font-display font-semibold text-ink">
              {bestCert.score}/{bestCert.total} —{" "}
              {bestCert.passed ? "Aprovado" : "Não aprovado"}
            </p>
            {bestCert.passed && certExpired && (
              <p className="mt-1 font-mono text-xs font-bold text-orange-400">
                ⚠ Credencial expirada em {certValidUntil.toLocaleDateString("pt-BR")} — recertificação necessária
              </p>
            )}
            {bestCert.passed && (
              <Link
                href="/dashboard"
                className="mt-2 inline-block font-mono text-xs font-bold text-signal-400 hover:underline"
              >
                Ver credencial →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrilhaPage() {
  return (
    <RequireAuth>{(user, profile) => <TrilhaContent user={user} profile={profile} />}</RequireAuth>
  );
}
