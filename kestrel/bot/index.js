// Kestrel Telegram bot.
//   /launch TICKER Coin name [fee=2] [pair=USDC|HYPE|KNTQ] [cto=yes|no]
//   /wallet 0x...   set the wallet that receives your creator fees
//   /scan 0x...     economics card for any Ascend coin
//   /new            latest Ascend launches
//   /lang en|id

import * as viem from 'viem';
import { analyzeLaunch } from '../core/analyze.js';
import { pipsToPercent } from '../core/ascend.js';
import { isAddress, parseLaunchCommand } from '../core/parse.js';
import { createReader } from '../core/reader.js';
import { loadConfig } from './config.js';
import { formatCard } from './format.js';
import { createLauncher } from './launcher.js';
import { Store } from './store.js';
import { Telegram, escapeHtml } from './telegram.js';

const { cfg, errors } = loadConfig();
if (errors.length) {
  console.error(`Config error:\n- ${errors.join('\n- ')}\nSee .env.example`);
  process.exit(1);
}

const tg = new Telegram(cfg.telegramToken);
const store = new Store(cfg.dataFile);
const reader = createReader({ viem, rpcUrl: cfg.rpcUrl });
const launcher = createLauncher({ cfg, reader });
const PENDING_TTL_MS = 5 * 60_000;

const T = (u, en, id) => (u.lang === 'en' ? en : id);

function fmtWait(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.ceil((sec % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

const HELP = {
  en: [
    '<b>Kestrel</b>: launch and check coins on Ascend (Elysium).',
    '',
    '1. <code>/wallet 0xYourWallet</code>: where your creator fees go',
    '2. <code>/launch KOPI Kopi Nusantara fee=2 pair=USDC</code>',
    '3. <code>/scan 0xToken</code>: is this coin safe-looking?',
    '<code>/new</code>: latest launches · <code>/lang id</code>: Bahasa Indonesia',
    '',
    'Kestrel never asks for your private key and never holds your funds.',
  ].join('\n'),
  id: [
    '<b>Kestrel</b>: luncurkan dan cek koin di Ascend (Elysium).',
    '',
    '1. <code>/wallet 0xWalletKamu</code>: tujuan fee pembuat koin',
    '2. <code>/launch KOPI Kopi Nusantara fee=2 pair=USDC</code>',
    '3. <code>/scan 0xToken</code>: cek apakah koin ini aman',
    '<code>/new</code>: launch terbaru · <code>/lang en</code>: English',
    '',
    'Kestrel tidak pernah meminta private key dan tidak memegang dana kamu.',
  ].join('\n'),
};

async function onLaunch(chatId, userId, u, text) {
  if (!launcher.canLaunch) {
    return tg.send(chatId, T(u, 'Launching is not enabled on this bot yet.', 'Fitur launch belum aktif di bot ini.'));
  }
  if (!u.wallet) {
    return tg.send(chatId, T(u, 'Set your wallet first: <code>/wallet 0x...</code>', 'Atur wallet dulu: <code>/wallet 0x...</code>'));
  }
  const parsed = parseLaunchCommand(text);
  if (!parsed.ok) return tg.send(chatId, escapeHtml(parsed.error[u.lang]));

  const wait = store.launchWait(userId, cfg);
  if (wait) {
    return tg.send(chatId, T(u, `Please wait ${fmtWait(wait)} before your next launch.`, `Tunggu ${fmtWait(wait)} sebelum launch berikutnya.`));
  }

  u.pending = { parsed, at: Date.now() };
  store.save();
  const preview = [
    `<b>${T(u, 'Confirm launch', 'Konfirmasi launch')}</b>${cfg.dryRun ? ' (DRY RUN)' : ''}`,
    `${escapeHtml(parsed.name)} ($${parsed.symbol})`,
    `Pair: ${parsed.pair} · Fee: ${parsed.feePercent}%`,
    `${T(u, 'Community takeover', 'Community takeover')}: ${parsed.cto ? 'yes' : 'no'}`,
    `${T(u, 'Creator fees go to', 'Fee pembuat masuk ke')}: <code>${u.wallet}</code>`,
    '',
    T(u, 'No dev buy. Kestrel pays the gas.', 'Tanpa dev buy. Gas dibayar Kestrel.'),
  ].join('\n');
  return tg.send(chatId, preview, {
    reply_markup: {
      inline_keyboard: [[
        { text: T(u, '🚀 Launch', '🚀 Luncurkan'), callback_data: 'launch:yes' },
        { text: T(u, 'Cancel', 'Batal'), callback_data: 'launch:no' },
      ]],
    },
  });
}

async function onConfirm(chatId, userId, u) {
  const pending = u.pending;
  u.pending = null;
  store.save();
  if (!pending || Date.now() - pending.at > PENDING_TTL_MS) {
    return tg.send(chatId, T(u, 'That launch request expired. Send /launch again.', 'Permintaan launch kedaluwarsa. Kirim /launch lagi.'));
  }
  const wait = store.launchWait(userId, cfg);
  if (wait) return tg.send(chatId, T(u, `Please wait ${fmtWait(wait)}.`, `Tunggu ${fmtWait(wait)}.`));

  await tg.send(chatId, T(u, '⏳ Launching…', '⏳ Meluncurkan…'));
  try {
    const res = await launcher.launch(pending.parsed, u.wallet);
    if (res.dryRun) {
      return tg.send(chatId, [
        T(u, '✅ Simulation passed (dry run, nothing sent).', '✅ Simulasi berhasil (dry run, tidak ada transaksi).'),
        `Token: <code>${res.token}</code>`,
        `Builder fee: ${pipsToPercent(res.builderFeePips)}%`,
      ].join('\n'));
    }
    store.recordLaunch(userId, pending.parsed.symbol, res.token);
    return tg.send(chatId, [
      `🚀 <b>$${pending.parsed.symbol}</b> ${T(u, 'is live on Ascend!', 'sudah live di Ascend!')}`,
      `Token: <code>${res.token}</code>`,
      `Tx: <code>${res.txHash}</code>`,
      '',
      T(u, 'Your creator fees accrue to your wallet via the coin\'s escrow.', 'Fee pembuat terkumpul untuk wallet kamu lewat escrow koin.'),
    ].join('\n'));
  } catch (e) {
    console.error('[launch]', e);
    return tg.send(chatId, `❌ ${escapeHtml(e.shortMessage || e.message)}`);
  }
}

async function onScan(chatId, u, arg) {
  if (!isAddress(arg)) return tg.send(chatId, T(u, 'Usage: <code>/scan 0xTokenAddress</code>', 'Cara pakai: <code>/scan 0xAlamatToken</code>'));
  try {
    const l = await reader.launchByToken(arg);
    if (!l) return tg.send(chatId, T(u, 'Not an Ascend launch.', 'Bukan koin hasil launch Ascend.'));
    return tg.send(chatId, formatCard(l, analyzeLaunch(l), u.lang));
  } catch (e) {
    console.error('[scan]', e);
    return tg.send(chatId, `❌ ${escapeHtml(e.shortMessage || e.message)}`);
  }
}

async function onNew(chatId, u) {
  try {
    const list = await reader.latestLaunches(5);
    if (!list.length) return tg.send(chatId, T(u, 'No launches found yet.', 'Belum ada launch.'));
    for (const l of list) await tg.send(chatId, formatCard(l, analyzeLaunch(l), u.lang));
  } catch (e) {
    console.error('[new]', e);
    return tg.send(chatId, `❌ ${escapeHtml(e.shortMessage || e.message)}`);
  }
}

async function handle(update) {
  if (update.callback_query) {
    const q = update.callback_query;
    const u = store.user(q.from.id);
    await tg.call('answerCallbackQuery', { callback_query_id: q.id }).catch(() => {});
    if (q.data === 'launch:yes') return onConfirm(q.message.chat.id, q.from.id, u);
    if (q.data === 'launch:no') {
      u.pending = null;
      store.save();
      return tg.send(q.message.chat.id, T(u, 'Cancelled.', 'Dibatalkan.'));
    }
    return;
  }

  const m = update.message;
  if (!m?.text || !m.from) return;
  const u = store.user(m.from.id);
  const [cmdRaw, ...rest] = m.text.trim().split(/\s+/);
  const cmd = cmdRaw.toLowerCase().replace(/@\w+$/, '');
  const arg = rest.join(' ');

  switch (cmd) {
    case '/start':
    case '/help':
      return tg.send(m.chat.id, HELP[u.lang]);
    case '/lang':
      u.lang = arg.toLowerCase() === 'en' ? 'en' : 'id';
      store.save();
      return tg.send(m.chat.id, HELP[u.lang]);
    case '/wallet':
      if (!isAddress(arg)) return tg.send(m.chat.id, T(u, 'Send a wallet address: <code>/wallet 0x...</code>', 'Kirim alamat wallet: <code>/wallet 0x...</code>'));
      u.wallet = viem.getAddress(arg);
      store.save();
      return tg.send(m.chat.id, `✅ ${T(u, 'Wallet saved', 'Wallet tersimpan')}: <code>${u.wallet}</code>`);
    case '/launch':
      return onLaunch(m.chat.id, m.from.id, u, m.text);
    case '/scan':
      return onScan(m.chat.id, u, arg);
    case '/new':
      return onNew(m.chat.id, u);
    default:
      return undefined;
  }
}

// Posts every new Ascend launch to ALERT_CHAT_ID.
async function alertLoop() {
  if (!cfg.alertChatId) return;
  for (;;) {
    try {
      if (store.data.lastAlertBlock === null) {
        store.data.lastAlertBlock = (await reader.client.getBlockNumber()).toString();
        store.save();
      }
      const { launches, head } = await reader.launchesSince(BigInt(store.data.lastAlertBlock));
      for (const l of launches) await tg.send(cfg.alertChatId, formatCard(l, analyzeLaunch(l), 'id'));
      store.data.lastAlertBlock = head.toString();
      store.save();
    } catch (e) {
      console.error('[alerts]', e.shortMessage || e.message);
    }
    await new Promise((r) => setTimeout(r, 30_000));
  }
}

await reader.assertMainnet();
console.log(`Kestrel bot running. Launches: ${launcher.canLaunch ? (cfg.dryRun ? 'DRY RUN' : 'LIVE') : 'off'}`
  + `${launcher.launcherAddress ? ` (gas wallet ${launcher.launcherAddress})` : ''}`);
alertLoop();
for await (const update of tg.updates()) {
  handle(update).catch((e) => console.error('[handle]', e));
}
