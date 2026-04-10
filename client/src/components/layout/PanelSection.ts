export function createPanelSection(options: {
  title: string;
  className?: string;
  intro?: string;
}): { root: HTMLElement; body: HTMLElement } {
  const root = document.createElement('section');
  root.className = options.className ?? 'panel-section';

  const h = document.createElement('h2');
  h.className = 'panel-section__title';
  h.textContent = options.title;
  root.appendChild(h);

  if (options.intro) {
    const intro = document.createElement('p');
    intro.className = 'panel-section__intro';
    intro.textContent = options.intro;
    root.appendChild(intro);
  }

  const body = document.createElement('div');
  body.className = 'panel-section__body';
  root.appendChild(body);

  return { root, body };
}
