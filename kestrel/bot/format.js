import { pipsToPercent, quoteByAddress, shortAddr } from '../core/ascend.js';
import { escapeHtml } from './telegram.js';

const ICON = { good: '✅', info: 'ℹ️', warn: '⚠️', bad: '🚩' };
const LEVEL_ICON = { low: '🟢', medium: '🟡', high: '🔴' };

/** Telegram HTML card for one launch. */
export function formatCard(l, a, lang = 'id') {
  const pair = quoteByAddress(l.quote)?.label || '?';
  const lines = [
    `${LEVEL_ICON[a.level]} <b>${escapeHtml(l.name)}</b> ($${escapeHtml(l.symbol)}) · ${pair}`,
    `<b>${escapeHtml(a.label[lang])}</b> (score ${a.score})`,
    '',
    escapeHtml(a.summary[lang]),
    '',
    ...a.flags.map((f) => `${ICON[f.tone]} ${escapeHtml(f[lang])}`),
    '',
    `Fee: ${pipsToPercent(l.fee)}%${l.builderFee ? ` + ${pipsToPercent(l.builderFee)}% builder` : ''}`,
    `Token: <code>${escapeHtml(l.token)}</code>`,
  ];
  if (l.recipient) lines.push(`${lang === 'id' ? 'Penerima fee' : 'Fee recipient'}: <code>${escapeHtml(shortAddr(l.recipient))}</code>`);
  lines.push('', `<i>${lang === 'id'
    ? 'Analisis otomatis dari data on-chain. Bukan saran keuangan.'
    : 'Automated analysis of on-chain data. Not financial advice.'}</i>`);
  return lines.join('\n');
}
