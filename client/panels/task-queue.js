import { getState, subscribe, updateInArray, appendState } from '../lib/state.js';
import { on, send } from '../lib/ws-client.js';
import { createTaskCard } from '../components/task-card.js';

const queueEl = () => document.getElementById('task-queue');
const countEl = () => document.getElementById('task-count');

export function initTaskQueue() {
  on('task:update', handleTaskUpdate);
  subscribe('tasks', renderAll);
  subscribe('roomMessages', renderAll);
}

function handleTaskUpdate(msg) {
  const tasks = getState('tasks');
  const existing = tasks.find(t => t.id === msg.task.id);
  if (existing) {
    updateInArray('tasks', msg.task.id, msg.task);
  } else {
    appendState('tasks', msg.task);
  }
}

function renderAll() {
  const el = queueEl();
  if (!el) return;

  el.innerHTML = '';

  // Render task cards
  const tasks = getState('tasks') || [];
  for (const task of tasks) {
    el.appendChild(createTaskCard(task, {
      onApprove: (id) => send({ type: 'task:approve', taskId: id }),
      onReject: (id) => send({ type: 'task:reject', taskId: id }),
    }));
  }

  // Render room message cards
  const roomMessages = getState('roomMessages') || [];
  for (const msg of roomMessages) {
    el.appendChild(createRoomMessageCard(msg));
  }

  const count = countEl();
  if (count) {
    const active = tasks.filter(t => t.status !== 'done' && t.status !== 'rejected').length;
    count.textContent = active + (roomMessages.length ? `+${roomMessages.length}` : '');
  }
}

function createRoomMessageCard(msg) {
  const card = document.createElement('div');
  card.className = 'task-card room-msg-card';

  const time = new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  card.innerHTML = `
    <div class="task-card-header">
      <span class="badge chat">chat</span>
      <span style="font-size:11px;color:var(--text-muted);">${escapeHtml(time)}</span>
    </div>
    <div style="font-size:12px;font-weight:600;color:var(--primary);margin-bottom:2px;">${escapeHtml(msg.sender)}</div>
    <div class="prompt-preview" style="white-space:pre-wrap;">${escapeHtml(msg.text)}</div>
  `;
  return card;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
