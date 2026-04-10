export function createSiteHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'site-header';

  const inner = document.createElement('div');
  inner.className = 'site-header__inner';

  const title = document.createElement('h1');
  title.className = 'site-header__title';
  title.textContent = 'What Happens Next?';

  const slogan = document.createElement('p');
  slogan.className = 'site-header__slogan';
  slogan.textContent = 'Daily stories created by your community';

  inner.append(title, slogan);
  header.appendChild(inner);

  return header;
}
