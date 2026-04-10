const MAX_LEN = 20;

export type WordValidation = { ok: true; word: string } | { ok: false; message: string };

export function validateWordInput(raw: string): WordValidation {
  const word = raw.trim();
  if (word.length === 0) {
    return { ok: false, message: 'Enter a word.' };
  }
  if (word.length > MAX_LEN) {
    return { ok: false, message: `Max ${MAX_LEN} characters.` };
  }
  if (/\s/.test(word)) {
    return { ok: false, message: 'One word only — no spaces.' };
  }
  return { ok: true, word };
}
