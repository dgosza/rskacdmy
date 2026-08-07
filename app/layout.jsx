import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";
import ToastHost from "@/components/ToastHost";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata = {
  title: "AI Risk Academy",
  description:
    "Programa corporativo de capacitação em riscos de Inteligência Artificial para o time de Riscos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body className="min-h-screen bg-void font-body text-ink antialiased">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-60 [background-size:36px_36px]" />
        <div className="relative">{children}</div>
        <ToastHost />
      </body>
    </html>
  );
}
