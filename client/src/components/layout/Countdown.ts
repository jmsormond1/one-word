export function createCountdown(host: HTMLElement): {
  setEndsAt: (endsAtMs: number) => void;
  destroy: () => void;
} {
  const label = document.createElement('span');
  label.className = 'countdown';
  label.textContent = '—';
  host.appendChild(label);

  let endsAt = Date.now() + 60_000;
  let frame = 0;

  const tick = () => {
    const left = Math.max(0, endsAt - Date.now());
    const sec = Math.ceil(left / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    label.textContent =
      sec <= 0 ? 'Next word soon…' : `Next word in ${m}:${String(s).padStart(2, '0')}`;
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);

  return {
    setEndsAt(ms: number) {
      endsAt = ms;
    },
    destroy() {
      cancelAnimationFrame(frame);
      label.remove();
    },
  };
}
