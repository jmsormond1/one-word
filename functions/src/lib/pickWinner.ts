export type Proposal = { text: string; votes: number };

export function pickWinner(
  proposals: Record<string, Proposal>,
): { id: string; text: string } | null {
  const entries = Object.entries(proposals);
  if (entries.length === 0) {
    return null;
  }

  let maxVotes = -1;
  for (const [, p] of entries) {
    if (p.votes > maxVotes) {
      maxVotes = p.votes;
    }
  }

  const tiedIds: string[] = [];
  for (const [id, p] of entries) {
    if (p.votes === maxVotes) {
      tiedIds.push(id);
    }
  }

  tiedIds.sort();
  const winnerId = tiedIds[0];
  return { id: winnerId, text: proposals[winnerId].text };
}

export function appendParagraphToStory(current: string | null, paragraph: string): string {
  const p = paragraph.trim();
  if (p === '') {
    return current ?? '';
  }
  const base = current ?? '';
  if (base === '') {
    return p;
  }
  return `${base}\n\n${p}`;
}
