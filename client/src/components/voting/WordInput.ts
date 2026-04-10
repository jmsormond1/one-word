export function createWordInput(host: HTMLElement): {
  input: HTMLTextAreaElement;
  error: HTMLElement;
  setError: (msg: string | null) => void;
  clear: () => void;
} {
  const field = document.createElement('div');
  field.className = 'word-input';

  const input = document.createElement('textarea');
  input.className = 'word-input__field';
  input.autocomplete = 'off';
  input.maxLength = 100;
  input.rows = 3;
  input.placeholder = 'What should happen next? (up to 100 characters)';
  input.setAttribute('aria-label', 'Suggestion for the next part of the story');

  const error = document.createElement('p');
  error.className = 'word-input__error';
  error.hidden = true;

  field.appendChild(input);
  field.appendChild(error);
  host.appendChild(field);

  return {
    input,
    error,
    setError(msg) {
      if (msg) {
        error.textContent = msg;
        error.hidden = false;
      } else {
        error.textContent = '';
        error.hidden = true;
      }
    },
    clear() {
      input.value = '';
      error.hidden = true;
    },
  };
}
