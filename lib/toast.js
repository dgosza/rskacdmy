// Minimal pub/sub toast system — no context provider needed.
// Any client component can call toast(message, type) after importing this
// module; <ToastHost/> (mounted once in the root layout) renders them.

let listeners = [];
let idSeq = 0;

export function subscribeToast(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function toast(message, type = "info") {
  const id = ++idSeq;
  listeners.forEach((fn) => fn({ id, message, type }));
  return id;
}
