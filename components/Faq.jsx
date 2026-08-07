const ITEMS = [
  {
    q: "Quem deve fazer essa trilha?",
    a: "O time de Riscos e áreas próximas (Segurança da Informação, Compliance/LGPD, Auditoria interna) que avaliam, auditam ou testam sistemas de IA usados em crédito, prevenção a fraude e transações via Pix.",
  },
  {
    q: "Preciso ter conhecimento prévio em IA?",
    a: "A Academy assume que você já domina fundamentos de cybersecurity, arquitetura de sistemas e infraestrutura. Ela não repete conceitos básicos de IA/machine learning — o foco é aplicar disciplina de risco, governança e testes ofensivos.",
  },
  {
    q: "Como funciona a certificação?",
    a: "Após concluir os 9 dossiês da trilha, o Módulo 10 libera uma avaliação final com 60 questões de múltipla escolha. Nota mínima de 80% (48 acertos) libera a credencial em PDF.",
  },
  {
    q: "As questões dissertativas são corrigidas automaticamente?",
    a: "Não. O banco de questões dissertativas de cada módulo é material de estudo e discussão em grupo — recomendado para correção qualitativa por um avaliador sênior do time de Riscos.",
  },
  {
    q: "Posso refazer a avaliação final se não for aprovado?",
    a: "Sim. Cada tentativa fica registrada no seu histórico de credencial, e você pode enviar a avaliação novamente quantas vezes precisar.",
  },
  {
    q: "O conteúdo é atualizado?",
    a: "Sim — a AI Risk Academy é tratada como documento vivo. Recomenda-se revisão e atualização anual do conteúdo, dado o ritmo de evolução da regulação e das técnicas de ataque a sistemas de IA.",
  },
];

export default function Faq() {
  return (
    <div className="divide-y divide-line">
      {ITEMS.map((item, i) => (
        <details key={i} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <span className="font-display text-sm font-semibold text-ink">
              {item.q}
            </span>
            <span className="shrink-0 font-mono text-signal-400 transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
