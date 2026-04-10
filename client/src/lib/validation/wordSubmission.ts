const MAX_LEN = 100;

export type ProposalValidation =
  | { ok: true; text: string }
  | { ok: false; message: string };

export function validateProposalInput(raw: string): ProposalValidation {
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const singleLine = text.replace(/\n/g, ' ').trim();
  if (singleLine.length === 0) {
    return { ok: false, message: 'Enter your idea.' };
  }
  if (singleLine.length > MAX_LEN) {
    return { ok: false, message: `Max ${MAX_LEN} characters.` };
  }
  return { ok: true, text: singleLine };
}
