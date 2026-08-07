"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";

function isActivePath(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function TopNav({ email, isManager = false }) {
  const pathname = usePathname();

  const linkClass = (href) =>
    `font-mono text-xs uppercase tracking-wide transition ${
      isActivePath(pathname, href) ? "text-signal-400" : "text-muted hover:text-signal-400"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-void/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/inicio" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded border border-signal-400/40 bg-signal-400/10 font-mono text-xs font-bold text-signal-400">
            AI
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-tight text-ink">
              AI RISK ACADEMY
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Time de Riscos IA
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/inicio" className={linkClass("/inicio")}>
            Início
          </Link>
          <Link href="/trilha" className={linkClass("/trilha")}>
            Trilha
          </Link>
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            Credencial
          </Link>
          <Link
            href="/laboratorio"
            className={`hidden sm:inline ${linkClass("/laboratorio")}`}
          >
            Laboratório
          </Link>
          <Link
            href="/glossario"
            className={`hidden sm:inline ${linkClass("/glossario")}`}
          >
            Glossário
          </Link>
          {isManager && (
            <Link
              href="/relatorio"
              className={`hidden font-mono text-xs uppercase tracking-wide transition sm:inline ${
                isActivePath(pathname, "/relatorio")
                  ? "text-signal-400"
                  : "text-muted hover:text-signal-400"
              }`}
            >
              Relatório
            </Link>
          )}
          {email && (
            <span className="hidden font-mono text-xs text-muted/70 sm:inline">
              {email}
            </span>
          )}
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
