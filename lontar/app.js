import { analyzeLaunch } from './core/analyze.js';
import { pipsToPercent, quoteByAddress, shortAddr } from './core/ascend.js';
import { isAddress } from './core/parse.js';
import { SAMPLE_LAUNCHES } from './core/sample.js';

const $ = (id) => document.getElementById(id);
const state = {
  lang: localStorage.getItem('lontar.lang') || (navigator.language?.startsWith('id') ? 'id' : 'en'),
  launches: SAMPLE_LAUNCHES,
  demo: true,
  reader: null,
};

const TXT = {
  demo: { en: 'Showing example coins (not real). Paste an Elysium RPC URL to load live launches.', id: 'Menampilkan koin contoh (bukan asli). Tempel URL RPC Elysium untuk memuat launch asli.' },
  loading: { en: 'Loading launches from Elysium…', id: 'Memuat launch dari Elysium…' },
  live: { en: 'Live from Elysium mainnet.', id: 'Data live dari mainnet Elysium.' },
  none: { en: 'No launches found yet.', id: 'Belum ada launch.' },
  badAddr: { en: 'Enter a valid 0x address.', id: 'Masukkan alamat 0x yang valid.' },
  needRpc: { en: 'Load live data first (RPC URL), then scan.', id: 'Muat data live dulu (URL RPC), lalu scan.' },
  notAscend: { en: 'That address is not an Ascend launch.', id: 'Alamat itu bukan koin hasil launch Ascend.' },
  example: { en: 'Example', id: 'Contoh' },
  fee: { en: 'Fee', id: 'Fee' },
  devbuy: { en: 'Dev buy', id: 'Dev buy' },
  ago: { en: 'ago', id: 'lalu' },
};
const t = (k) => TXT[k][state.lang];

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

function card(l) {
  const a = analyzeLaunch(l);
  const c = el('article', `card ${a.level}`);
  const head = el('div', 'card-head');
  const title = el('div');
  title.append(el('h3', '', l.name || l.symbol), el('span', 'ticker', `$${l.symbol}`));
  if (state.demo) title.append(el('span', 'tag', t('example')));
  head.append(title, el('span', `badge ${a.level}`, a.label[state.lang]));
  c.append(head);

  const stats = el('dl', 'stats');
  const stat = (k, v) => { stats.append(el('dt', '', k), el('dd', '', v)); };
  stat(t('fee'), `${a.totalFeePercent}%`);
  stat('Pair', quoteByAddress(l.quote)?.label || '?');
  stat(t('devbuy'), `${a.devBuyPercent}%`);
  if (l.launchedAt) stat('Age', `${age(l.launchedAt)} ${t('ago')}`);
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
  $('lang').textContent = state.lang === 'en' ? 'ID' : 'EN';
  for (const n of document.querySelectorAll('[data-en]')) n.textContent = n.dataset[state.lang];
  const box = $('cards');
  box.replaceChildren(...state.launches.map(card));
  if (!state.launches.length) box.append(el('p', 'status', t('none')));
  if (state.error) $('status').textContent = state.error;
  else if (state.demo && !$('status').dataset.busy) $('status').textContent = t('demo');
}

async function loadLive(rpcUrl) {
  const status = $('status');
  status.dataset.busy = '1';
  state.error = null;
  status.textContent = t('loading');
  try {
    const viem = await import('https://esm.sh/viem@2.57.17');
    const { createReader } = await import('./core/reader.js');
    const reader = createReader({ viem, rpcUrl });
    await reader.assertMainnet();
    state.reader = reader;
    state.launches = await state.reader.latestLaunches(12);
    state.demo = false;
    localStorage.setItem('lontar.rpc', rpcUrl);
    status.textContent = t('live');
  } catch (e) {
    state.error = `Error: ${e.shortMessage || e.message}`;
  } finally {
    delete status.dataset.busy;
    render();
  }
}

$('lang').addEventListener('click', () => {
  state.lang = state.lang === 'en' ? 'id' : 'en';
  localStorage.setItem('lontar.lang', state.lang);
  render();
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
  if (!isAddress(addr)) { status.textContent = t('badAddr'); return; }
  const local = state.launches.find((l) => l.token.toLowerCase() === addr.toLowerCase());
  if (local) { $('cards').replaceChildren(card(local)); return; }
  if (!state.reader) { status.textContent = t('needRpc'); return; }
  status.textContent = t('loading');
  try {
    const l = await state.reader.launchByToken(addr);
    if (!l) { status.textContent = t('notAscend'); return; }
    status.textContent = '';
    $('cards').replaceChildren(card(l));
  } catch (err) {
    status.textContent = `Error: ${err.shortMessage || err.message}`;
  }
});

const saved = localStorage.getItem('lontar.rpc');
render();
if (saved) { $('rpc').value = saved; loadLive(saved); }
