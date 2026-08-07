"use client";

import { useState } from "react";

// Quando o vídeo institucional estiver pronto, coloque o arquivo em
// /public/videos/apresentacao.mp4 (ou ajuste o caminho abaixo) e o player
// entra em uso automaticamente — nenhuma outra alteração é necessária.
const VIDEO_SRC = "";
const POSTER_SRC = "";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Vídeos por módulo seguem a convenção /public/videos/modulo-NN.mp4 (e
// modulo-NN-poster.jpg para o poster). Basta colocar os arquivos nessa
// pasta com o número do módulo — o player entra em uso automaticamente
// assim que o arquivo existir; até lá, mostra o placeholder abaixo. Como o
// site é estático (sem servidor), a existência do arquivo é checada no
// navegador via o evento onError do próprio <video>, não no disco.
function modulePaths(moduleNumber) {
  const padded = String(moduleNumber).padStart(2, "0");
  return {
    videoSrc: `${BASE_PATH}/videos/modulo-${padded}.mp4`,
    posterSrc: `${BASE_PATH}/videos/modulo-${padded}-poster.jpg`,
  };
}

export default function VideoPanel({ moduleNumber } = {}) {
  const [videoFailed, setVideoFailed] = useState(false);

  const { videoSrc, posterSrc } = moduleNumber
    ? modulePaths(moduleNumber)
    : { videoSrc: VIDEO_SRC ? `${BASE_PATH}${VIDEO_SRC}` : "", posterSrc: POSTER_SRC ? `${BASE_PATH}${POSTER_SRC}` : "" };

  if (videoSrc && !videoFailed) {
    return (
      <video
        className="aspect-video w-full rounded-lg border border-line bg-black"
        controls
        preload="metadata"
        poster={posterSrc || undefined}
        onError={() => setVideoFailed(true)}
      >
        <source src={videoSrc} type="video/mp4" />
        Seu navegador não suporta reprodução de vídeo.
      </video>
    );
  }

  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-line bg-panel">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [background-size:28px_28px]" />
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-signal-400/40 bg-signal-400/10">
          <div className="ml-1 h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-signal-400" />
        </div>
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
          Vídeo institucional em produção
        </p>
        <p className="max-w-xs text-xs text-muted">
          Uma apresentação em vídeo da AI Risk Academy será publicada aqui em
          breve.
        </p>
      </div>
    </div>
  );
}
