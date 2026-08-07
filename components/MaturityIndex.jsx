function scoreBand(score) {
  if (score >= 80) return { label: "Maturidade avançada", color: "#34d399" };
  if (score >= 55) return { label: "Maturidade em desenvolvimento", color: "#fbbf24" };
  return { label: "Maturidade inicial", color: "#fb923c" };
}

function Sparkline({ history }) {
  if (!history || history.length < 2) {
    return (
      <p className="font-mono text-[11px] text-muted">
        Histórico insuficiente — o índice acumula um ponto a cada dia em que o relatório é aberto.
      </p>
    );
  }

  const W = 220;
  const H = 48;
  const scores = history.map((h) => h.score);
  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 100);
  const range = max - min || 1;
  const stepX = W / (history.length - 1);

  const points = history.map((h, i) => {
    const x = i * stepX;
    const y = H - ((h.score - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const last = history[history.length - 1];
  const first = history[0];
  const trendUp = last.score >= first.score;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-12 w-full max-w-[220px]" preserveAspectRatio="none">
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={trendUp ? "#34d399" : "#fb923c"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sparkline-fill"
        />
      </svg>
      <p className="mt-1 font-mono text-[10px] text-muted">
        {new Date(first.date).toLocaleDateString("pt-BR")} → {new Date(last.date).toLocaleDateString("pt-BR")}
        {"  ·  "}
        <span style={{ color: trendUp ? "#34d399" : "#fb923c" }}>
          {trendUp ? "▲" : "▼"} {Math.abs(last.score - first.score)} pts
        </span>
      </p>
    </div>
  );
}

function ComponentBar({ label, value, weight }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
          {label} <span className="text-muted/60">({weight}%)</span>
        </p>
        <p className="font-mono text-[10px] font-bold text-ink">{pct}%</p>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-void">
        <div className="h-full rounded-full bg-signal-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MaturityIndex({ data }) {
  const band = scoreBand(data.score);

  return (
    <div className="rounded-lg border border-line bg-panel p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-400">
        Índice de Maturidade em Risco de IA
      </p>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-6xl font-bold tracking-tight text-ink">{data.score}</span>
          <span className="font-mono text-sm text-muted">/ 100</span>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs font-bold uppercase tracking-wide" style={{ color: band.color }}>
            {band.label}
          </p>
          <div className="mt-2">
            <Sparkline history={data.history} />
          </div>
        </div>
      </div>

      <p className="mt-5 max-w-lg text-xs leading-relaxed text-muted">
        Métrica única, recalculada a cada acesso, combinando cobertura de treinamento, validade das
        certificações, taxa de sucesso no Laboratório de Testes e desempenho em simulações de
        incidente. Pensada para reporte executivo e evidência de programa ativo de gestão de risco de IA.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ComponentBar label="Cobertura de treinamento" value={data.training_coverage} weight={30} />
        <ComponentBar label="Certificação válida" value={data.certification_valid_pct} weight={30} />
        <ComponentBar label="Desempenho no laboratório" value={data.redteam_success_pct} weight={20} />
        <ComponentBar label="Resposta a incidentes" value={data.incident_avg_pct} weight={20} />
      </div>
    </div>
  );
}
