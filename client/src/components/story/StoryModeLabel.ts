export function createStoryModeLabel(host: HTMLElement): {
  setMode: (mode: { kind: 'today' } | { kind: 'archive'; date: string }) => void;
} {
  const el = document.createElement('p');
  el.className = 'story-mode-label';
  host.appendChild(el);

  return {
    setMode(mode) {
      if (mode.kind === 'today') {
        el.textContent = "Viewing: Today's story (live)";
      } else {
        el.textContent = `Viewing: Archive — ${mode.date}`;
      }
    },
  };
}
