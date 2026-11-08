import { isAddress } from '../core/parse.js';

function num(v, d) {
  const n = Number(v);
  return v === undefined || v === '' || !Number.isFinite(n) ? d : n;
}

export function loadConfig(env = process.env) {
  const cfg = {
    telegramToken: env.TELEGRAM_BOT_TOKEN || '',
    rpcUrl: env.ELYSIUM_RPC_URL || '',
    privateKey: env.LAUNCHER_PRIVATE_KEY || '',
    builder: env.BUILDER_ADDRESS || '',
    builderFeePercent: Math.min(1, Math.max(0, num(env.BUILDER_FEE_PERCENT, 0.5))),
    dryRun: env.DRY_RUN !== '0',
    cooldownHours: num(env.LAUNCH_COOLDOWN_HOURS, 24),
    maxPerHour: num(env.MAX_LAUNCHES_PER_HOUR, 20),
    alertChatId: env.ALERT_CHAT_ID || '',
    dataFile: env.DATA_FILE || './data.json',
  };
  const errors = [];
  if (!cfg.telegramToken) errors.push('TELEGRAM_BOT_TOKEN is required');
  if (!cfg.rpcUrl) errors.push('ELYSIUM_RPC_URL is required');
  if (cfg.builder && !isAddress(cfg.builder)) errors.push('BUILDER_ADDRESS is not a valid address');
  if (cfg.privateKey && !/^0x[0-9a-fA-F]{64}$/.test(cfg.privateKey)) errors.push('LAUNCHER_PRIVATE_KEY must be 0x + 64 hex chars');
  return { cfg, errors };
}
