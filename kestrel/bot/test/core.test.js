import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeLaunch, devBuyPercent } from '../../core/analyze.js';
import { QUOTES, STANDARD_SUPPLY } from '../../core/ascend.js';
import { parseLaunchCommand } from '../../core/parse.js';
import { SAMPLE_LAUNCHES } from '../../core/sample.js';

const pct = (p) => ((STANDARD_SUPPLY * BigInt(p * 100)) / 10_000n).toString();
const base = {
  name: 'Kopi', symbol: 'KOPI', quote: QUOTES.USDC.address, fee: 20_000, builderFee: 0,
  devBuyTokens: '0', recipient: '0x' + '2'.repeat(40), dev: '0x' + '2'.repeat(40), cto: true, seat: null,
  launchedAt: 0,
};

test('parse: defaults', () => {
  const r = parseLaunchCommand('/launch kopi Kopi Nusantara');
  assert.deepEqual(r, { ok: true, symbol: 'KOPI', name: 'Kopi Nusantara', feePercent: 2, feePips: 20_000, pair: 'USDC', cto: true });
});

test('parse: options, $ prefix and bot mention', () => {
  const r = parseLaunchCommand('/launch@KestrelBot $gpix Garuda Pixel fee=3.5% pair=hype cto=no');
  assert.equal(r.ok, true);
  assert.equal(r.symbol, 'GPIX');
  assert.equal(r.feePips, 35_000);
  assert.equal(r.pair, 'HYPE');
  assert.equal(r.cto, false);
});

test('parse: rejects bad input', () => {
  for (const bad of ['/launch', '/launch HYPE Fake Hype', '/launch K x', '/launch KOPI Kopi fee=0.5',
    '/launch KOPI Kopi fee=11', '/launch KOPI Kopi pair=ETH', '/launch KOPI Kopi cto=maybe',
    '/launch KO-PI Kopi', '/launch KOPI Ko​pi']) {
    const r = parseLaunchCommand(bad);
    assert.equal(r.ok, false, bad);
    assert.ok(r.error.en && r.error.id);
  }
});

test('devBuyPercent', () => {
  assert.equal(devBuyPercent('0'), 0);
  assert.equal(devBuyPercent(pct(3.5)), 3.5);
  assert.equal(devBuyPercent(STANDARD_SUPPLY.toString()), 100);
});

test('analyze: clean launch is low risk', () => {
  const a = analyzeLaunch(base, 10_000);
  assert.equal(a.level, 'low');
  assert.equal(a.totalFeePercent, 2);
  assert.match(a.summary.en, /Low risk/);
  assert.match(a.summary.id, /Risiko rendah/);
});

test('analyze: copycat ticker + big dev buy + high fee is high risk', () => {
  const a = analyzeLaunch({ ...base, symbol: 'HYPE', fee: 80_000, devBuyTokens: pct(18), cto: false }, 10_000);
  assert.equal(a.level, 'high');
  assert.ok(a.flags.some((f) => f.tone === 'bad' && /copies/.test(f.en)));
  assert.ok(a.flags.some((f) => /18%/.test(f.en)));
});

test('analyze: holder rewards and buybacks are a plus', () => {
  const a = analyzeLaunch({ ...base, seat: { holderBpsQuote: 4000, holderBpsToken: 0, buybackBps: 3000, burnBought: true } }, 10_000);
  const good = a.flags.find((f) => /shared/.test(f.en));
  assert.ok(good);
  assert.match(good.en, /40% to holders, 30% to buybacks \(burned\)/);
});

test('analyze: dev buy wallet also receives fees is flagged', () => {
  const a = analyzeLaunch({ ...base, devBuyTokens: pct(1) }, 10_000);
  assert.ok(a.flags.some((f) => /same wallet/.test(f.en)));
});

test('sample launches all analyze', () => {
  const levels = SAMPLE_LAUNCHES.map((l) => analyzeLaunch(l).level);
  assert.deepEqual(levels, ['low', 'medium', 'high']);
});
