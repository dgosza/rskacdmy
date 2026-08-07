"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MAX_HISTORY_MESSAGES } from "@/lib/assistantConfig";
import { createClient } from "@/lib/supabase/client";

export default function ModuleAssistant({ contentMd }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function handleSubmit(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const history = messages.slice(-MAX_HISTORY_MESSAGES).map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: question }].slice(-MAX_HISTORY_MESSAGES));
    setInput("");
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: invokeError } = await supabase.functions.invoke("module-assistant", {
        body: { contentMd, question, history },
      });

      if (invokeError) {
        let message = "Não foi possível obter uma resposta.";
        try {
          const body = await invokeError.context?.json();
          if (body?.error) message = body.error;
        } catch {
          // corpo de erro não veio em JSON — mantém a mensagem genérica
        }
        setError(message);
      } else {
        setMessages((prev) => [...prev, { role: "model", text: data.answer }].slice(-MAX_HISTORY_MESSAGES));
      }
    } catch {
      setError("Falha de conexão com o assistente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={wrapRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex w-[min(360px,calc(100vw-2.5rem))] max-h-[70vh] flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-2xl shadow-black/50">
          <div className="flex shrink-0 items-center justify-between border-b border-line bg-panel-2 px-4 py-3">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-signal-400">
                Assistente do dossiê
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                Respostas geradas por IA com base neste dossiê
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar assistente"
              className="rounded p-1 text-muted transition hover:bg-void hover:text-ink"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="font-mono text-xs text-muted">
                Pergunte algo sobre o conteúdo deste dossiê.
              </p>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded border px-3 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "whitespace-pre-wrap border-signal-400/30 bg-signal-400/5 text-ink"
                    : "border-line/60 bg-void/40 text-muted"
                }`}
              >
                {m.role === "user" ? (
                  m.text
                ) : (
                  <div className="prose-chat">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <p className="font-mono text-xs text-muted">Pensando...</p>
            )}

            {error && (
              <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex shrink-0 gap-2 border-t border-line p-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite uma dúvida..."
              className="w-full rounded border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-signal-400/60 focus:ring-1 focus:ring-signal-400/40"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 rounded bg-signal-400 px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-void transition hover:bg-signal-500 disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar assistente do dossiê" : "Abrir assistente do dossiê"}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-signal-400 text-void shadow-lg shadow-black/40 transition hover:bg-signal-500 hover:scale-105"
      >
        {open ? (
          <span className="text-xl leading-none">✕</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
