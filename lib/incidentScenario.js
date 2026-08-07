// Tabletop incident simulation — a timed, decision-based exercise meant to
// be run live (in a workshop or exec demo). Not a real system; a structured
// narrative that scores response quality at each stage of the lifecycle:
// detecção → contenção → comunicação → erradicação → encerramento.

export const INCIDENT_SCENARIOS = [
  {
  key: "pix-fraud-injection",
  title: "Fraude via Pix — Injeção de Prompt no Motor de Risco",
  domain: "OWASP AI Threat Intelligence & Response",
  timeLimitSeconds: 900, // 15 minutos
  summary:
    "08:42 — O SOC detecta um padrão anômalo de aprovações no modelo de scoring de fraude Pix: volume de transações liberadas 40% acima do normal na última hora. Você é o responsável de plantão pela resposta a este incidente.",
  stages: [
    {
      id: 1,
      label: "Detecção",
      timestamp: "08:42",
      narrative:
        "O dashboard de monitoramento mostra um pico de aprovações automáticas em transações Pix de alto valor, todas com uma descrição de transação incomumente longa preenchida pelo remetente. O volume segue subindo.",
      choices: [
        {
          text: "Isolar o modelo imediatamente e reverter para regras estáticas de contenção",
          quality: "best",
          points: 10,
          feedback:
            "Correto. Conter primeiro, investigar depois — mesmo sem causa raiz confirmada, a exposição financeira para de crescer.",
        },
        {
          text: "Aumentar o nível de log do modelo e continuar monitorando por mais 1 hora antes de decidir",
          quality: "partial",
          points: 5,
          feedback:
            "Parcialmente aceitável para investigação, mas atrasar a contenção por uma hora inteira amplia desnecessariamente a janela de exposição.",
        },
        {
          text: "Aguardar confirmação completa da causa raiz antes de agir",
          quality: "bad",
          points: 0,
          feedback:
            "Hesitar custa tempo crítico. Em incidentes financeiros ativos, a contenção não deve esperar o diagnóstico completo.",
        },
      ],
    },
    {
      id: 2,
      label: "Investigação",
      timestamp: "09:05",
      narrative:
        "Com o canal contido, a equipe levanta a hipótese de que o campo de texto livre de 'descrição da transação' está sendo usado para injetar instruções que manipulam a decisão do modelo de risco.",
      choices: [
        {
          text: "Acionar o time de Red Teaming para reproduzir o ataque em ambiente controlado antes de reabrir o canal",
          quality: "best",
          points: 10,
          feedback:
            "Correto. Confirmar e reproduzir o vetor de ataque evita reabrir o canal com a mesma vulnerabilidade.",
        },
        {
          text: "Restringir manualmente o campo de texto livre e reabrir parcialmente o canal com aprovação humana obrigatória",
          quality: "partial",
          points: 5,
          feedback:
            "Mitiga o risco imediato, mas sem reproduzir o ataque a causa raiz real ainda não está confirmada.",
        },
        {
          text: "Reabrir o canal imediatamente após aplicar um patch não testado",
          quality: "bad",
          points: 0,
          feedback:
            "Um patch não validado pode não cobrir o vetor real de ataque — ou pior, introduzir uma nova falha.",
        },
      ],
    },
    {
      id: 3,
      label: "Comunicação",
      timestamp: "09:30",
      narrative:
        "A área de Compliance pergunta se este incidente precisa ser comunicado formalmente, dado o potencial impacto regulatório de uma falha em sistema crítico de prevenção a fraude.",
      choices: [
        {
          text: "Acionar Compliance e preparar comunicado formal dentro do prazo regulatório, documentando as ações de contenção já tomadas",
          quality: "best",
          points: 10,
          feedback:
            "Correto. Comunicação tempestiva e documentada é exatamente o que um exame do Banco Central espera encontrar.",
        },
        {
          text: "Informar apenas a liderança direta, sem acionar Compliance formalmente",
          quality: "partial",
          points: 5,
          feedback:
            "Informar a liderança é necessário, mas pular Compliance formalmente cria risco de não cumprir prazos regulatórios.",
        },
        {
          text: "Aguardar o fechamento total da investigação antes de comunicar qualquer parte interna ou externa",
          quality: "bad",
          points: 0,
          feedback:
            "Prazos regulatórios de comunicação de incidentes normalmente não esperam o encerramento total da investigação.",
        },
      ],
    },
    {
      id: 4,
      label: "Erradicação",
      timestamp: "11:00",
      narrative:
        "O Red Team confirma: uma instrução escondida no campo de descrição da transação manipulava a lógica de decisão do modelo, reduzindo artificialmente o score de risco calculado.",
      choices: [
        {
          text: "Implementar sanitização de entrada e validação de saída do modelo, revisar com o Red Team e só então liberar em produção",
          quality: "best",
          points: 10,
          feedback:
            "Correto. Corrigir a causa raiz nas duas pontas (entrada e saída) e validar antes de liberar fecha o vetor de ataque de forma robusta.",
        },
        {
          text: "Aplicar um filtro simples de palavras-chave e considerar o problema resolvido",
          quality: "partial",
          points: 5,
          feedback:
            "Um filtro de palavras-chave é frágil e facilmente contornável — reduz o risco, mas não o elimina.",
        },
        {
          text: "Reverter para o modelo anterior sem investigar se a mesma vulnerabilidade existe nele",
          quality: "bad",
          points: 0,
          feedback:
            "Reverter sem investigar pode simplesmente trazer de volta uma versão igualmente vulnerável.",
        },
      ],
    },
    {
      id: 5,
      label: "Encerramento",
      timestamp: "14:00",
      narrative:
        "O canal foi reaberto com a correção validada. É hora de encerrar o incidente formalmente.",
      choices: [
        {
          text: "Conduzir um post-mortem sem culpa (blameless), documentar a linha do tempo completa e atualizar o playbook de resposta a incidentes de IA",
          quality: "best",
          points: 10,
          feedback:
            "Correto. O valor real de um incidente é o aprendizado institucionalizado — sem isso, o mesmo vetor pode se repetir.",
        },
        {
          text: "Documentar internamente, mas não atualizar os playbooks ou runbooks da equipe",
          quality: "partial",
          points: 5,
          feedback:
            "Documentar é bom, mas sem atualizar os playbooks o conhecimento não vira processo replicável.",
        },
        {
          text: "Encerrar o chamado sem documentação formal, já que o incidente foi contido",
          quality: "bad",
          points: 0,
          feedback:
            "Sem documentação, não há evidência de resposta estruturada para auditoria — nem aprendizado para o próximo incidente.",
        },
      ],
    },
  ],
  },
  {
    key: "ceo-deepfake-fraud",
    title: "Fraude por Voz Clonada — Solicitação Falsa de Transferência",
    domain: "OWASP AI Threat Intelligence & Response",
    timeLimitSeconds: 900,
    summary:
      "16:10 — O diretor financeiro recebe uma ligação urgente. A voz é idêntica à do CEO, pedindo uma transferência internacional confidencial de R$ 2,3 milhões para fechar uma aquisição sigilosa, com instrução explícita de não confirmar por outros canais 'por questões de confidencialidade'.",
    stages: [
      {
        id: 1,
        label: "Reação inicial",
        timestamp: "16:10",
        narrative:
          "A ligação soa exatamente como o CEO — tom, ritmo de fala e até pequenas pausas características. A urgência é enfatizada repetidas vezes, junto com o pedido de sigilo absoluto.",
        choices: [
          {
            text: "Recusar educadamente executar a transferência sem verificação por canal secundário pré-estabelecido, mesmo sob pressão de urgência",
            quality: "best",
            points: 10,
            feedback:
              "Correto. Pressão por urgência e pedido de sigilo absoluto são sinais clássicos de engenharia social — inclusive quando a voz é sinteticamente clonada.",
          },
          {
            text: "Executar parcialmente a transferência (metade do valor) para 'ganhar tempo' enquanto verifica",
            quality: "partial",
            points: 5,
            feedback:
              "Reduzir o valor não elimina o risco — qualquer transferência sem verificação mantém a exposição.",
          },
          {
            text: "Executar a transferência imediatamente, já que a voz é inconfundivelmente do CEO",
            quality: "bad",
            points: 0,
            feedback:
              "Voz não é mais prova suficiente de identidade — clonagem de voz por IA já é tecnicamente acessível e passível de engano.",
          },
        ],
      },
      {
        id: 2,
        label: "Verificação",
        timestamp: "16:14",
        narrative:
          "É preciso decidir como confirmar a identidade de quem está do outro lado da linha antes de qualquer ação.",
        choices: [
          {
            text: "Ligar de volta usando um número já cadastrado do CEO — não o número que ligou — e confirmar por um segundo canal independente (ex: mensagem em app corporativo verificado)",
            quality: "best",
            points: 10,
            feedback:
              "Correto. Verificação por canal independente e pré-estabelecido é a defesa padrão contra engenharia social com voz ou imagem sintética.",
          },
          {
            text: "Responder no mesmo canal perguntando uma informação que só o CEO saberia",
            quality: "partial",
            points: 5,
            feedback:
              "Melhor que nada, mas perguntas de segurança informais podem já ter sido obtidas por engenharia social anterior ou vazamento de dados.",
          },
          {
            text: "Aceitar a instrução de não usar outros canais, por respeito à hierarquia",
            quality: "bad",
            points: 0,
            feedback:
              "A própria instrução de pular a verificação é, em si, o maior sinal de alerta do golpe.",
          },
        ],
      },
      {
        id: 3,
        label: "Contenção",
        timestamp: "16:20",
        narrative:
          "Enquanto a verificação corre, é preciso decidir se — e quando — acionar as equipes internas de segurança e prevenção a fraude.",
        choices: [
          {
            text: "Acionar o time de segurança/fraude para colocar a transação em análise e notificar o banco receptor sobre possível fraude, mesmo antes da confirmação final",
            quality: "best",
            points: 10,
            feedback:
              "Correto. Agir cedo aumenta a chance de reverter ou bloquear a transferência caso a fraude seja confirmada.",
          },
          {
            text: "Documentar o ocorrido, mas só agir se o CEO confirmar pessoalmente em até 24h",
            quality: "partial",
            points: 5,
            feedback:
              "Documentar é bom, mas 24h é tempo demais diante do risco de uma transferência internacional irreversível.",
          },
          {
            text: "Aguardar confirmação 100% certa antes de acionar qualquer equipe interna",
            quality: "bad",
            points: 0,
            feedback:
              "Esperar certeza total atrasa a contenção — o tempo é o maior aliado do fraudador nesses casos.",
          },
        ],
      },
      {
        id: 4,
        label: "Comunicação",
        timestamp: "16:35",
        narrative:
          "A tentativa foi contida a tempo. Resta decidir como registrar e comunicar o ocorrido internamente.",
        choices: [
          {
            text: "Comunicar Compliance e Segurança da Informação imediatamente, registrando como tentativa de fraude via IA generativa (clonagem de voz)",
            quality: "best",
            points: 10,
            feedback:
              "Correto. Classificar corretamente o vetor (IA generativa) ajuda a calibrar defesas e cumprir eventuais obrigações de reporte.",
          },
          {
            text: "Comunicar apenas informalmente à equipe, sem abrir registro formal",
            quality: "partial",
            points: 5,
            feedback:
              "Sem registro formal, não há rastreabilidade nem dado para fortalecer defesas futuras.",
          },
          {
            text: "Não comunicar, já que a fraude foi evitada e não houve prejuízo financeiro",
            quality: "bad",
            points: 0,
            feedback:
              "Tentativas sem sucesso ainda são sinais valiosos de ameaça ativa e devem ser registradas.",
          },
        ],
      },
      {
        id: 5,
        label: "Encerramento",
        timestamp: "17:00",
        narrative:
          "O incidente foi contido sem perdas financeiras. É hora de decidir o que fica como aprendizado institucional.",
        choices: [
          {
            text: "Atualizar o playbook de verificação de pagamentos para exigir confirmação multicanal em qualquer solicitação de alto valor, e treinar a equipe financeira sobre fraude por voz sintética",
            quality: "best",
            points: 10,
            feedback:
              "Correto. Fechar o ciclo com atualização de processo e treinamento é o que transforma um quase-incidente em fortalecimento real de defesa.",
          },
          {
            text: "Apenas alertar verbalmente a equipe financeira sobre o ocorrido",
            quality: "partial",
            points: 5,
            feedback:
              "Alerta verbal ajuda no curto prazo, mas sem formalizar no processo o aprendizado se perde com o tempo.",
          },
          {
            text: "Encerrar sem nenhuma ação adicional, já que dessa vez funcionou",
            quality: "bad",
            points: 0,
            feedback:
              "Sem atualizar o processo e treinar a equipe, a mesma tática pode funcionar da próxima vez.",
          },
        ],
      },
    ],
  },
];

export function maxScore(scenario) {
  return scenario.stages.reduce(
    (sum, s) => sum + Math.max(...s.choices.map((c) => c.points)),
    0
  );
}

export function readinessRating(pct) {
  if (pct >= 85) return { label: "Exemplar", color: "#34d399" };
  if (pct >= 60) return { label: "Adequada", color: "#fbbf24" };
  return { label: "Insuficiente", color: "#f87171" };
}
