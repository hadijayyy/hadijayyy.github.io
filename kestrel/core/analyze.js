// Turns a decoded Ascend launch into a plain-language "economics card":
// a risk score, flags, and a short summary in English and Bahasa Indonesia.
// Rule-based and deterministic, so every flag can be traced to an on-chain value.

import { STANDARD_SUPPLY, ZERO_ADDRESS, pipsToPercent, quoteByAddress } from './ascend.js';

// Tickers of well-known assets. A new coin using one of these is a red flag.
export const PROTECTED_TICKERS = new Set([
  'BTC', 'WBTC', 'ETH', 'WETH', 'HYPE', 'WHYPE', 'KHYPE', 'KNTQ', 'USDC', 'USDT', 'USDE',
  'DAI', 'SOL', 'BNB', 'XRP', 'PURR', 'ASCEND', 'ELYSIUM', 'KINETIQ',
]);

const LEVELS = [
  { min: 40, level: 'high', en: 'High risk', id: 'Risiko tinggi' },
  { min: 20, level: 'medium', en: 'Medium risk', id: 'Risiko sedang' },
  { min: 0, level: 'low', en: 'Low risk', id: 'Risiko rendah' },
];

function lower(a) {
  return String(a || '').toLowerCase();
}

function fmtPct(n) {
  if (n > 0 && n < 0.01) return 'under 0.01%';
  return `${Number(n.toFixed(2))}%`;
}

/** Share of the standard supply bought by the creator at launch, in percent. */
export function devBuyPercent(devBuyTokens) {
  const tokens = BigInt(devBuyTokens || 0);
  // basis points with 2 extra decimals of precision
  return Number((tokens * 1_000_000n) / STANDARD_SUPPLY) / 10_000;
}

/**
 * @param {object} l normalized launch:
 *   { symbol, name, quote, fee, builderFee, devBuyTokens, recipient, dev, builder, cto,
 *     seat: { holderBpsQuote, holderBpsToken, buybackBps, burnBought } | null, launchedAt }
 * @param {number} [nowSec] current unix time, for the age flag
 */
export function analyzeLaunch(l, nowSec = Math.floor(Date.now() / 1000)) {
  const flags = [];
  let score = 0;
  // Good signals are listed but never cancel out red flags.
  const add = (points, tone, en, id) => {
    score += Math.max(0, points);
    flags.push({ tone, en, id });
  };

  // 1. Ticker impersonation
  const sym = String(l.symbol || '').trim().replace(/^\$/, '').toUpperCase();
  if (PROTECTED_TICKERS.has(sym)) {
    add(40, 'bad', `Ticker "${sym}" copies a well-known asset. Likely a copycat.`,
      `Ticker "${sym}" meniru aset terkenal. Kemungkinan koin tiruan.`);
  }

  // 2. Dev buy: how much of the supply the creator bought before anyone else
  const dev = devBuyPercent(l.devBuyTokens);
  if (dev === 0) {
    add(0, 'good', 'No dev buy: the creator did not pre-buy any supply.',
      'Tanpa dev buy: pembuat koin tidak membeli duluan.');
  } else if (dev <= 2) {
    add(0, 'info', `Creator bought ${fmtPct(dev)} of supply at launch.`,
      `Pembuat koin membeli ${fmtPct(dev)} suplai saat launch.`);
  } else if (dev <= 5) {
    add(20, 'warn', `Creator bought ${fmtPct(dev)} of supply at launch. Watch for selling.`,
      `Pembuat koin membeli ${fmtPct(dev)} suplai saat launch. Waspadai aksi jual.`);
  } else if (dev <= 15) {
    add(30, 'bad', `Creator holds ${fmtPct(dev)} of supply from the dev buy. Big dump risk.`,
      `Pembuat koin memegang ${fmtPct(dev)} suplai dari dev buy. Risiko dijual besar-besaran.`);
  } else {
    add(50, 'bad', `Creator holds ${fmtPct(dev)} of supply from the dev buy. Very concentrated.`,
      `Pembuat koin memegang ${fmtPct(dev)} suplai dari dev buy. Sangat terpusat.`);
  }

  // 3. Trading fee (creator fee + optional builder fee), paid on every buy and sell
  const totalFee = pipsToPercent(Number(l.fee || 0) + Number(l.builderFee || 0));
  if (totalFee > 5) {
    add(15, 'warn', `Expensive to trade: ${fmtPct(totalFee)} fee on every buy and sell.`,
      `Mahal untuk trading: fee ${fmtPct(totalFee)} setiap beli dan jual.`);
  } else if (totalFee > 3) {
    add(5, 'info', `Above-average fee: ${fmtPct(totalFee)} on every buy and sell.`,
      `Fee di atas rata-rata: ${fmtPct(totalFee)} setiap beli dan jual.`);
  } else {
    add(0, 'info', `Trading fee: ${fmtPct(totalFee)} on every buy and sell.`,
      `Fee trading: ${fmtPct(totalFee)} setiap beli dan jual.`);
  }

  // 4. Where the creator's share of fees goes
  const seat = l.seat;
  const holderBps = seat ? Math.max(Number(seat.holderBpsQuote || 0), Number(seat.holderBpsToken || 0)) : 0;
  const buybackBps = seat ? Number(seat.buybackBps || 0) : 0;
  if (holderBps > 0 || buybackBps > 0) {
    const parts = [];
    const partsId = [];
    if (holderBps > 0) {
      parts.push(`${fmtPct(holderBps / 100)} to holders`);
      partsId.push(`${fmtPct(holderBps / 100)} ke holder`);
    }
    if (buybackBps > 0) {
      const burn = seat.burnBought ? ' (burned)' : '';
      const burnId = seat.burnBought ? ' (dibakar)' : '';
      parts.push(`${fmtPct(buybackBps / 100)} to buybacks${burn}`);
      partsId.push(`${fmtPct(buybackBps / 100)} untuk buyback${burnId}`);
    }
    add(0, 'good', `Creator fees are shared: ${parts.join(', ')}.`,
      `Fee pembuat dibagi: ${partsId.join(', ')}.`);
  } else if (dev >= 0.5 && l.recipient && lower(l.recipient) === lower(l.dev)) {
    // dust dev buys (< 0.5%) are common and harmless, so they don't trigger this
    add(10, 'warn', 'All creator fees go to the same wallet that did the dev buy.',
      'Semua fee pembuat masuk ke wallet yang sama dengan pelaku dev buy.');
  } else {
    add(0, 'info', 'Creator fees go to the creator\'s wallet (no holder rewards or buybacks).',
      'Fee pembuat masuk ke wallet pembuat (tanpa reward holder atau buyback).');
  }

  // 5. Community takeover opt-in
  if (l.cto === false) {
    add(10, 'warn', 'No community takeover: if the creator abandons it, holders cannot take over the fees.',
      'Tanpa community takeover: kalau pembuat kabur, holder tidak bisa mengambil alih fee.');
  } else if (l.cto === true) {
    add(0, 'good', 'Community takeover allowed if the creator abandons the coin.',
      'Komunitas bisa mengambil alih kalau pembuat meninggalkan koin.');
  }

  // 6. Launched through a third-party builder
  if (l.builder && lower(l.builder) !== ZERO_ADDRESS && Number(l.builderFee || 0) > 0) {
    add(0, 'info', `Launched through an approved builder app (+${fmtPct(pipsToPercent(l.builderFee))} builder fee).`,
      `Diluncurkan lewat aplikasi builder resmi (+${fmtPct(pipsToPercent(l.builderFee))} fee builder).`);
  }

  // 7. Age
  if (l.launchedAt && nowSec - Number(l.launchedAt) < 3600) {
    add(5, 'info', 'Brand new: launched less than an hour ago.',
      'Baru sekali: diluncurkan kurang dari 1 jam lalu.');
  }

  const lvl = LEVELS.find((x) => score >= x.min);
  const pair = quoteByAddress(l.quote)?.label || 'unknown pair';
  const worst = flags.find((f) => f.tone === 'bad') || flags.find((f) => f.tone === 'warn');
  const best = flags.find((f) => f.tone === 'good');

  const summaryEn = [
    `${lvl.en}. ${l.name || sym} ($${sym}) trades against ${pair} with a ${fmtPct(totalFee)} fee.`,
    worst ? `Main concern: ${worst.en}` : 'No major red flags in the launch settings.',
    best ? `Plus: ${best.en}` : '',
  ].filter(Boolean).join(' ');

  const summaryId = [
    `${lvl.id}. ${l.name || sym} ($${sym}) diperdagangkan dengan ${pair}, fee ${fmtPct(totalFee)}.`,
    worst ? `Perhatian utama: ${worst.id}` : 'Tidak ada tanda bahaya besar di pengaturan launch.',
    best ? `Nilai plus: ${best.id}` : '',
  ].filter(Boolean).join(' ');

  return {
    score,
    level: lvl.level,
    label: { en: lvl.en, id: lvl.id },
    totalFeePercent: totalFee,
    devBuyPercent: dev,
    flags,
    summary: { en: summaryEn, id: summaryId },
  };
}
