// Example launches for demo mode, shown when no Elysium RPC is configured.
// These are FICTIONAL coins with made-up addresses, labeled as examples in the UI.

const now = Math.floor(Date.now() / 1000);
const fake = (n) => `0x${String(n).repeat(40).slice(0, 40)}`;
const SUPPLY = 10n ** 27n;
const pct = (p) => ((SUPPLY * BigInt(Math.round(p * 100))) / 10_000n).toString();

export const SAMPLE_LAUNCHES = [
  {
    token: fake(1), poolId: `0x${'a1'.repeat(32)}`, name: 'Kopi Nusantara', symbol: 'KOPI',
    quote: '0xb47c4C8F73F009CC0C0d3f92B388d13E293F0B65', fee: 20_000, builderFee: 5_000,
    devBuyTokens: '0', recipient: fake(2), dev: fake(2), builder: fake(9), cto: true,
    seat: { holderBpsQuote: 4000, holderBpsToken: 0, buybackBps: 3000, burnBought: true },
    launchedAt: now - 1200,
  },
  {
    token: fake(3), poolId: `0x${'b2'.repeat(32)}`, name: 'Garuda Pixel', symbol: 'GPIX',
    quote: '0xbA876237B0F021A6c6D852d6c26E107997cC5E81', fee: 30_000, builderFee: 0,
    devBuyTokens: pct(3.5), recipient: fake(4), dev: fake(5), builder: null, cto: true, seat: null,
    launchedAt: now - 7200,
  },
  {
    token: fake(6), poolId: `0x${'c3'.repeat(32)}`, name: 'Hyper Moon', symbol: 'HYPE',
    quote: '0xbA876237B0F021A6c6D852d6c26E107997cC5E81', fee: 80_000, builderFee: 0,
    devBuyTokens: pct(18), recipient: fake(7), dev: fake(7), builder: null, cto: false, seat: null,
    launchedAt: now - 300,
  },
];
