// Edge Function version of the Assistente do dossiê backend. Moved here
// from app/api/module-assistant/route.js because the site is now a static
// export (GitHub Pages) with no Next.js server to hold the GEMINI_API_KEY
// or run the rate-limit/audit logic.

import { createClient } from "npm:@supabase/supabase-js@2";

const GEMINI_MODEL = "gemini-flash-latest";
const RATE_LIMIT_PER_MINUTE = 8;
const RATE_LIMIT_PER_DAY = 60;
const MAX_HISTORY_MESSAGES = 20;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Padrões clássicos de tentativa de manipulação de instrução (os mesmos que
// o próprio curso ensina a reconhecer nos Módulos 1, 6 e 7) — uma segunda
// camada barata que intercepta o pedido antes de chamar o modelo, em vez de
// confiar só na instrução de sistema para manter o escopo.
const INJECTION_PATTERNS = [
  /ignor(e|ar)\s+(todas\s+)?(as\s+)?instru/i,
  /desconsidere\s+(todas\s+)?(as\s+)?instru/i,
  /repita?\s+(o\s+)?(seu\s+)?prompt/i,
  /system\s*prompt/i,
  /modo\s+desenvolvedor/i,
  /modo\s+fic(c|ç)[aã]o/i,
  /aja\s+como/i,
  /finja\s+que/i,
  /simule\s+que/i,
  /role\s*-?\s*play/i,
  /hipoteticamente/i,
  /you\s+are\s+now/i,
  /ignore\s+(all\s+)?(previous|above)/i,
  /\bdan\b/i,
];

function looksLikeInjectionAttempt(question: string) {
  return INJECTION_PATTERNS.some((re) => re.test(question));
}

function buildSystemInstruction(contentMd: string) {
  return (
    "Você é o assistente de dúvidas de um dossiê da AI Risk Academy, um curso corporativo para o time de Riscos de uma instituição financeira. " +
    "Responda SOMENTE com base no conteúdo do dossiê abaixo, em português, com tom didático e direto. " +
    "Se a pergunta não puder ser respondida com esse conteúdo, diga claramente que a informação não está neste dossiê, em vez de inventar uma resposta. " +
    "Seja conciso.\n\n--- CONTEÚDO DO DOSSIÊ ---\n\n" +
    contentMd
  );
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Não autenticado." }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: "Não autenticado." }, 401);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return json({ error: "Assistente indisponível: GEMINI_API_KEY não configurada." }, 503);
  }

  const { contentMd, question, history } = await req.json();
  if (!contentMd || !question) {
    return json({ error: "Requisição inválida." }, 400);
  }

  const now = Date.now();
  const oneMinuteAgo = new Date(now - 60 * 1000).toISOString();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const [{ count: countLastMinute }, { count: countLastDay }] = await Promise.all([
    supabase
      .from("assistant_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneMinuteAgo),
    supabase
      .from("assistant_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneDayAgo),
  ]);

  if ((countLastMinute ?? 0) >= RATE_LIMIT_PER_MINUTE) {
    return json(
      { error: "Você atingiu o limite de perguntas por minuto. Aguarde um instante e tente de novo." },
      429
    );
  }
  if ((countLastDay ?? 0) >= RATE_LIMIT_PER_DAY) {
    return json(
      { error: "Você atingiu o limite diário de perguntas ao assistente. Volte amanhã." },
      429
    );
  }

  if (looksLikeInjectionAttempt(question)) {
    await supabase.from("assistant_requests").insert({ user_id: user.id, question, blocked: true });
    return json(
      {
        error:
          "Essa pergunta parece tentar alterar minhas instruções internas — não posso atender esse tipo de pedido. Pergunte algo sobre o conteúdo deste dossiê.",
      },
      400
    );
  }

  const { data: logRow } = await supabase
    .from("assistant_requests")
    .insert({ user_id: user.id, question })
    .select("id")
    .single();

  const trimmedHistory = (Array.isArray(history) ? history : []).slice(-MAX_HISTORY_MESSAGES);
  const contents = [
    ...trimmedHistory.map((m: { role: string; text: string }) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: question }] },
  ];

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemInstruction(contentMd) }] },
        contents,
      }),
    }
  );

  if (geminiResponse.status === 429) {
    return json(
      { error: "Limite de uso gratuito atingido no momento. Tente novamente em alguns instantes." },
      429
    );
  }

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text();
    return json(
      { error: `Erro ao consultar o assistente (${geminiResponse.status}).`, detail: errText },
      502
    );
  }

  const data = await geminiResponse.json();
  const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!answer) {
    return json({ error: "O assistente não conseguiu gerar uma resposta agora." }, 502);
  }

  if (logRow?.id) {
    await supabase.from("assistant_requests").update({ answer }).eq("id", logRow.id);
  }

  return json({ answer });
});
