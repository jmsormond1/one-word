import { push, ref, runTransaction } from 'firebase/database';
import type { Database } from 'firebase/database';
import { RTDB_PATHS } from '../../lib/firebase/paths.js';
import type { ProposalRow } from '../../lib/subscriptions/bindProposals.js';

export function mountProposalItem(
  db: Database,
  host: HTMLUListElement,
  row: ProposalRow,
  rank: number,
): void {
  const li = document.createElement('li');
  li.className = 'proposal-item';

  const rankEl = document.createElement('span');
  rankEl.className = 'proposal-item__rank';
  rankEl.textContent = String(rank);

  const text = document.createElement('span');
  text.className = 'proposal-item__text';
  text.textContent = row.text;

  const votes = document.createElement('span');
  votes.className = 'proposal-item__votes';
  votes.setAttribute('aria-label', `${row.votes} votes`);
  votes.textContent = String(row.votes);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'proposal-item__vote';
  btn.textContent = 'Vote';
  btn.addEventListener('click', async () => {
    const r = ref(db, `${RTDB_PATHS.proposals}/${row.id}/votes`);
    try {
      await runTransaction(r, (cur) => (typeof cur === 'number' ? cur + 1 : 1));
    } catch {
      /* ignore */
    }
  });

  li.append(rankEl, text, votes, btn);
  host.appendChild(li);
}

export function submitProposal(db: Database, text: string): Promise<void> {
  const r = ref(db, RTDB_PATHS.proposals);
  return push(r, { text, votes: 0 }).then(() => undefined);
}
