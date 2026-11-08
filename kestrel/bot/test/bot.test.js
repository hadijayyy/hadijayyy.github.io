import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { decodeFunctionData, encodeFunctionData, parseAbi } from 'viem';
import { ABI_STRINGS, QUOTES, ZERO_ADDRESS } from '../../core/ascend.js';
import { parseLaunchCommand } from '../../core/parse.js';
import { loadConfig } from '../config.js';
import { formatCard } from '../format.js';
import { analyzeLaunch } from '../../core/analyze.js';
import { buildLaunchArgs } from '../launcher.js';
import { Store } from '../store.js';
import { SAMPLE_LAUNCHES } from '../../core/sample.js';

const abi = parseAbi(ABI_STRINGS);
const wallet = '0x1111111111111111111111111111111111111111';
const builder = '0x9999999999999999999999999999999999999999';
const salt = '0x' + 'ab'.repeat(32);

test('launchChecked calldata encodes and round-trips', () => {
  const parsed = parseLaunchCommand('/launch KOPI Kopi Nusantara fee=2 pair=HYPE');
  const { p, r } = buildLaunchArgs({ parsed, wallet, builder, builderFeePips: 5000, salt });
  const data = encodeFunctionData({ abi, functionName: 'launchChecked', args: [p, r, ZERO_ADDRESS, -100] });
  const { args } = decodeFunctionData({ abi, data });
  assert.equal(args[0].symbol, 'KOPI');
  assert.equal(args[0].quote, QUOTES.HYPE.address);
  assert.equal(args[0].fee, 20_000);
  assert.equal(args[0].builderFee, 5000);
  assert.equal(args[0].devBuyQuote, 0n);
  assert.equal(args[0].creator, ZERO_ADDRESS);
  assert.equal(args[1].recipient, wallet);
  assert.equal(args[1].builder, builder);
  assert.equal(args[1].cto, true);
});

test('no builder means zero builder fee and zero builder address', () => {
  const parsed = parseLaunchCommand('/launch KOPI Kopi');
  const { p, r } = buildLaunchArgs({ parsed, wallet, builder: null, builderFeePips: 5000, salt });
  assert.equal(p.builderFee, 0);
  assert.equal(r.builder, ZERO_ADDRESS);
});

test('config: dry run by default, validates', () => {
  const { cfg, errors } = loadConfig({ TELEGRAM_BOT_TOKEN: 't', ELYSIUM_RPC_URL: 'http://x' });
  assert.deepEqual(errors, []);
  assert.equal(cfg.dryRun, true);
  assert.equal(cfg.builderFeePercent, 0.5);
  assert.equal(loadConfig({}).errors.length, 2);
  assert.equal(loadConfig({ TELEGRAM_BOT_TOKEN: 't', ELYSIUM_RPC_URL: 'x', BUILDER_FEE_PERCENT: '5' }).cfg.builderFeePercent, 1);
});

test('store: per-user cooldown and global hourly cap', () => {
  const s = new Store(join(mkdtempSync(join(tmpdir(), 'kestrel-')), 'd.json'));
  const lim = { cooldownHours: 24, maxPerHour: 2 };
  const t0 = 1_000_000_000_000;
  assert.equal(s.launchWait('a', lim, t0), null);
  s.recordLaunch('a', 'A', '0x', t0);
  assert.ok(s.launchWait('a', lim, t0 + 1000) > 0);
  assert.equal(s.launchWait('b', lim, t0 + 1000), null);
  s.recordLaunch('b', 'B', '0x', t0 + 1000);
  assert.ok(s.launchWait('c', lim, t0 + 2000) > 0); // global cap hit
  assert.equal(s.launchWait('c', lim, t0 + 3_600_001), null);
  assert.equal(new Store(s.file).data.launches.length, 2); // persisted
});

test('card escapes creator-supplied text', () => {
  const l = { ...SAMPLE_LAUNCHES[0], name: '<b>evil</b>' };
  const html = formatCard(l, analyzeLaunch(l), 'en');
  assert.ok(!html.includes('<b>evil</b>'));
  assert.ok(html.includes('&lt;b&gt;evil&lt;/b&gt;'));
});
