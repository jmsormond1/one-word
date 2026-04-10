export function createCountdown(host: HTMLElement): {
  setEndsAt: (endsAtMs: number) => void;
  destroy: () => void;
} {
  const card = document.createElement('div');
  card.className = 'countdown-card';
  card.setAttribute('role', 'timer');
  card.setAttribute('aria-live', 'polite');
  card.setAttribute('aria-atomic', 'true');

  const label = document.createElement('span');
  label.className = 'countdown-card__label';
  label.textContent = 'Next paragraph in';

  const time = document.createElement('span');
  time.className = 'countdown-card__time';
  time.textContent = '—:—';

  const sub = document.createElement('span');
  sub.className = 'countdown-card__sub';
  sub.textContent = 'Highest-voted idea becomes the next paragraph each round';

  card.append(label, time, sub);
  host.appendChild(card);

  let endsAt = Date.now() + 60_000;
  let frame = 0;

  const tick = () => {
    const left = Math.max(0, endsAt - Date.now());
    const sec = Math.ceil(left / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const mmss = `${m}:${String(s).padStart(2, '0')}`;

    if (sec <= 0) {
      time.textContent = '0:00';
      card.classList.add('countdown-card--imminent');
      const msg = 'Picking now…';
      sub.textContent = msg;
      card.setAttribute('aria-label', msg);
    } else {
      time.textContent = mmss;
      card.classList.toggle('countdown-card--imminent', sec <= 10);
      const aria = `Next paragraph in ${m} minutes ${s} seconds`;
      card.setAttribute('aria-label', aria);
      sub.textContent = 'Highest-voted idea becomes the next paragraph each round';
    }

    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);

  return {
    setEndsAt(ms: number) {
      endsAt = ms;
    },
    destroy() {
      cancelAnimationFrame(frame);
      card.remove();
    },
  };
}
