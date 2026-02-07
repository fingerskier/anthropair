export function createMessage(role, content, options = {}) {
  const el = document.createElement('div');
  el.className = `chat-msg ${role}`;

  if (role === 'cognate' && options.sender) {
    const senderEl = document.createElement('div');
    senderEl.className = 'cognate-sender';
    senderEl.textContent = `Shared from ${options.sender}`;
    el.appendChild(senderEl);
  }

  if (role !== 'assistant' || content) {
    const contentEl = document.createElement('div');
    contentEl.className = 'msg-content';
    contentEl.textContent = content;
    el.appendChild(contentEl);
  }

  return el;
}
