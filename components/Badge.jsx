import { BADGE_ICONS } from "./badges/icons";

const HEX = "[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]";

const SIZES = {
  sm: { frame: "h-12 w-12", icon: "h-6 w-6", pad: "inset-[1.5px]" },
  md: { frame: "h-16 w-16", icon: "h-8 w-8", pad: "inset-[2px]" },
  lg: { frame: "h-20 w-20", icon: "h-10 w-10", pad: "inset-[2px]" },
};

export default function Badge({ badge, earned, size = "md", showLabel = true }) {
  const Icon = BADGE_ICONS[badge.key];
  const s = SIZES[size] ?? SIZES.md;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className={`relative ${s.frame} shrink-0 ${HEX} ${
          earned ? "bg-signal-400 shadow-[0_0_18px_rgba(251,191,36,0.35)]" : "bg-line/70"
        }`}
      >
        <div
          className={`absolute ${s.pad} ${HEX} flex items-center justify-center ${
            earned ? "bg-panel-2" : "bg-void"
          }`}
        >
          <Icon className={`${s.icon} ${earned ? "text-signal-400" : "text-muted/40"}`} />
        </div>
      </div>

      {showLabel && (
        <div>
          <p
            className={`font-mono text-[9px] font-bold uppercase leading-tight tracking-wide ${
              earned ? "text-ink" : "text-muted/50"
            }`}
          >
            {badge.short}
          </p>
          {earned && (
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-wide text-signal-400/80">
              {badge.codename}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
