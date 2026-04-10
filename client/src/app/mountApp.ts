import { createCountdown } from '../components/layout/Countdown';
import { createPanelSection } from '../components/layout/PanelSection';
import { createSiteHeader } from '../components/layout/SiteHeader';
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
import { validateProposalInput } from '../lib/validation/wordSubmission';

export function mountApp(root: HTMLElement): void {
  let db;
  try {
    db = getDb();
  } catch (err) {
    root.className = 'app-root';
    root.appendChild(createSiteHeader());
    const p = document.createElement('p');
    p.className = 'env-error';
    p.textContent =
      err instanceof Error ? err.message : 'Missing Firebase configuration.';
    root.appendChild(p);
    return;
  }

  root.className = 'app-root';

  root.appendChild(createSiteHeader());

  const layout = document.createElement('div');
  layout.className = 'app-layout';
  root.appendChild(layout);

  const left = document.createElement('div');
  left.className = 'app-layout__story';
  const right = document.createElement('div');
  right.className = 'app-layout__vote';
  layout.append(left, right);

  const storyPanel = createPanelSection({
    title: "Today's story",
    className: 'panel story-panel',
    intro:
      "This is the story so far today—new paragraphs are added each round from the crowd's top-voted idea. At midnight Pacific time, it's saved to the archive below and a new day begins.",
  });
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

  const votePanel = createPanelSection({
    title: 'Suggest & vote',
    className: 'panel vote-panel',
    intro:
      "Suggest what should happen next (up to 100 characters) and vote for ideas you like—you can do both as much as you like. Each round, the top-voted idea is turned into the next story paragraph.",
  });
  right.appendChild(votePanel.root);

  const countdownHost = document.createElement('div');
  countdownHost.className = 'countdown-host';
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
  submitBtn.textContent = 'Submit idea';
  form.appendChild(submitBtn);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const result = validateProposalInput(wordUi.input.value);
    if (!result.ok) {
      wordUi.setError(result.message);
      return;
    }
    wordUi.setError(null);
    try {
      await submitProposal(db, result.text);
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
