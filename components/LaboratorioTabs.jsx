"use client";

import { useState } from "react";
import IncidentSimulation from "@/components/IncidentSimulation";
import RedTeamSandbox from "@/components/RedTeamSandbox";
import PiTaxonomyCards from "@/components/PiTaxonomyCards";

const TABS = [
  { key: "incident", label: "Simulação de incidente" },
  { key: "patterns", label: "Cenários de reconhecimento de padrões" },
  { key: "taxonomy", label: "Vulnerabilidades e Riscos em IA" },
];

export default function LaboratorioTabs() {
  const [active, setActive] = useState(TABS[0].key);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`-mb-px border-b-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest transition ${
              active === tab.key
                ? "border-signal-400 text-signal-400"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "incident" && <IncidentSimulation />}
      {active === "patterns" && <RedTeamSandbox />}
      {active === "taxonomy" && <PiTaxonomyCards />}
    </div>
  );
}
