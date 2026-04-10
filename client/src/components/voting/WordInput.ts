export function createWordInput(host: HTMLElement): {
  input: HTMLInputElement;
  error: HTMLElement;
  setError: (msg: string | null) => void;
  clear: () => void;
} {
  const field = document.createElement('div');
  field.className = 'word-input';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'word-input__field';
  input.autocomplete = 'off';
  input.maxLength = 20;
  input.placeholder = 'One word (no spaces)';
  input.setAttribute('aria-label', 'Word to submit');

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
