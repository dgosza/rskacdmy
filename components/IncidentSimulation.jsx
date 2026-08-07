"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { INCIDENT_SCENARIOS, maxScore, readinessRating } from "@/lib/incidentScenario";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function IncidentSimulation() {
  const [activeKey, setActiveKey] = useState(INCIDENT_SCENARIOS[0].key);
  const [phase, setPhase] = useState("idle"); // idle | running | feedback | finished
  const [stageIndex, setStageIndex] = useState(0);
  const [decisions, setDecisions] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(INCIDENT_SCENARIOS[0].timeLimitSeconds);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const startedAtRef = useRef(null);
  const intervalRef = useRef(null);

  const scenario = INCIDENT_SCENARIOS.find((s) => s.key === activeKey);
  const MAX_SCORE = maxScore(scenario);

  useEffect(() => {
    if (phase !== "running") return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          finishSimulation(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function startSimulation() {
    setStageIndex(0);
    setDecisions([]);
    setSecondsLeft(scenario.timeLimitSeconds);
    setTimedOut(false);
    setLastFeedback(null);
    startedAtRef.current = Date.now();
    setPhase("running");
  }

  function handleChoice(choice) {
    const stage = scenario.stages[stageIndex];
    const decision = {
      stageId: stage.id,
      stageLabel: stage.label,
      choiceText: choice.text,
      quality: choice.quality,
      points: choice.points,
    };
    setDecisions((prev) => [...prev, decision]);
    setLastFeedback({ ...choice, stageLabel: stage.label });
    setPhase("feedback");
  }

  function nextStage() {
    if (stageIndex + 1 < scenario.stages.length) {
      setStageIndex((i) => i + 1);
      setPhase("running");
    } else {
      finishSimulation(false);
    }
  }

  async function finishSimulation(didTimeOut) {
    clearInterval(intervalRef.current);
    setTimedOut(didTimeOut);
    setPhase("finished");

    const score = decisions.reduce((sum, d) => sum + d.points, 0);
    const timeTaken = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current) / 1000)
      : null;

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("incident_sim_runs").insert({
          user_id: user.id,
          scenario_key: scenario.key,
          score,
          max_score: MAX_SCORE,
          time_taken_seconds: timeTaken,
          timed_out: didTimeOut,
          decisions,
        });
      }
    } catch {
      // best-effort logging only
    }

    toast(
      didTimeOut
        ? "Tempo esgotado — simulação encerrada"
        : `Simulação concluída: ${score}/${MAX_SCORE} pontos`,
      didTimeOut ? "warn" : "success"
    );
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  async function downloadReport() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const score = decisions.reduce((sum, d) => sum + d.points, 0);
    const pct = Math.round((score / MAX_SCORE) * 100);
    const rating = readinessRating(pct);

    doc.setFillColor(5, 7, 10);
    doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");

    doc.setFont("courier", "bold");
    doc.setFontSize(13);
    doc.setTextColor(251, 191, 36);
    doc.text("AI RISK ACADEMY // RELATÓRIO PÓS-INCIDENTE", 40, 50);

    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(125, 135, 152);
    doc.text(scenario.title, 40, 68);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 40, 82);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(230, 233, 239);
    doc.text(`Pontuação: ${score}/${MAX_SCORE} (${pct}%)`, 40, 112);
    doc.setTextColor(...hexToRgb(rating.color));
    doc.text(`Prontidão: ${rating.label}`, 40, 128);
    let y = 152;
    if (timedOut) {
      doc.setTextColor(248, 113, 113);
      doc.text("Simulação encerrada por tempo esgotado", 40, 144);
      y = 168;
    }

    doc.setDrawColor(31, 41, 55);
    doc.line(40, y, W - 40, y);
    y += 24;

    decisions.forEach((d, i) => {
      if (y > 760) {
        doc.addPage();
        doc.setFillColor(5, 7, 10);
        doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");
        y = 50;
      }
      doc.setFont("courier", "bold");
      doc.setFontSize(9);
      doc.setTextColor(251, 191, 36);
      doc.text(`ESTÁGIO ${i + 1} — ${d.stageLabel.toUpperCase()} (${d.points} pts)`, 40, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(200, 205, 214);
      const lines = doc.splitTextToSize(d.choiceText, W - 80);
      doc.text(lines, 40, y);
      y += lines.length * 12 + 18;
    });

    doc.save(`relatorio-incidente-${scenario.key}-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast("Relatório de incidente baixado em PDF", "success");
  }

  function selectScenario(key) {
    setActiveKey(key);
    const next = INCIDENT_SCENARIOS.find((s) => s.key === key);
    setSecondsLeft(next.timeLimitSeconds);
  }

  if (phase === "idle") {
    return (
      <div className="rounded-lg border border-signal-400/30 bg-signal-400/5 p-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
          Simulação de incidente ao vivo
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {INCIDENT_SCENARIOS.map((s) => (
            <button
              key={s.key}
              onClick={() => selectScenario(s.key)}
              className={`rounded border px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wide transition ${
                activeKey === s.key
                  ? "border-signal-400/60 bg-signal-400/10 text-signal-400"
                  : "border-line text-muted hover:border-line/80"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <h3 className="mt-4 font-display text-lg font-bold text-ink">{scenario.title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{scenario.summary}</p>
        <p className="mt-3 font-mono text-xs text-muted">
          {scenario.stages.length} estágios · limite de{" "}
          {Math.round(scenario.timeLimitSeconds / 60)} minutos · ideal para rodar em grupo, ao vivo
        </p>
        <button
          onClick={startSimulation}
          className="mt-4 rounded bg-signal-400 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-void transition hover:bg-signal-500"
        >
          Iniciar simulação →
        </button>
      </div>
    );
  }

  if (phase === "finished") {
    const score = decisions.reduce((sum, d) => sum + d.points, 0);
    const pct = Math.round((score / MAX_SCORE) * 100);
    const rating = readinessRating(pct);

    return (
      <div className="rounded-lg border border-line bg-panel p-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
          Relatório pós-incidente
        </p>
        {timedOut && (
          <p className="mt-2 font-mono text-xs font-bold text-orange-400">
            ⚠ Tempo esgotado antes da conclusão de todos os estágios
          </p>
        )}
        <div className="mt-3 flex items-baseline gap-3">
          <span className="font-display text-4xl font-bold text-ink">{score}</span>
          <span className="font-mono text-sm text-muted">/ {MAX_SCORE} pontos</span>
          <span className="ml-2 font-mono text-xs font-bold uppercase" style={{ color: rating.color }}>
            {rating.label}
          </span>
        </div>

        <div className="mt-5 space-y-2">
          {decisions.map((d, i) => (
            <div
              key={i}
              className={`rounded border px-4 py-2.5 text-xs ${
                d.quality === "best"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : d.quality === "partial"
                  ? "border-signal-400/30 bg-signal-400/10"
                  : "border-red-500/30 bg-red-500/10"
              }`}
            >
              <p className="font-mono font-bold uppercase tracking-wide text-ink">
                {d.stageLabel} — {d.points} pts
              </p>
              <p className="mt-1 text-muted">{d.choiceText}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={downloadReport}
            className="rounded border border-signal-400/50 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-signal-400 transition hover:bg-signal-400/10"
          >
            Baixar relatório (PDF)
          </button>
          <button
            onClick={() => setPhase("idle")}
            className="rounded border border-line px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:border-signal-400/50"
          >
            Escolher outro cenário
          </button>
        </div>
      </div>
    );
  }

  const stage = scenario.stages[stageIndex];
  const low = secondsLeft <= 120;

  return (
    <div className="rounded-lg border border-line bg-panel p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
          Estágio {stageIndex + 1}/{scenario.stages.length} — {stage.label}
        </p>
        <p className={`font-mono text-sm font-bold ${low ? "text-red-400" : "text-ink"}`}>
          ⏱ {formatTime(secondsLeft)}
        </p>
      </div>

      <p className="mt-3 font-mono text-[11px] text-muted">{stage.timestamp}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink">{stage.narrative}</p>

      {phase === "running" && (
        <div className="mt-5 space-y-2">
          {stage.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => handleChoice(choice)}
              className="block w-full rounded border border-line px-4 py-3 text-left text-sm text-muted transition hover:border-signal-400/50 hover:bg-panel-2"
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}

      {phase === "feedback" && lastFeedback && (
        <div className="mt-5">
          <div
            className={`rounded border px-4 py-3 text-sm ${
              lastFeedback.quality === "best"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : lastFeedback.quality === "partial"
                ? "border-signal-400/30 bg-signal-400/10 text-signal-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {lastFeedback.feedback}
          </div>
          <button
            onClick={nextStage}
            className="mt-4 rounded bg-signal-400 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-void transition hover:bg-signal-500"
          >
            {stageIndex + 1 < scenario.stages.length ? "Próximo estágio →" : "Ver relatório final →"}
          </button>
        </div>
      )}
    </div>
  );
}
