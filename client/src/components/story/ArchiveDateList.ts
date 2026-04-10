export function createArchiveDateList(
  host: HTMLElement,
  options: {
    onSelect: (date: string | null) => void;
  },
): {
  setDates: (dates: string[]) => void;
  highlight: (date: string | null) => void;
} {
  const wrap = document.createElement('div');
  wrap.className = 'archive-list';
  const title = document.createElement('h3');
  title.className = 'archive-list__heading';
  title.textContent = 'Past days';
  wrap.appendChild(title);

  const list = document.createElement('ul');
  list.className = 'archive-list__ul';
  wrap.appendChild(list);

  const todayBtn = document.createElement('button');
  todayBtn.type = 'button';
  todayBtn.className = 'archive-list__today';
  todayBtn.textContent = 'Today (live)';
  todayBtn.addEventListener('click', () => options.onSelect(null));
  wrap.insertBefore(todayBtn, list);

  host.appendChild(wrap);

  let selected: string | null = null;

  const api = {
    setDates(dates: string[]) {
      list.replaceChildren();
      for (const d of dates) {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'archive-list__item';
        btn.textContent = d;
        btn.dataset.date = d;
        btn.addEventListener('click', () => options.onSelect(d));
        li.appendChild(btn);
        list.appendChild(li);
      }
      api.highlight(selected);
    },
    highlight(date: string | null) {
      selected = date;
      todayBtn.classList.toggle('archive-list__today--active', date === null);
      list.querySelectorAll('.archive-list__item').forEach((node) => {
        const btn = node as HTMLButtonElement;
        const isSel = btn.dataset.date === date;
        btn.classList.toggle('archive-list__item--active', isSel);
      });
    },
  };

  return api;
}
