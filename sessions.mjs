// Lecture des conversations Claude Code déjà présentes sur le PC
// (~/.claude/projects/<dossier encodé>/<sessionId>.jsonl), celles que l'app
// Claude affiche dans sa barre latérale. Les fichiers peuvent peser des
// centaines de Mo : on ne lit que le début (dossier de travail) et la fin
// (titre, dernier message).

import { openSync, readSync, closeSync, fstatSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { homedir } from 'node:os';

const PROJECTS_DIR = join(homedir(), '.claude', 'projects');

function readSlice(path, fromEnd, bytes) {
  const fd = openSync(path, 'r');
  try {
    const size = fstatSync(fd).size;
    const len = Math.min(bytes, size);
    const buf = Buffer.alloc(len);
    readSync(fd, buf, 0, len, fromEnd ? size - len : 0);
    return buf.toString('utf8');
  } finally {
    closeSync(fd);
  }
}

function parseLines(text) {
  const out = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith('{')) continue; // ligne coupée par la lecture partielle
    try { out.push(JSON.parse(line)); } catch {}
  }
  return out;
}

function textOf(message) {
  const c = message?.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  return '';
}

// Le nom du dossier qui contient le .jsonl est le dossier du projet encodé
// (tout ce qui n'est pas alphanumérique devient « - »). C'est ce dossier-là
// qu'il faut utiliser pour reprendre la conversation, même si Claude s'est
// déplacé dans un sous-dossier ou si l'app a déplacé la session.
const encodeCwd = (cwd) => cwd.replace(/[^a-zA-Z0-9]/g, '-');

export function readSession(path) {
  const projectKey = basename(dirname(path));
  const cwds = [];
  let entrypoint = null;
  for (const o of parseLines(readSlice(path, false, 256 * 1024))) {
    if (o.cwd && !cwds.length) entrypoint = o.entrypoint;
    if (o.cwd) cwds.push(o.cwd);
  }

  let title = null;
  let lastPrompt = null;
  let lastAnswer = null;
  const tail = parseLines(readSlice(path, true, 2 * 1024 * 1024));
  for (const o of tail) if (o.cwd) cwds.push(o.cwd);
  if (!cwds.length) return null;
  const cwd = cwds.find((c) => encodeCwd(c) === projectKey) || cwds[0];

  for (const o of tail) {
    if (o.type === 'custom-title' && o.customTitle) title = o.customTitle;
    else if (o.type === 'ai-title' && o.aiTitle && !title) title = o.aiTitle;
    else if (o.type === 'summary' && o.summary && !title) title = o.summary;
    else if (o.type === 'last-prompt' && o.lastPrompt) lastPrompt = o.lastPrompt;
    else if (o.type === 'assistant' && !o.isSidechain) {
      const t = textOf(o.message).trim();
      if (t) lastAnswer = t;
    }
  }

  return {
    sessionId: basename(path, '.jsonl'),
    cwd,
    entrypoint,
    title: title || (lastPrompt ? lastPrompt.slice(0, 60) : null) || 'conversation',
    appTitle: title, // titre donné par l'app (null s'il n'y en a pas)
    lastPrompt,
    lastAnswer,
    updatedAt: statSync(path).mtimeMs,
  };
}

// Conversations les plus récentes en premier, uniquement celles dont le dossier
// existe encore (les dossiers temporaires « sans dossier » de l'app disparaissent).
export function listSessions({ limit = 20, skip = new Set() } = {}) {
  if (!existsSync(PROJECTS_DIR)) return [];
  const files = [];
  for (const dir of readdirSync(PROJECTS_DIR)) {
    const full = join(PROJECTS_DIR, dir);
    let entries;
    try { entries = readdirSync(full); } catch { continue; }
    for (const f of entries) {
      if (!f.endsWith('.jsonl') || skip.has(basename(f, '.jsonl'))) continue;
      const p = join(full, f);
      files.push({ p, mtime: statSync(p).mtimeMs });
    }
  }
  files.sort((a, b) => b.mtime - a.mtime);

  const sessions = [];
  for (const { p } of files) {
    if (sessions.length >= limit) break;
    let s;
    try { s = readSession(p); } catch { continue; }
    if (!s || !existsSync(s.cwd)) continue;
    if (s.entrypoint === 'sdk-cli') continue; // lancées en `claude -p` (scripts, le pont lui-même)
    sessions.push(s);
  }
  return sessions;
}

// Fichier .jsonl d'une conversation (l'app peut l'avoir déplacé d'un projet à l'autre).
export function findSessionFile(sessionId) {
  if (!existsSync(PROJECTS_DIR)) return null;
  let best = null;
  for (const dir of readdirSync(PROJECTS_DIR)) {
    const p = join(PROJECTS_DIR, dir, `${sessionId}.jsonl`);
    if (existsSync(p) && (!best || statSync(p).mtimeMs > statSync(best).mtimeMs)) best = p;
  }
  return best;
}

// Texte tapé par l'utilisateur, sans les rappels système que l'app glisse
// dans le message ; null pour les retours d'outils et les messages internes.
function promptText(message) {
  const c = message?.content;
  if (Array.isArray(c) && c.some((b) => b.type === 'tool_result')) return null;
  const t = textOf(message).replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '').trim();
  if (!t || /^<[\w-]+>[\s\S]*<\/[\w-]+>$/.test(t) || t.startsWith('[Request interrupted')) return null;
  return t;
}

// Échanges (ta demande + la réponse finale de Claude) terminés après sinceMs,
// lus dans la fin du fichier. Le dernier échange est ignoré s'il est sans doute
// encore en cours (fichier modifié il y a moins de 2 min).
export function readExchanges(path, sinceMs = 0) {
  const exchanges = [];
  let cur = null;
  for (const o of parseLines(readSlice(path, true, 8 * 1024 * 1024))) {
    if (o.isSidechain) continue;
    const at = Date.parse(o.timestamp || '') || 0;
    if (o.type === 'user' && !o.isMeta) {
      const prompt = promptText(o.message);
      if (prompt) {
        cur = { prompt, answer: null, at, fromDiscord: o.entrypoint === 'sdk-cli' };
        exchanges.push(cur);
        continue;
      }
    }
    if (o.type === 'assistant' && cur) {
      const t = textOf(o.message).trim();
      if (t) { cur.answer = t; cur.at = at; }
    }
  }
  if (Date.now() - statSync(path).mtimeMs < 2 * 60_000) exchanges.pop();
  // Les échanges lancés par le pont (claude -p) sont déjà dans Discord.
  return exchanges.filter((e) => e.answer && !e.fromDiscord && e.at > sinceMs);
}
