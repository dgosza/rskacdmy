"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/inicio");
    });
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      router.replace("/inicio");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded border border-signal-400/40 bg-signal-400/10 font-mono text-sm font-bold text-signal-400">
            AI
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-400">
            Instituição Financeira // Time de Riscos
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">
            AI Risk Academy
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Painel de acesso restrito. Autentique-se com seu e-mail e senha
            corporativos para acessar a trilha de capacitação em riscos de
            IA.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-panel p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                E-mail corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@instituicao.com.br"
                className="w-full rounded border border-line bg-void px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/50 focus:border-signal-400/60 focus:ring-1 focus:ring-signal-400/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-line bg-void px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/50 focus:border-signal-400/60 focus:ring-1 focus:ring-signal-400/40"
              />
            </div>

            {status === "error" && (
              <p className="font-mono text-xs text-red-400">
                ERRO: {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded bg-signal-400 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-void transition hover:bg-signal-500 disabled:opacity-50"
            >
              {status === "sending" ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
