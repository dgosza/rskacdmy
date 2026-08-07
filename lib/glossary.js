// Glossário cross-módulo — referência rápida de siglas e conceitos usados
// ao longo dos 9 dossiês da trilha. `modules` indica em quais dossiês o
// termo aparece com mais relevância.

export const GLOSSARY = [
  {
    term: "NIST AI RMF",
    expansion: "NIST AI Risk Management Framework",
    definition:
      "Framework de gestão de risco de IA, voluntário e não certificável, organizado em quatro funções contínuas e não sequenciais: Governar, Mapear, Medir e Gerenciar.",
    modules: [1],
  },
  {
    term: "Governar, Mapear, Medir, Gerenciar",
    expansion: "",
    definition:
      "As quatro funções do NIST AI RMF. Governar trata de cultura e políticas; Mapear identifica contexto e dados; Medir aplica testes e métricas; Gerenciar prioriza e trata os riscos encontrados.",
    modules: [1],
  },
  {
    term: "Caixa branca / cinza / preta",
    expansion: "White-box / grey-box / black-box",
    definition:
      "Classificação do nível de acesso num teste de IA: caixa branca (acesso total a dados e modelo, ambiente interno), caixa preta (só a interface, simulando atacante externo), caixa cinza (acesso parcial).",
    modules: [1, 7],
  },
  {
    term: "Model extraction",
    expansion: "",
    definition:
      "Ataque que usa consultas repetidas a uma API de modelo para reconstruir sua lógica de decisão ou inferir dados de treino sensíveis.",
    modules: [1, 3],
  },
  {
    term: "Data poisoning",
    expansion: "",
    definition:
      "Inserção deliberada de dados corrompidos ou adversariais no pipeline de treino/fine-tuning, criando viés induzido ou vulnerabilidades latentes.",
    modules: [1, 5],
  },
  {
    term: "Prompt injection",
    expansion: "",
    definition:
      "Manipulação de um sistema de IA por meio de instruções inseridas no prompt ou em conteúdo processado por ele, direta ou indiretamente (via documento, e-mail etc.), para alterar seu comportamento pretendido.",
    modules: [1, 6, 7],
  },
  {
    term: "Jailbreak",
    expansion: "",
    definition:
      "Técnica para contornar as restrições de comportamento de um modelo de IA, geralmente por meio de enquadramento de role-play, camadas de instrução ou reformulação do pedido.",
    modules: [1, 7],
  },
  {
    term: "ISO/IEC 42001",
    expansion: "AI Management System (AIMS)",
    definition:
      "Primeira norma internacional certificável para Sistemas de Gestão de Inteligência Artificial. Seu núcleo é o Anexo A, com 38 controles em 9 objetivos (A.2 a A.10).",
    modules: [2],
  },
  {
    term: "AIMS",
    expansion: "AI Management System",
    definition:
      "Sistema de Gestão de Inteligência Artificial certificável pela ISO/IEC 42001 — estrutura de governança, papéis e controles para operar IA de forma consistente e auditável.",
    modules: [2],
  },
  {
    term: "SoA",
    expansion: "Statement of Applicability / Declaração de Aplicabilidade",
    definition:
      "Documento que registra quais dos 38 controles do Anexo A da ISO 42001 uma organização inclui ou exclui, com justificativa — os controles não são uma lista prescritiva obrigatória.",
    modules: [2],
  },
  {
    term: "Anexo A (ISO 42001)",
    expansion: "",
    definition:
      "Núcleo operacional da ISO/IEC 42001: 38 controles organizados em 9 objetivos, de A.2 (política de IA) a A.10 (relacionamento com terceiros).",
    modules: [2],
  },
  {
    term: "LGPD",
    expansion: "Lei Geral de Proteção de Dados (Lei 13.709/2018)",
    definition:
      "Lei brasileira que regula o tratamento de dados pessoais — não foi escrita pensando em IA, mas já cobre o núcleo do que importa em sistemas de IA aplicados a crédito, fraude e Pix.",
    modules: [3],
  },
  {
    term: "RIPD/DPIA",
    expansion: "Relatório de Impacto à Proteção de Dados",
    definition:
      "Documento exigido pela LGPD para todo sistema que realize decisão automatizada com efeito relevante sobre o titular. Deve ser específico por sistema de IA, nunca genérico.",
    modules: [3],
  },
  {
    term: "RLI",
    expansion: "Relatório de Legítimo Interesse",
    definition:
      "Documento exigido quando a base legal para treinar um modelo de IA com dado pessoal é o legítimo interesse (Art. 10 LGPD). Deve ser específico por sistema — reaproveitar entre sistemas é tratado como agravante pela ANPD.",
    modules: [3],
  },
  {
    term: "ANPD",
    expansion: "Autoridade Nacional de Proteção de Dados",
    definition:
      "Órgão regulador da LGPD. Incluiu 'inteligência artificial e tecnologias emergentes' entre os quatro eixos prioritários de fiscalização para o biênio 2026-2027.",
    modules: [3],
  },
  {
    term: "Art. 20 da LGPD",
    expansion: "",
    definition:
      "Garante ao titular o direito de solicitar revisão de decisões tomadas unicamente por tratamento automatizado — cobre negativa de crédito por score, bloqueio antifraude e recusa de transação Pix.",
    modules: [3],
  },
  {
    term: "XAI",
    expansion: "Explainable AI",
    definition:
      "Técnicas de explicabilidade de modelo (ex.: SHAP, LIME) que se tornaram exigência regulatória — não apenas boa prática — para decisões automatizadas de crédito, conforme o Art. 20 da LGPD regulamentado.",
    modules: [3],
  },
  {
    term: "Membership inference",
    expansion: "",
    definition:
      "Ataque que tenta determinar se um indivíduo específico fez parte do conjunto de treino de um modelo, revelando informação sobre dados sensíveis usados no treinamento.",
    modules: [3, 5],
  },
  {
    term: "Model inversion",
    expansion: "",
    definition:
      "Ataque que tenta reconstruir características dos dados de treino a partir de consultas ao modelo já treinado.",
    modules: [3, 5],
  },
  {
    term: "BACEN / BCB / CMN",
    expansion: "Banco Central do Brasil / Conselho Monetário Nacional",
    definition:
      "Reguladores do sistema financeiro brasileiro. Não há resolução específica de IA, mas resoluções já vigentes (gestão de risco, segurança cibernética, nuvem) se aplicam por analogia direta a sistemas de IA.",
    modules: [4],
  },
  {
    term: "Resolução CMN 4.557/2017",
    expansion: "",
    definition:
      "Estabelece a estrutura de gerenciamento integrado de riscos — enquadra falhas de modelo de IA (viés, degradação) como risco operacional/de modelo dentro dessa estrutura já existente.",
    modules: [4],
  },
  {
    term: "Resolução CMN 5.274/2025 / BCB 538/2025",
    expansion: "",
    definition:
      "Atualizações de dezembro de 2025 que introduziram controles mínimos obrigatórios para Pix/STR: isolamento de ambiente, MFA administrativo, testes de intrusão anuais independentes e CTI.",
    modules: [4],
  },
  {
    term: "CR",
    expansion: "Comunicação Relevante",
    definition:
      "Comunicação obrigatória ao BCB, exigida pelo Comunicado BACEN nº 41.782/2024, antes da contratação de serviço relevante de processamento, dados ou nuvem.",
    modules: [4],
  },
  {
    term: "CRO",
    expansion: "Chief Risk Officer",
    definition:
      "Diretor responsável pela estrutura de gerenciamento integrado de riscos exigida pela Resolução CMN 4.557/2017 — deve ter visibilidade formal sobre sistemas de IA relevantes.",
    modules: [4],
  },
  {
    term: "STR",
    expansion: "Sistema de Transferência de Reservas",
    definition:
      "Ambiente crítico do sistema financeiro que, junto ao Pix, exige isolamento físico e lógico obrigatório para qualquer componente de IA que o toque, conforme as resoluções de dezembro de 2025.",
    modules: [4],
  },
  {
    term: "MFA",
    expansion: "Multi-Factor Authentication / Autenticação Multifator",
    definition:
      "Autenticação multifator, obrigatória para acesso administrativo aos ambientes Pix e STR, incluindo consoles de pipelines de dados ou modelos de IA com acesso a esses ambientes.",
    modules: [4],
  },
  {
    term: "CTI",
    expansion: "Cyber Threat Intelligence",
    definition:
      "Capacidade de inteligência de ameaças, exigida como controle mínimo pela regulação BACEN — a instituição deve demonstrar postura preditiva, não apenas resposta reativa.",
    modules: [4, 8],
  },
  {
    term: "Serviço relevante",
    expansion: "",
    definition:
      "Classificação regulatória (Comunicado BACEN 41.782/2024) para contratações de processamento, dados ou nuvem. O que define o enquadramento é a arquitetura de integração, não o rótulo comercial do produto.",
    modules: [4],
  },
  {
    term: "DSGAI01-21",
    expansion: "GenAI Data Security Risks and Mitigations (OWASP)",
    definition:
      "21 categorias de risco de segurança de dados para IA generativa, LLMs e agentes, publicadas pela OWASP em 2026 — vão além do OWASP Top 10 para LLM ao focar na camada de dados.",
    modules: [5],
  },
  {
    term: "AI-DSPM",
    expansion: "AI Data Security Posture Management",
    definition:
      "Modelo de postura de segurança de dados de IA em três camadas: descoberta e inventário, classificação e vinculação de política, monitoramento e aplicação.",
    modules: [5],
  },
  {
    term: "AIBOM",
    expansion: "AI Bill of Materials",
    definition:
      "Inventário estruturado de proveniência de dados e componentes de terceiros usados para construir e operar um modelo de IA — essencial para comprovar base legal e qualidade perante auditoria.",
    modules: [5, 8],
  },
  {
    term: "Shadow AI",
    expansion: "",
    definition:
      "Uso de ferramentas de IA generativa não aprovadas pela instituição por colaboradores — cada uso expõe dado a um ambiente sem proteção contratual ou trilha de auditoria.",
    modules: [5],
  },
  {
    term: "Cross-user conversation bleed",
    expansion: "",
    definition:
      "Falha em que o contexto, cache ou memória de um agente conversacional de um cliente vaza para a sessão de outro — risco direto de exposição de dado pessoal.",
    modules: [5],
  },
  {
    term: "RAG",
    expansion: "Retrieval-Augmented Generation",
    definition:
      "Arquitetura em que um agente consulta uma base de conhecimento (vector store) antes de responder. Se a base não tiver controle de integridade, é alvo de RAG poisoning.",
    modules: [5, 7],
  },
  {
    term: "RAG poisoning",
    expansion: "",
    definition:
      "Envenenamento do conteúdo indexado numa base vetorial consultada por um agente RAG, manipulando indiretamente a resposta do modelo sem tocar em seus pesos.",
    modules: [5, 6],
  },
  {
    term: "ASI01–ASI10",
    expansion: "OWASP Top 10 for Agentic Applications",
    definition:
      "Dez categorias de risco de agentes autônomos (sequestro de objetivo, uso indevido de ferramentas, abuso de identidade, cadeia de suprimentos, execução inesperada de código, envenenamento de memória, comunicação insegura entre agentes, falhas em cascata, exploração de confiança humano-agente, agentes desviantes), publicadas pela OWASP em dezembro de 2025.",
    modules: [6],
  },
  {
    term: "Least Agency",
    expansion: "",
    definition:
      "Princípio arquitetural central do OWASP Top 10 for Agentic Applications: conceder ao agente apenas o mínimo de autonomia necessário para cumprir sua tarefa com segurança — equivalente ao menor privilégio em segurança tradicional.",
    modules: [6],
  },
  {
    term: "Blast radius",
    expansion: "Raio de impacto",
    definition:
      "Escopo de dano contido por guardrails (circuit breakers, rate limiting, logs imutáveis) quando um agente falha ou é comprometido — a prevenção total de falhas em cascata é considerada inviável.",
    modules: [6],
  },
  {
    term: "MCP",
    expansion: "Model Context Protocol",
    definition:
      "Protocolo usado por servidores/ferramentas de terceiros que um agente descobre e integra em tempo de execução — tratado como cadeia de suprimentos ativa e dinâmica, não estática.",
    modules: [6],
  },
  {
    term: "Task-scoped credentials",
    expansion: "Credenciais escopadas à tarefa",
    definition:
      "Credenciais de curta duração, específicas à tarefa de um agente, que expiram ao término da execução — mitigam abuso de identidade e execução de código inesperada.",
    modules: [6],
  },
  {
    term: "Red teaming x pentest",
    expansion: "",
    definition:
      "Red teaming de IA é contínuo e conduzido internamente para avaliar riscos organizacionais específicos; pentest é anual, independente e conduzido por terceiro para fins de evidência regulatória. São complementares, não substitutos.",
    modules: [7],
  },
  {
    term: "Vulnerabilidade de modelo x de sistema",
    expansion: "",
    definition:
      "Vulnerabilidade de modelo tem causa no próprio modelo (ex.: memorização de dado de treino); vulnerabilidade de sistema tem causa na integração ao redor dele (ex.: acesso indevido via RAG). Determina qual time corrige.",
    modules: [7],
  },
  {
    term: "Single-turn x multi-turn",
    expansion: "",
    definition:
      "Ataques de turno único usam um único prompt malicioso; ataques de múltiplos turnos constroem a manipulação gradualmente ao longo da conversa — geralmente mais eficazes contra defesas simples.",
    modules: [7],
  },
  {
    term: "As cinco fases do red teaming",
    expansion: "",
    definition:
      "Reconhecimento, geração de ataques, execução, validação e mitigação com reteste — metodologia estruturada do OWASP GenAI Red Teaming Guide.",
    modules: [7],
  },
  {
    term: "GenAI-IRF",
    expansion: "Practical Incident-Response Framework for Generative AI Systems",
    definition:
      "Framework acadêmico que conecta NIST SP 800-61r3 e MITRE ATLAS a princípios de garantia de IA, agrupando incidentes por semelhança de fluxo de contenção em vez de tipo de vulnerabilidade técnica.",
    modules: [8],
  },
  {
    term: "MITRE ATLAS",
    expansion: "Adversarial Threat Landscape for Artificial-Intelligence Systems",
    definition:
      "Catálogo de táticas e técnicas adversariais contra sistemas de IA, usado como referência por frameworks de resposta a incidentes como o GenAI-IRF.",
    modules: [8],
  },
  {
    term: "NIST SP 800-61r3",
    expansion: "",
    definition:
      "Publicação especial do NIST sobre resposta a incidentes de segurança, referência-base combinada ao MITRE ATLAS em frameworks de resposta a incidentes de IA.",
    modules: [8],
  },
  {
    term: "Decision gates",
    expansion: "Portões de decisão",
    definition:
      "Pontos de decisão pré-definidos num playbook de resposta a incidente de IA, reduzindo ambiguidade processual e carga cognitiva da equipe sob pressão.",
    modules: [8],
  },
  {
    term: "CVE",
    expansion: "Common Vulnerabilities and Exposures",
    definition:
      "Identificador padrão de vulnerabilidades de software. A maioria dos incidentes de IA ainda não é mapeada a CVEs tradicionais — são sistêmicos e arquiteturais, não um 'código com falha' isolado.",
    modules: [8],
  },
  {
    term: "Pix",
    expansion: "",
    definition:
      "Sistema de pagamento instantâneo brasileiro. Junto ao STR, é o ambiente crítico que mais exige isolamento e controles reforçados quando sistemas de IA participam do fluxo de decisão ou execução.",
    modules: [1, 4, 9],
  },
  {
    term: "DLP",
    expansion: "Data Loss Prevention",
    definition:
      "Controles de prevenção de perda de dados, aplicados especialmente na camada de saída de agentes conversacionais para bloquear vazamento de dado pessoal ou de outro cliente na resposta gerada.",
    modules: [5],
  },
];
