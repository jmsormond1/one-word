const EMPTY_ARCHIVE_COPY = 'No story was generated that day.';

export function createStoryDisplay(host: HTMLElement): {
  setContent: (text: string, opts?: { isEmptyArchive?: boolean }) => void;
} {
  const article = document.createElement('article');
  article.className = 'story-display';
  host.appendChild(article);

  return {
    setContent(text, opts) {
      if (opts?.isEmptyArchive) {
        article.textContent = EMPTY_ARCHIVE_COPY;
        article.classList.add('story-display--muted');
      } else {
        article.classList.remove('story-display--muted');
        article.textContent = text || '…';
      }
    },
  };
}
