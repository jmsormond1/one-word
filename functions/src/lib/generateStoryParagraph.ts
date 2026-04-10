import OpenAI from 'openai';

const MODEL = 'gpt-4o-mini';
const LLM_TIMEOUT_MS = 20_000;
/** Target max length communicated to the model in prompts (not enforced in code). */
const MAX_PARAGRAPH_CHARS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`LLM timed out after ${ms}ms`)), ms),
    ),
  ]);
}

function sanitizeModelOutput(raw: string): string {
  let t = raw.trim();
  if (t.startsWith('"') && t.endsWith('"') && t.length > 1) {
    t = t.slice(1, -1).trim();
  }
  t = t
    .replace(/^```[a-z]*\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();
  return t;
}

function buildUserPrompt(currentStory: string, winningSuggestion: string): string {
  const storyPart =
    currentStory.trim() === '' ? '(The story is just beginning.)' : currentStory.trim();
  return [
    'Story so far:',
    '',
    storyPart,
    '',
    'Readers voted this should happen next:',
    winningSuggestion,
    '',
    `Write only the next paragraph. It must be at most ${MAX_PARAGRAPH_CHARS} characters (count spaces and punctuation).`,
    'If the vote is specific and workable, stay close to it—no extra subplots or filler.',
    'If the vote is vague or odd, still make the paragraph feel like the natural next beat; bridge or reinterpret creatively so it fits the story, even when the vote clashes with what came before.',
    'You may use narration, dialogue, or other normal fiction devices in one cohesive paragraph.',
  ].join('\n');
}

async function generateStoryParagraph(opts: {
  apiKey: string;
  currentStory: string;
  winningSuggestion: string;
}): Promise<string> {
  const client = new OpenAI({ apiKey: opts.apiKey });
  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 200,
    messages: [
      {
        role: 'system',
        content: [
          'You continue a collaborative fiction story written in English.',
          'Reply with a single paragraph only—no title, labels, bullet points, or meta commentary before or after the story text.',
          'The paragraph may include narration, quoted dialogue, or other ordinary fiction elements, as one cohesive beat.',
          `The paragraph must not exceed ${MAX_PARAGRAPH_CHARS} characters total (count every character).`,
          'Voice: slightly casual and readable—not stiff, not extremely formal.',
          'Prioritize continuity with the existing story. When the voted direction is clear and strong, follow it closely and avoid unnecessary additions.',
          'When the vote is vague, thin, or nonsensical relative to the story, invent just enough to make a satisfying next paragraph while still nodding to the vote.',
          'If the vote conflicts with prior events, smooth it into the story anyway so the paragraph still feels like part of the same tale.',
        ].join(' '),
      },
      {
        role: 'user',
        content: buildUserPrompt(opts.currentStory, opts.winningSuggestion),
      },
    ],
  });
  const text = completion.choices[0]?.message?.content?.trim() ?? '';
  return sanitizeModelOutput(text);
}

export async function resolveNextParagraph(
  getOpenAiApiKey: () => string,
  currentStory: string | null,
  winningSuggestion: string,
): Promise<string> {
  const key = getOpenAiApiKey().trim();
  if (!key) {
    console.warn('[finalizeRound] OPENAI_API_KEY not set; appending raw winning suggestion.');
    return winningSuggestion.trim();
  }

  const attempt = (): Promise<string> =>
    generateStoryParagraph({
      apiKey: key,
      currentStory: currentStory ?? '',
      winningSuggestion,
    });

  try {
    const paragraph = await withTimeout(attempt(), LLM_TIMEOUT_MS);
    if (paragraph.length > 0) {
      return paragraph;
    }
    throw new Error('LLM returned empty paragraph');
  } catch (e1) {
    console.warn('[finalizeRound] LLM attempt 1 failed:', e1);
    await sleep(400);
    try {
      const paragraph = await withTimeout(attempt(), LLM_TIMEOUT_MS);
      if (paragraph.length > 0) {
        return paragraph;
      }
      throw new Error('LLM returned empty paragraph');
    } catch (e2) {
      console.warn('[finalizeRound] LLM attempt 2 failed; using raw winning suggestion:', e2);
      return winningSuggestion.trim();
    }
  }
}
