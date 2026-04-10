import type { Database } from 'firebase/database';
import type { ProposalRow } from '../../lib/subscriptions/bindProposals';
import { mountProposalItem } from './ProposalItem';

export function createProposalList(db: Database, host: HTMLElement): {
  render: (rows: ProposalRow[]) => void;
} {
  const section = document.createElement('section');
  section.className = 'proposals-section';
  host.appendChild(section);

  const title = document.createElement('h3');
  title.className = 'proposals-section__title';
  title.textContent = 'Suggestions';
  section.appendChild(title);

  const hint = document.createElement('p');
  hint.className = 'proposals-section__hint';
  hint.textContent =
    'Sorted by votes — highest at the top. Vote on as many suggestions as you want.';
  section.appendChild(hint);

  const headerRow = document.createElement('div');
  headerRow.className = 'proposals-section__columns';
  headerRow.setAttribute('aria-hidden', 'true');
  const hRank = document.createElement('span');
  hRank.className = 'proposals-section__col proposals-section__col--rank';
  hRank.textContent = '#';
  const hWord = document.createElement('span');
  hWord.className = 'proposals-section__col proposals-section__col--word';
  hWord.textContent = 'Idea';
  const hVotes = document.createElement('span');
  hVotes.className = 'proposals-section__col proposals-section__col--votes';
  hVotes.textContent = 'Votes';
  const hAction = document.createElement('span');
  hAction.className = 'proposals-section__col proposals-section__col--action';
  headerRow.append(hRank, hWord, hVotes, hAction);
  section.appendChild(headerRow);

  const scroll = document.createElement('div');
  scroll.className = 'proposals-section__scroll';
  section.appendChild(scroll);

  const ul = document.createElement('ul');
  ul.className = 'proposal-list';
  scroll.appendChild(ul);

  const empty = document.createElement('p');
  empty.className = 'proposals-section__empty';
  empty.textContent = 'No suggestions yet — be the first to shape what happens next.';
  empty.hidden = true;
  scroll.appendChild(empty);

  return {
    render(rows) {
      ul.replaceChildren();
      const hasRows = rows.length > 0;
      empty.hidden = hasRows;
      ul.hidden = !hasRows;
      headerRow.hidden = !hasRows;

      rows.forEach((row, index) => {
        mountProposalItem(db, ul, row, index + 1);
      });
    },
  };
}
