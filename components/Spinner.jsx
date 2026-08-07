export default function Spinner({ label, size = "sm" }) {
  const dim = size === "lg" ? "h-6 w-6 border-2" : "h-3.5 w-3.5 border-2";
  return (
    <div className="flex items-center gap-2.5 py-6">
      <span
        className={`${dim} shrink-0 animate-spin rounded-full border-signal-400/30 border-t-signal-400`}
      />
      {label && <span className="font-mono text-xs text-muted">{label}</span>}
    </div>
  );
}
