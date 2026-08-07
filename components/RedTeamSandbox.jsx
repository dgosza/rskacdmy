"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { SCENARIOS, checkFlagAnswer } from "@/lib/redteamScenarios";

function DetectScenario({ scenario, onSolved, solved }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  async function handleCheck(i) {
    setSelected(i);
    const success = i === scenario.correctLineIndex;
    setFeedback(success ? "ok" : "wrong");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("redteam_sim_log").insert({
          user_id: user.id,
          scenario_key: scenario.key,
          technique: scenario.domain,
          success,
        });
      }
    } catch {
      // best-effort logging only
    }

    if (success) {
      onSolved(scenario.key);
      toast(`Cenário resolvido: ${scenario.title}`, "success");
    }
  }

  return (
    <div>
      <div className="space-y-1 rounded border border-line bg-void/30 p-4 font-mono text-xs text-muted">
        {scenario.documentLines.map((line, i) => (
          <button
            key={i}
            onClick={() => !solved && handleCheck(i)}
            disabled={solved}
            className={`block w-full rounded px-2 py-1.5 text-left transition ${
              selected === i
                ? i === scenario.correctLineIndex
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
                : "hover:bg-panel-2"
            }`}
          >
            <span className="mr-2 text-signal-400">{i + 1}.</span>
            {line}
          </button>
        ))}
      </div>

      {feedback === "wrong" && !solved && (
        <p className="mt-3 font-mono text-xs text-red-400">
          Não é essa linha — reveja o texto com atenção a instruções disfarçadas de "nota do sistema".
        </p>
      )}
      {(solved || feedback === "ok") && (
        <div className="mt-3 rounded border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-mono text-xs text-emerald-400">
          ✓ Correto. {scenario.explanation}
        </div>
      )}
    </div>
  );
}

function FlagScenario({ scenario, onSolved, solved }) {
  const [selected, setSelected] = useState(new Set());
  const [result, setResult] = useState(null);

  function toggle(i) {
    if (result) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function handleVerify() {
    const outcome = checkFlagAnswer(scenario, Array.from(selected));
    setResult(outcome);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("redteam_sim_log").insert({
          user_id: user.id,
          scenario_key: scenario.key,
          technique: scenario.domain,
          success: outcome.allCorrect,
        });
      }
    } catch {
      // best-effort logging only
    }

    if (outcome.allCorrect) {
      onSolved(scenario.key);
      toast(`Cenário resolvido: ${scenario.title}`, "success");
    }
  }

  function tryAgain() {
    setResult(null);
    setSelected(new Set());
  }

  return (
    <div>
      <div className="space-y-2">
        {scenario.statements.map((s, i) => {
          const isSelected = selected.has(i);
          const item = result?.perItem?.[i];
          const style = result
            ? item.correct
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
            : isSelected
            ? "border-signal-400/60 bg-signal-400/10 text-ink"
            : "border-line text-muted hover:border-line/80 hover:bg-panel-2";
          return (
            <label
              key={i}
              className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-2.5 text-sm transition ${style} ${
                result ? "cursor-default" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={Boolean(result)}
                onChange={() => toggle(i)}
                className="mt-0.5 accent-amber-400"
              />
              <span>
                {s.text}
                {result && (
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-wide">
                    {item.correct
                      ? item.isTarget
                        ? "✓ correto — sinalizado"
                        : "✓ correto — não sinalizado"
                      : item.isTarget
                      ? "✗ deveria ter sido sinalizado"
                      : "✗ não deveria ser sinalizado"}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {!result ? (
        <button
          onClick={handleVerify}
          className="mt-4 rounded bg-signal-400 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-void transition hover:bg-signal-500"
        >
          Verificar
        </button>
      ) : result.allCorrect || solved ? (
        <div className="mt-4 rounded border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-mono text-xs text-emerald-400">
          ✓ Correto. {scenario.explanation}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-400">
            Nem todas as marcações estão corretas — reveja os itens destacados acima.
          </p>
          <button
            onClick={tryAgain}
            className="rounded border border-line px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:border-signal-400/50"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}

export default function RedTeamSandbox() {
  const [activeKey, setActiveKey] = useState(SCENARIOS[0].key);
  const [solvedSet, setSolvedSet] = useState(new Set());

  const scenario = SCENARIOS.find((s) => s.key === activeKey);

  function markSolved(key) {
    setSolvedSet((prev) => new Set(prev).add(key));
  }

  return (
    <div>
      <div className="mb-6 rounded border border-signal-400/30 bg-signal-400/5 px-4 py-3 text-xs leading-relaxed text-muted">
        Simulador educativo baseado em reconhecimento de padrões — não é uma
        IA real. O objetivo é treinar o olho para as técnicas mais comuns de
        prompt injection e jailbreak antes de aplicá-las (com autorização)
        em testes reais.
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveKey(s.key)}
            className={`rounded border px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wide transition ${
              activeKey === s.key
                ? "border-signal-400/60 bg-signal-400/10 text-signal-400"
                : "border-line text-muted hover:border-line/80"
            }`}
          >
            {solvedSet.has(s.key) ? "✓ " : ""}
            {s.title}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-line bg-panel p-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-signal-400">
          {scenario.domain}
        </p>
        <h2 className="mt-1 font-display text-lg font-bold text-ink">{scenario.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{scenario.briefing}</p>

        <div className="mt-5">
          {scenario.type === "flag" ? (
            <FlagScenario
              scenario={scenario}
              onSolved={markSolved}
              solved={solvedSet.has(scenario.key)}
            />
          ) : (
            <DetectScenario
              scenario={scenario}
              onSolved={markSolved}
              solved={solvedSet.has(scenario.key)}
            />
          )}
        </div>
      </div>

      <p className="mt-4 font-mono text-xs text-muted">
        {solvedSet.size}/{SCENARIOS.length} cenários resolvidos nesta sessão
      </p>
    </div>
  );
}
