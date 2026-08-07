import ModulePageClient from "./ModulePageClient";

// Export estático precisa saber de antemão quais rotas dinâmicas existem —
// os 10 dossiês são fixos, então geramos as 10 páginas em build time.
export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ numero: String(i + 1) }));
}

export default function ModulePage({ params }) {
  return <ModulePageClient numero={params.numero} />;
}
