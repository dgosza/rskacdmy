export const BADGES = [
  {
    number: 1,
    key: "nist",
    short: "NIST RMF",
    title: "Fundamentos NIST AI RMF",
    codename: "Governança",
  },
  {
    number: 2,
    key: "iso",
    short: "ISO 42001",
    title: "ISO/IEC 42001",
    codename: "Gestão certificada",
  },
  {
    number: 3,
    key: "lgpd",
    short: "LGPD",
    title: "LGPD aplicada a IA",
    codename: "Proteção de dados",
  },
  {
    number: 4,
    key: "bacen",
    short: "BACEN",
    title: "Regulação BACEN",
    codename: "Conformidade regulatória",
  },
  {
    number: 5,
    key: "data",
    short: "DATA SEC",
    title: "OWASP AI Data Security",
    codename: "Segurança de dados",
  },
  {
    number: 6,
    key: "agentic",
    short: "AGENTIC AI",
    title: "OWASP Agentic AI Security",
    codename: "Controle de agentes",
  },
  {
    number: 7,
    key: "redteam",
    short: "RED TEAM",
    title: "OWASP AI Red Teaming",
    codename: "Ofensiva controlada",
  },
  {
    number: 8,
    key: "threatintel",
    short: "THREAT INTEL",
    title: "OWASP Threat Intelligence",
    codename: "Resposta a incidentes",
  },
  {
    number: 9,
    key: "integrado",
    short: "INTEGRAÇÃO",
    title: "Cenários Integrados Brasil",
    codename: "Leitura integrada",
  },
  {
    number: 10,
    key: "cert",
    short: "CERTIFICADO",
    title: "Certificação Final",
    codename: "Credencial máxima",
  },
];

export function getBadge(number) {
  return BADGES.find((b) => b.number === number);
}
