"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import Markdown from "@/components/Markdown";
import ModuleQuiz from "@/components/ModuleQuiz";
import ExamForm from "@/components/ExamForm";
import ModuleAssistant from "@/components/ModuleAssistant";
import VideoPanel from "@/components/VideoPanel";
import ModulePdfButton from "@/components/ModulePdfButton";
import RequireAuth from "@/components/RequireAuth";
import Spinner from "@/components/Spinner";
import { createClient } from "@/lib/supabase/client";
import { getBadge } from "@/lib/badges";

function ModuleContent({ numero, user, profile }) {
  const router = useRouter();
  const [state, setState] = useState({ status: "loading", mod: null, progressRow: null, bestCert: null });

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function load() {
      const { data: mod } = await supabase
        .from("modules")
        .select("number, title, content_md, is_exam, phase_label")
        .eq("number", numero)
        .single();

      if (!mod) {
        if (active) setState({ status: "not-found", mod: null, progressRow: null, bestCert: null });
        return;
      }

      const { data: progressRow } = await supabase
        .from("user_progress")
        .select("module_number")
        .eq("user_id", user.id)
        .eq("module_number", numero)
        .maybeSingle();

      let bestCert = null;

      if (mod.is_exam) {
        const { data: studyModules } = await supabase
          .from("modules")
          .select("number")
          .eq("is_exam", false);
        const { data: progress } = await supabase
          .from("user_progress")
          .select("module_number")
          .eq("user_id", user.id);
        const completed = new Set((progress ?? []).map((p) => p.module_number));
        const examUnlocked = (studyModules ?? []).every((m) => completed.has(m.number));
        if (!examUnlocked) {
          router.replace("/trilha?locked=exam");
          return;
        }

        const { data: cert } = await supabase
          .from("certifications")
          .select("score, total, passed")
          .eq("user_id", user.id)
          .eq("passed", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        bestCert = cert ?? null;
      }

      if (active) setState({ status: "ready", mod, progressRow, bestCert });
    }

    load();
    return () => {
      active = false;
    };
  }, [numero, user.id, router]);

  if (state.status === "loading") {
    return (
      <div className="min-h-screen">
        <TopNav email={user.email} isManager={Boolean(profile?.is_manager)} />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <Spinner label="carregando dossiê..." />
        </main>
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className="min-h-screen">
        <TopNav email={user.email} isManager={Boolean(profile?.is_manager)} />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-sm text-muted">Dossiê não encontrado.</p>
          <Link href="/trilha" className="mt-2 inline-block font-mono text-xs text-signal-400 hover:underline">
            ← Voltar para a trilha
          </Link>
        </main>
      </div>
    );
  }

  const { mod, progressRow, bestCert } = state;
  const nextHref = numero < 10 ? `/trilha/${numero + 1}` : null;
  const badge = getBadge(numero);

  return (
    <div className="min-h-screen">
      <TopNav email={user.email} isManager={Boolean(profile?.is_manager)} />

      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/trilha"
          className="font-mono text-xs font-medium uppercase tracking-wide text-signal-400"
        >
          ← Voltar para a trilha
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {mod.phase_label} · Dossiê {String(mod.number).padStart(2, "0")}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
              {mod.title}
            </h1>
          </div>
          {!mod.is_exam && (
            <ModulePdfButton
              moduleNumber={mod.number}
              title={mod.title}
              phaseLabel={mod.phase_label}
              contentMd={mod.content_md}
            />
          )}
        </div>

        {!mod.is_exam && (
          <div className="mt-6">
            <VideoPanel moduleNumber={mod.number} />
          </div>
        )}

        <div className="mt-6 rounded-lg border border-line bg-panel p-6 sm:p-8">
          <Markdown content={mod.content_md} />
        </div>

        {(numero === 7 || numero === 8) && (
          <div className="mt-6 flex items-center justify-between rounded-lg border border-signal-400/30 bg-signal-400/5 px-6 py-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
                Laboratório de Testes
              </p>
              <p className="mt-1 text-xs text-muted">
                Pratique os padrões deste dossiê num sandbox educativo de
                prompt injection e jailbreak.
              </p>
            </div>
            <Link
              href="/laboratorio"
              className="shrink-0 font-mono text-xs font-bold uppercase tracking-wide text-signal-400 hover:underline"
            >
              Abrir →
            </Link>
          </div>
        )}

        <div className="mt-6">
          {mod.is_exam ? (
            <ExamForm userEmail={user.email} badge={badge} bestResult={bestCert} />
          ) : (
            <ModuleQuiz
              moduleNumber={numero}
              badge={badge}
              alreadyDone={Boolean(progressRow)}
              nextHref={nextHref}
            />
          )}
        </div>
      </main>

      {!mod.is_exam && <ModuleAssistant contentMd={mod.content_md} />}
    </div>
  );
}

export default function ModulePageClient({ numero: numeroParam }) {
  const numero = Number(numeroParam);

  if (!Number.isInteger(numero) || numero < 1 || numero > 10) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Dossiê inválido.</p>
      </div>
    );
  }

  return (
    <RequireAuth>
      {(user, profile) => <ModuleContent numero={numero} user={user} profile={profile} />}
    </RequireAuth>
  );
}
