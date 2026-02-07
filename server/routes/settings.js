import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/** Path to the .env file in the user's working directory. */
const ENV_PATH = join(process.cwd(), '.env');

/**
 * Settings schema — defines every user-configurable setting.
 *
 * Field types:
 *   'secret'  — value is masked in GET responses; only written when non-empty
 *   'text'    — plain text input
 *   'select'  — dropdown; requires an `options` array of { value, label }
 *
 * Set `restart: true` if changing the value requires a server restart.
 */
const SETTINGS_SCHEMA = [
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', type: 'secret', restart: false },
  { key: 'CLAUDE_MODEL',      label: 'Claude Model',       type: 'select', restart: false, options: [
    { value: '',                            label: 'Default — let SDK choose' },
    { value: 'claude-opus-4-6',             label: 'Claude Opus 4.6' },
    { value: 'claude-sonnet-4-5-20250929',  label: 'Claude Sonnet 4.5' },
    { value: 'claude-haiku-4-5-20251001',   label: 'Claude Haiku 4.5' },
  ]},
  { key: 'LIVEKIT_API_KEY',   label: 'LiveKit API Key',    type: 'secret', restart: false },
  { key: 'LIVEKIT_API_SECRET', label: 'LiveKit API Secret', type: 'secret', restart: false },
  { key: 'LIVEKIT_WS_URL',   label: 'LiveKit WebSocket URL', type: 'text', restart: false },
  { key: 'PORT',              label: 'Server Port',        type: 'text',   restart: true },
];

/** Set of permitted setting keys — rejects unknown keys on POST. */
const ALLOWED_KEYS = new Set(SETTINGS_SCHEMA.map(s => s.key));

/**
 * Mask a secret value, showing only the last 4 characters.
 * Returns an empty string if the value is falsy.
 */
function maskSecret(value) {
  if (!value || value.length < 4) return value ? '****' : '';
  return '****' + value.slice(-4);
}

/** Read the raw contents of the .env file (returns '' if missing). */
function readEnvFile() {
  if (!existsSync(ENV_PATH)) return '';
  return readFileSync(ENV_PATH, 'utf-8');
}

/**
 * Parse a .env file's contents into a key–value map.
 * Skips blank lines and comments (lines starting with #).
 */
function parseEnvValues(content) {
  const values = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    values[key] = val;
  }
  return values;
}

/**
 * Merge `updates` into the .env file.
 *
 * Existing keys are updated in-place to preserve ordering and comments.
 * New keys are appended at the end.
 */
function updateEnvFile(updates) {
  const content = readEnvFile();
  const lines = content.split('\n');
  const written = new Set();

  // Update existing lines
  const updated = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return line;
    const key = trimmed.slice(0, eqIdx).trim();
    if (key in updates) {
      written.add(key);
      return `${key}=${updates[key]}`;
    }
    return line;
  });

  // Append new keys not already in file
  for (const [key, val] of Object.entries(updates)) {
    if (!written.has(key)) {
      updated.push(`${key}=${val}`);
    }
  }

  // Ensure trailing newline
  const result = updated.join('\n').replace(/\n*$/, '\n');
  writeFileSync(ENV_PATH, result, 'utf-8');
}

const router = Router();

/**
 * GET /api/settings
 *
 * Returns the full settings schema with current values.
 * Secret values are masked (last 4 chars only).
 */
router.get('/', (_req, res) => {
  const envContent = readEnvFile();
  const values = parseEnvValues(envContent);

  const settings = SETTINGS_SCHEMA.map(field => ({
    ...field,
    value: field.type === 'secret'
      ? maskSecret(values[field.key] || process.env[field.key] || '')
      : (values[field.key] ?? process.env[field.key] ?? ''),
  }));

  res.json({ settings });
});

/**
 * POST /api/settings
 *
 * Accepts a JSON object of { key: value } pairs.
 * Only keys present in SETTINGS_SCHEMA are written.
 * Updates both the .env file and process.env in-memory.
 * Returns { ok, restartNeeded }.
 */
router.post('/', (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Expected object body' });
  }

  // Filter to allowed keys only, skip empty strings (unchanged secrets)
  const filtered = {};
  let restartNeeded = false;

  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (typeof value !== 'string') continue;
    filtered[key] = value;
    process.env[key] = value;

    const field = SETTINGS_SCHEMA.find(s => s.key === key);
    if (field?.restart) restartNeeded = true;
  }

  if (Object.keys(filtered).length > 0) {
    updateEnvFile(filtered);
  }

  res.json({ ok: true, restartNeeded });
});

export default router;
