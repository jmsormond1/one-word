export function createPanelSection(options: {
  title: string;
  className?: string;
}): { root: HTMLElement; body: HTMLElement } {
  const root = document.createElement('section');
  root.className = options.className ?? 'panel-section';

  const h = document.createElement('h2');
  h.className = 'panel-section__title';
  h.textContent = options.title;
  root.appendChild(h);

  const body = document.createElement('div');
  body.className = 'panel-section__body';
  root.appendChild(body);

  return { root, body };
}
