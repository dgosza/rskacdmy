"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import Badge from "./Badge";
import Spinner from "./Spinner";

export default function ModuleQuiz({ moduleNumber, badge, alreadyDone, nextHref }) {
  const [status, setStatus] = useState(alreadyDone ? "done" : "idle"); // idle | loading | ready | submitting | done | error
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function startQuiz() {
    setStatus("loading");
    setAnswers({});
    setResult(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_module_quiz", {
      p_module_number: moduleNumber,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    const byQuestion = new Map();
    for (const row of data) {
      if (!byQuestion.has(row.number)) {
        byQuestion.set(row.number, {
          number: row.number,
          text: row.question_text,
          options: [],
        });
      }
      byQuestion.get(row.number).options.push({
        label: row.label,
        text: row.option_text,
      });
    }
    const list = Array.from(byQuestion.values()).sort((a, b) => a.number - b.number);
    setQuestions(list);
    setStatus("ready");
  }

  function selectAnswer(number, label) {
    setAnswers((prev) => ({ ...prev, [number]: label }));
  }

  const answeredCount = Object.keys(answers).length;

  async function handleSubmit() {
    setStatus("submitting");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("submit_module_quiz", {
      p_module_number: moduleNumber,
      p_answers: answers,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    const r = data?.[0] ?? null;
    setResult(r);
    setStatus("done");
    if (r) {
      toast(
        r.passed
          ? badge
            ? `Aprovado! ${r.score}/${r.total} — badge conquistada: ${badge.short}`
            : `Aprovado! ${r.score}/${r.total} — módulo concluído`
          : `Não atingiu a nota mínima: ${r.score}/${r.total}`,
        r.passed ? "success" : "warn"
      );
    }
  }

  if (status === "idle") {
    return (
      <div className="rounded-lg border border-signal-400/30 bg-signal-400/5 p-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
          Quiz do dossiê
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          10 questões de múltipla escolha. Nota mínima de 80% (8 acertos) para
          concluir este módulo.
        </p>
        <button
          onClick={startQuiz}
          className="mt-4 rounded bg-signal-400 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-void transition hover:bg-signal-500"
        >
          Iniciar quiz →
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return <Spinner label="carregando questões..." />;
  }

  if (status === "error") {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400">
        ERRO: {errorMsg}
      </p>
    );
  }

  if (status === "done") {
    if (!result) {
      return (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
          {badge && <Badge badge={badge} earned size="sm" />}
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-emerald-400">
              ✓ Dossiê arquivado
            </p>
            <p className="text-xs text-muted">
              Módulo concluído — credencial registrada no seu perfil.
            </p>
          </div>
          {nextHref && (
            <a
              href={nextHref}
              className="ml-auto font-mono text-xs font-bold uppercase tracking-wide text-signal-400 hover:underline"
            >
              Próximo dossiê →
            </a>
          )}
        </div>
      );
    }

    return (
      <div
        className={`rounded-lg border p-6 ${
          result.passed
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-signal-400/30 bg-signal-400/10"
        }`}
      >
        <div className="flex flex-wrap items-center gap-5">
          {result.passed && badge && <Badge badge={badge} earned size="lg" />}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Resultado
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">
              {result.score} / {result.total}
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              {result.passed
                ? "Nota mínima atingida. Módulo concluído e badge liberada."
                : "Nota mínima para concluir: 80% (8 de 10). Revise o conteúdo do dossiê e tente novamente."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          {result.passed ? (
            nextHref && (
              <a
                href={nextHref}
                className="font-mono text-xs font-bold uppercase tracking-wide text-signal-400 hover:underline"
              >
                Próximo dossiê →
              </a>
            )
          ) : (
            <button
              onClick={startQuiz}
              className="rounded bg-signal-400 px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-void transition hover:bg-signal-500"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-16 z-10 flex items-center justify-between rounded-lg border border-line bg-panel/95 px-4 py-3 backdrop-blur">
        <p className="font-mono text-xs text-muted">
          {String(answeredCount).padStart(2, "0")} / {questions.length} respondidas
        </p>
        <button
          onClick={handleSubmit}
          disabled={status === "submitting" || answeredCount < questions.length}
          className="rounded bg-signal-400 px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-void transition hover:bg-signal-500 disabled:opacity-30"
        >
          {status === "submitting" ? "Enviando..." : "Enviar quiz"}
        </button>
      </div>

      {questions.map((q) => (
        <div key={q.number} className="rounded-lg border border-line bg-panel p-5">
          <p className="mb-3 text-sm font-medium leading-relaxed text-ink">
            <span className="font-mono text-signal-400">
              {String(q.number).padStart(2, "0")}.
            </span>{" "}
            {q.text}
          </p>
          <div className="space-y-2">
            {q.options.map((o) => (
              <label
                key={o.label}
                className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-2.5 text-sm transition ${
                  answers[q.number] === o.label
                    ? "border-signal-400/60 bg-signal-400/10"
                    : "border-line hover:border-line/80 hover:bg-panel-2"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${q.number}`}
                  className="mt-0.5 accent-amber-400"
                  checked={answers[q.number] === o.label}
                  onChange={() => selectAnswer(q.number, o.label)}
                />
                <span className="text-muted">
                  <strong className="font-mono text-ink">{o.label})</strong> {o.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
