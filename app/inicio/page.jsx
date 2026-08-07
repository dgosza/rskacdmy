"use client";

import Link from "next/link";
import TopNav from "@/components/TopNav";
import VideoPanel from "@/components/VideoPanel";
import Faq from "@/components/Faq";
import RequireAuth from "@/components/RequireAuth";

export default function InicioPage() {
  return (
    <RequireAuth>
      {(user, profile) => (
        <div className="min-h-screen">
          <TopNav email={user.email} isManager={Boolean(profile?.is_manager)} />

          <main className="mx-auto max-w-3xl px-4 py-10">
            {/* Hero */}
            <section>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-400">
                Instituição Financeira // Time de Riscos
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-ink">
                AI Risk Academy
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                Programa corporativo de capacitação contínua em riscos de
                Inteligência Artificial. Uma única trilha estruturada, do
                fundamento normativo à execução prática de testes de red
                teaming, traduzida para a realidade de uma instituição
                financeira regulada pelo Banco Central do Brasil e sujeita à
                LGPD.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/trilha"
                  className="rounded bg-signal-400 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-void transition hover:bg-signal-500"
                >
                  Acessar a trilha →
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded border border-line px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:border-signal-400/50"
                >
                  Ver credencial
                </Link>
              </div>
            </section>

            {/* Proposta */}
            <section className="mt-12">
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
                  A proposta
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <div className="space-y-4 rounded-lg border border-line bg-panel p-6 sm:p-8">
                <p className="text-sm leading-relaxed text-muted">
                  A AI Risk Academy consolida, em uma única trilha, os
                  principais frameworks de mercado — NIST AI Management
                  Framework (AI RMF), ISO/IEC 42001 e as iniciativas OWASP para
                  segurança de IA (Data Governance, Agentic AI Security and
                  Governance, AI Red Teaming e AI Threat Intelligence &amp;
                  Response) — traduzidos para crédito, prevenção a fraude,
                  transações via Pix e demais fluxos financeiros críticos.
                </p>
                <p className="text-sm leading-relaxed text-muted">
                  Diferente de um treinamento genérico sobre IA, a Academy
                  assume que os participantes já dominam fundamentos de
                  cybersecurity, arquitetura de sistemas e desenvolvimento de
                  software. Cada dossiê combina três camadas: o que o framework
                  exige, como isso se manifesta em cenários prováveis de ataque
                  ou falha no contexto brasileiro, e qual processo mitigatório,
                  controle técnico ou tipo de teste deve ser aplicado — e por
                  quê.
                </p>

                <ul className="grid gap-3 pt-2 sm:grid-cols-2">
                  {[
                    "Traduzir exigências normativas em controles técnicos e critérios de aceitação.",
                    "Reconhecer vulnerabilidades prováveis de IA em crédito, fraude e Pix, e seu impacto.",
                    "Diferenciar auditoria documental, conformidade e red teaming técnico.",
                    "Executar e avaliar testes de red teaming: prompt injection, jailbreak, poisoning, extraction.",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2 rounded border border-line/60 bg-void/40 px-4 py-3 text-xs leading-relaxed text-muted"
                    >
                      <span className="text-signal-400">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Vídeo */}
            <section className="mt-12">
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
                  Apresentação em vídeo
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <VideoPanel />
            </section>

            {/* FAQ */}
            <section className="mt-12 mb-16">
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
                  Perguntas frequentes
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="rounded-lg border border-line bg-panel px-6 sm:px-8">
                <Faq />
              </div>
            </section>
          </main>
        </div>
      )}
    </RequireAuth>
  );
}
