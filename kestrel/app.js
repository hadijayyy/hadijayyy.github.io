import { analyzeLaunch } from './core/analyze.js';
import { pipsToPercent, quoteByAddress, shortAddr } from './core/ascend.js';
import { isAddress } from './core/parse.js';
import { SAMPLE_LAUNCHES } from './core/sample.js';
import { I18N } from './i18n.js';

// Set to the bot's t.me link once it is running, e.g. 'https://t.me/YourKestrelBot'.
const BOT_URL = '';

const $ = (id) => document.getElementById(id);
const state = {
  lang: 'en', // the site is English-only; i18n.js keeps the Indonesian copy for later
  launches: SAMPLE_LAUNCHES,
  demo: true,
  reader: null,
  error: null,
};
const t = (k) => I18N[k]?.[state.lang] ?? k;

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text; // creator-supplied text is never parsed as HTML
  return n;
}

function age(sec) {
  const d = Math.max(0, Math.floor(Date.now() / 1000) - sec);
  if (d < 3600) return `${Math.max(1, Math.floor(d / 60))}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
}

function card(l, isExample) {
  const a = analyzeLaunch(l);
  const c = el('article', `card ${a.level}`);
  const head = el('div', 'card-head');
  const title = el('div');
  title.append(el('h3', '', l.name || l.symbol), el('span', 'ticker', `$${l.symbol}`));
  if (isExample) title.append(el('span', 'tag', t('example')));
  head.append(title, el('span', `badge ${a.level}`, a.label[state.lang]));
  c.append(head);

  const stats = el('dl', 'stats');
  const stat = (k, v) => { stats.append(el('dt', '', k), el('dd', '', v)); };
  stat(t('fee'), `${a.totalFeePercent}%`);
  stat('Pair', quoteByAddress(l.quote)?.label || '?');
  stat(t('devbuy'), `${a.devBuyPercent}%`);
  if (l.launchedAt) stat(t('age'), age(l.launchedAt));
  c.append(stats);

  c.append(el('p', 'summary', a.summary[state.lang]));
  const ul = el('ul', 'flags');
  for (const f of a.flags) ul.append(el('li', f.tone, f[state.lang]));
  c.append(ul);

  const foot = el('p', 'addr', `${shortAddr(l.token)}${l.builderFee ? ` · builder +${pipsToPercent(l.builderFee)}%` : ''}`);
  foot.title = l.token;
  c.append(foot);
  return c;
}

function render() {
  document.documentElement.lang = state.lang;
  for (const n of document.querySelectorAll('[data-i18n]')) n.textContent = t(n.dataset.i18n);

  $('feat-card').replaceChildren(card(SAMPLE_LAUNCHES[1], true));

  const box = $('cards');
  box.replaceChildren(...state.launches.map((l) => card(l, state.demo)));
  if (!state.launches.length) box.append(el('p', 'status', t('none')));

  const status = $('status');
  if (state.error) status.textContent = state.error;
  else if (!status.dataset.busy) status.textContent = state.demo ? t('demo') : t('live');

  const cta = $('bot-cta');
  if (BOT_URL) {
    cta.href = BOT_URL;
    $('bot-status').hidden = true;
  } else {
    cta.classList.add('disabled');
    cta.setAttribute('aria-disabled', 'true');
  }
}

async function loadLive(rpcUrl) {
  const status = $('status');
  state.error = null;
  status.dataset.busy = '1';
  status.textContent = t('loading');
  try {
    const viem = await import('https://esm.sh/viem@2.57.17');
    const { createReader } = await import('./core/reader.js');
    const reader = createReader({ viem, rpcUrl });
    await reader.assertMainnet();
    state.reader = reader;
    state.launches = await reader.latestLaunches(12);
    state.demo = false;
    localStorage.setItem('kestrel.rpc', rpcUrl);
  } catch (e) {
    state.error = `Error: ${e.shortMessage || e.message}`;
  } finally {
    delete status.dataset.busy;
    render();
  }
}

$('bot-cta').addEventListener('click', (e) => {
  if (!BOT_URL) e.preventDefault();
});

$('rpc-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const url = $('rpc').value.trim();
  if (url) loadLive(url);
});

$('scan-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const addr = $('scan').value.trim();
  const status = $('status');
  state.error = null;
  if (!isAddress(addr)) { status.textContent = t('badAddr'); return; }
  const local = state.launches.find((l) => l.token.toLowerCase() === addr.toLowerCase());
  if (local) { $('cards').replaceChildren(card(local, state.demo)); return; }
  if (!state.reader) { status.textContent = t('needRpc'); return; }
  status.textContent = t('loading');
  try {
    const l = await state.reader.launchByToken(addr);
    if (!l) { status.textContent = t('notAscend'); return; }
    status.textContent = '';
    $('cards').replaceChildren(card(l, false));
  } catch (err) {
    status.textContent = `Error: ${err.shortMessage || err.message}`;
  }
});

// Show the floating CTA only once the hero button has scrolled away,
// and hide it again while the pricing card is on screen.
const float = document.querySelector('.float-cta');
const visible = new Set();
const io = new IntersectionObserver((entries) => {
  for (const e of entries) (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
  float.classList.toggle('hide', visible.size > 0);
});
io.observe(document.querySelector('.hero > .btn'));
io.observe($('start'));

const saved = localStorage.getItem('kestrel.rpc');
render();
if (saved) { $('rpc').value = saved; loadLive(saved); }
