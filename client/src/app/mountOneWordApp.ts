import { createCountdown } from '../components/layout/Countdown';
import { createPanelSection } from '../components/layout/PanelSection';
import { createArchiveDateList } from '../components/story/ArchiveDateList';
import { createStoryDisplay } from '../components/story/StoryDisplay';
import { createStoryModeLabel } from '../components/story/StoryModeLabel';
import { createProposalList } from '../components/voting/ProposalList';
import { submitProposal } from '../components/voting/ProposalItem';
import { createWordInput } from '../components/voting/WordInput';
import { getDb } from '../lib/firebase/init';
import { bindArchive } from '../lib/subscriptions/bindArchive';
import { bindLiveStory } from '../lib/subscriptions/bindStory';
import { bindProposals, type ProposalRow } from '../lib/subscriptions/bindProposals';
import { bindRound, type RoundState } from '../lib/subscriptions/bindRound';
import { validateWordInput } from '../lib/validation/wordSubmission';

export function mountOneWordApp(root: HTMLElement): void {
  let db;
  try {
    db = getDb();
  } catch (err) {
    const p = document.createElement('p');
    p.className = 'env-error';
    p.textContent =
      err instanceof Error ? err.message : 'Missing Firebase configuration.';
    root.appendChild(p);
    return;
  }

  root.className = 'one-word-root';

  const layout = document.createElement('div');
  layout.className = 'app-layout';
  root.appendChild(layout);

  const left = document.createElement('div');
  left.className = 'app-layout__story';
  const right = document.createElement('div');
  right.className = 'app-layout__vote';
  layout.append(left, right);

  const storyPanel = createPanelSection({ title: 'Story', className: 'panel story-panel' });
  left.appendChild(storyPanel.root);

  const modeHost = document.createElement('div');
  storyPanel.body.appendChild(modeHost);
  const mode = createStoryModeLabel(modeHost);

  const archiveHost = document.createElement('div');
  storyPanel.body.appendChild(archiveHost);

  const displayHost = document.createElement('div');
  storyPanel.body.appendChild(displayHost);
  const display = createStoryDisplay(displayHost);

  let liveStory = '';
  let archive: Record<string, string> = {};
  let selectedArchiveDate: string | null = null;

  const archiveUi = createArchiveDateList(archiveHost, {
    onSelect: (date) => {
      selectedArchiveDate = date;
      archiveUi.highlight(date);
      syncStoryView();
    },
  });

  function sortedArchiveDates(): string[] {
    return Object.keys(archive).sort((a, b) => b.localeCompare(a));
  }

  function syncStoryView() {
    if (selectedArchiveDate === null) {
      mode.setMode({ kind: 'today' });
      display.setContent(liveStory);
      return;
    }
    mode.setMode({ kind: 'archive', date: selectedArchiveDate });
    const text = archive[selectedArchiveDate] ?? '';
    if (text === '') {
      display.setContent('', { isEmptyArchive: true });
    } else {
      display.setContent(text);
    }
  }

  const votePanel = createPanelSection({ title: 'Next word', className: 'panel vote-panel' });
  right.appendChild(votePanel.root);

  const countdownHost = document.createElement('div');
  countdownHost.className = 'countdown-row';
  votePanel.body.appendChild(countdownHost);
  const countdown = createCountdown(countdownHost);

  const form = document.createElement('form');
  form.className = 'word-form';
  votePanel.body.appendChild(form);

  const inputWrap = document.createElement('div');
  form.appendChild(inputWrap);
  const wordUi = createWordInput(inputWrap);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'word-form__submit';
  submitBtn.textContent = 'Submit word';
  form.appendChild(submitBtn);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const result = validateWordInput(wordUi.input.value);
    if (!result.ok) {
      wordUi.setError(result.message);
      return;
    }
    wordUi.setError(null);
    try {
      await submitProposal(db, result.word);
      wordUi.clear();
    } catch {
      wordUi.setError('Could not submit. Try again.');
    }
  });

  const listHost = document.createElement('div');
  votePanel.body.appendChild(listHost);
  const proposalList = createProposalList(db, listHost);

  const unsubs: Array<() => void> = [];

  unsubs.push(
    bindLiveStory(db, (text: string) => {
      liveStory = text;
      syncStoryView();
    }),
  );

  unsubs.push(
    bindArchive(db, (entries: Record<string, string>) => {
      archive = entries;
      archiveUi.setDates(sortedArchiveDates());
      syncStoryView();
    }),
  );

  unsubs.push(
    bindRound(db, (round: RoundState) => {
      countdown.setEndsAt(round.endsAt);
    }),
  );

  unsubs.push(
    bindProposals(db, (rows: ProposalRow[]) => {
      proposalList.render(rows);
    }),
  );

  archiveUi.highlight(null);
  syncStoryView();
}
