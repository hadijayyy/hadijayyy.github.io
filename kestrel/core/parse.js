// Parses and validates the Telegram launch command:
//   /launch KOPI Kopi Nusantara fee=2 pair=USDC cto=yes
// Stricter than Ascend's own limits on purpose, to keep spam and copycats out.

import { MAX_CREATOR_FEE_PIPS, MIN_CREATOR_FEE_PIPS, QUOTES, percentToPips } from './ascend.js';
import { PROTECTED_TICKERS } from './analyze.js';

export const DEFAULTS = { feePercent: 2, pair: 'USDC', cto: true };

const TICKER_RE = /^[A-Z0-9]{2,10}$/;
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export function isAddress(s) {
  return ADDRESS_RE.test(String(s || '').trim());
}

/**
 * @returns {{ok:true, symbol, name, feePercent, feePips, pair, cto} | {ok:false, error:{en,id}}}
 */
export function parseLaunchCommand(text) {
  const fail = (en, id) => ({ ok: false, error: { en, id } });
  const body = String(text || '').replace(/^\/launch(@\w+)?/i, '').trim();
  if (!body) {
    return fail('Usage: /launch TICKER Coin name [fee=2] [pair=USDC|HYPE|KNTQ] [cto=yes|no]',
      'Cara pakai: /launch TICKER Nama koin [fee=2] [pair=USDC|HYPE|KNTQ] [cto=yes|no]');
  }

  const tokens = body.split(/\s+/);
  const opts = {};
  const words = [];
  for (const t of tokens) {
    const m = t.match(/^(fee|pair|cto)=(.+)$/i);
    if (m) opts[m[1].toLowerCase()] = m[2];
    else words.push(t);
  }

  const symbol = String(words.shift() || '').replace(/^\$/, '').toUpperCase();
  const name = words.join(' ').trim();

  if (!TICKER_RE.test(symbol)) {
    return fail('Ticker must be 2-10 letters or digits (A-Z, 0-9).',
      'Ticker harus 2-10 huruf atau angka (A-Z, 0-9).');
  }
  if (PROTECTED_TICKERS.has(symbol)) {
    return fail(`Ticker ${symbol} belongs to a well-known asset and is blocked.`,
      `Ticker ${symbol} milik aset terkenal dan diblokir.`);
  }
  if (name.length < 2 || name.length > 40) {
    return fail('Coin name must be 2-40 characters.', 'Nama koin harus 2-40 karakter.');
  }
  // printable characters only: no control chars, no zero-width tricks
  if (/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2060-\u206f]/.test(name)) {
    return fail('Coin name contains hidden or control characters.',
      'Nama koin mengandung karakter tersembunyi.');
  }

  const feePercent = opts.fee === undefined ? DEFAULTS.feePercent : Number(String(opts.fee).replace('%', ''));
  const feePips = percentToPips(feePercent);
  if (!Number.isFinite(feePercent) || feePips < MIN_CREATOR_FEE_PIPS || feePips > MAX_CREATOR_FEE_PIPS) {
    return fail('Fee must be between 1 and 10 (percent).', 'Fee harus antara 1 sampai 10 (persen).');
  }

  const pair = String(opts.pair || DEFAULTS.pair).toUpperCase();
  if (!QUOTES[pair]) {
    return fail('Pair must be USDC, HYPE or KNTQ.', 'Pair harus USDC, HYPE, atau KNTQ.');
  }

  let cto = DEFAULTS.cto;
  if (opts.cto !== undefined) {
    const v = String(opts.cto).toLowerCase();
    if (['yes', 'y', 'ya', 'true', '1'].includes(v)) cto = true;
    else if (['no', 'n', 'tidak', 'false', '0'].includes(v)) cto = false;
    else return fail('cto must be yes or no.', 'cto harus yes atau no.');
  }

  return { ok: true, symbol, name, feePercent, feePips, pair, cto };
}
