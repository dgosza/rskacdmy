const common = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// 1 — NIST AI RMF: shield split into four quadrants (Governar/Mapear/Medir/Gerenciar)
function NistIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M24 4 L40 10 V22 C40 32 33 40 24 44 C15 40 8 32 8 22 V10 Z" />
      <path d="M24 4 V44" />
      <path d="M8 21 H40" />
    </svg>
  );
}

// 2 — ISO/IEC 42001: certification seal with checkmark and ribbon
function IsoIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="24" cy="19" r="13" />
      <path d="M18 19 L22.5 23.5 L31 13.5" />
      <path d="M17.5 30 L13 44 L20.5 39" />
      <path d="M30.5 30 L35 44 L27.5 39" />
    </svg>
  );
}

// 3 — LGPD: privacy padlock
function LgpdIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="11" y="21" width="26" height="19" rx="2.5" />
      <path d="M16.5 21 V14.5 a7.5 7.5 0 0 1 15 0 V21" />
      <circle cx="24" cy="29" r="2.4" fill="currentColor" stroke="none" />
      <path d="M24 31.5 V35.5" />
    </svg>
  );
}

// 4 — BACEN: institutional building / pillars
function BacenIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M6 17 L24 6 L42 17" />
      <path d="M7 17 H41" />
      <path d="M10.5 20 V37" />
      <path d="M19 20 V37" />
      <path d="M29 20 V37" />
      <path d="M37.5 20 V37" />
      <path d="M5 41 H43" />
    </svg>
  );
}

// 5 — OWASP AI Data Security: database cylinder with lock
function DataIcon(props) {
  return (
    <svg {...common} {...props}>
      <ellipse cx="19" cy="11" rx="11" ry="4.5" />
      <path d="M8 11 V28 C8 30.5 13 32.5 19 32.5 C20 32.5 21 32.45 22 32.35" />
      <path d="M8 19.5 C8 22 13 24 19 24 C20 24 21 24 22 23.9" />
      <rect x="26" y="25" width="15" height="13" rx="2.5" />
      <path d="M30 25 V22 a3.5 3.5 0 0 1 7 0 v3" />
    </svg>
  );
}

// 6 — OWASP Agentic AI Security: bounded agent node
function AgenticIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="13" y="15" width="22" height="17" rx="3.5" />
      <circle cx="19.5" cy="23" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="28.5" cy="23" r="1.8" fill="currentColor" stroke="none" />
      <path d="M24 15 V9" />
      <circle cx="24" cy="6.5" r="2.2" />
      <path d="M13 21 H6.5" />
      <path d="M35 21 H41.5" />
      <path d="M18 32 L15 41" />
      <path d="M30 32 L33 41" />
    </svg>
  );
}

// 7 — OWASP AI Red Teaming: crosshair / breach reticle
function RedTeamIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="24" cy="24" r="17" />
      <circle cx="24" cy="24" r="8.5" />
      <path d="M24 2 V11" />
      <path d="M24 37 V46" />
      <path d="M2 24 H11" />
      <path d="M37 24 H46" />
    </svg>
  );
}

// 8 — OWASP AI Threat Intelligence & Incident Response: radar sweep with detected signal
function ThreatIntelIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="22" cy="24" r="18" />
      <circle cx="22" cy="24" r="11" />
      <circle cx="22" cy="24" r="4" />
      <path d="M22 24 L36 11" />
      <circle cx="33" cy="14" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

// 9 — Cenários Integrados Brasil: converging framework network
function IntegradoIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="24" cy="24" r="4.5" />
      <circle cx="10" cy="9" r="3" />
      <circle cx="38" cy="9" r="3" />
      <circle cx="10" cy="39" r="3" />
      <circle cx="38" cy="39" r="3" />
      <path d="M21 21 L12.2 11.2" />
      <path d="M27 21 L35.8 11.2" />
      <path d="M21 27 L12.2 36.8" />
      <path d="M27 27 L35.8 36.8" />
    </svg>
  );
}

// 10 — Certificação Final: medal with laurel ribbon
function CertIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M15 4 L24 17 L33 4" />
      <path d="M15 4 L10.5 13 L19.5 17" />
      <path d="M33 4 L37.5 13 L28.5 17" />
      <circle cx="24" cy="30" r="13" />
      <path
        d="M24 22.5 L26.8 28 L33 28.7 L28.5 33 L29.6 39.2 L24 36.2 L18.4 39.2 L19.5 33 L15 28.7 L21.2 28 Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export const BADGE_ICONS = {
  nist: NistIcon,
  iso: IsoIcon,
  lgpd: LgpdIcon,
  bacen: BacenIcon,
  data: DataIcon,
  agentic: AgenticIcon,
  redteam: RedTeamIcon,
  threatintel: ThreatIntelIcon,
  integrado: IntegradoIcon,
  cert: CertIcon,
};
