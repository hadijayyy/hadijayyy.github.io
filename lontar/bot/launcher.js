// Launches a coin on Ascend through the EscrowFactory.
// Non-custodial: no dev buy, so the bot never touches user funds. It only pays gas.
// The user's wallet receives the creator fees; Lontar's builder address earns the builder fee.

import * as viem from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ADDR, QUOTES, ZERO_ADDRESS, percentToPips } from '../core/ascend.js';
import { elysiumChain } from '../core/reader.js';

export function buildLaunchArgs({ parsed, wallet, builder, builderFeePips, salt }) {
  const p = {
    name: parsed.name,
    symbol: parsed.symbol,
    quote: QUOTES[parsed.pair].address,
    devBuyQuote: 0n,
    minDevOut: 0n,
    salt,
    creator: ZERO_ADDRESS, // always zero: the factory makes the escrow the creator
    fee: parsed.feePips,
    builderFee: builder ? builderFeePips : 0,
  };
  const r = {
    recipient: wallet,
    dev: wallet,
    builder: builder || ZERO_ADDRESS,
    cto: parsed.cto,
  };
  return { p, r };
}

export function createLauncher({ cfg, reader }) {
  const { client, abi } = reader;
  const account = cfg.privateKey ? privateKeyToAccount(cfg.privateKey) : null;
  const wallet = account
    ? viem.createWalletClient({ account, chain: elysiumChain(viem, cfg.rpcUrl), transport: viem.http(cfg.rpcUrl) })
    : null;
  const launchedEvent = abi.find((x) => x.type === 'event' && x.name === 'Launched');

  async function builderFeePips() {
    if (!cfg.builder) return 0;
    const cap = Number(await client.readContract({
      address: ADDR.escrowFactory, abi, functionName: 'builderFeeCap', args: [cfg.builder],
    }));
    return Math.min(cap, percentToPips(cfg.builderFeePercent));
  }

  return {
    canLaunch: Boolean(account),
    launcherAddress: account?.address ?? null,

    /** Simulates, and sends unless dry-run. Returns { dryRun, token, poolId, escrow, txHash, builderFeePips }. */
    async launch(parsed, userWallet) {
      if (!account) throw new Error('Launcher wallet not configured');
      const paused = await client.readContract({ address: ADDR.launchpad, abi, functionName: 'paused' });
      if (paused) throw new Error('Ascend launches are paused right now');

      const quote = QUOTES[parsed.pair].address;
      const [ruleSet, qc, bFee] = await Promise.all([
        client.readContract({ address: ADDR.escrowFactory, abi, functionName: 'ruleSet' }),
        client.readContract({ address: ADDR.launchpad, abi, functionName: 'quoteConfig', args: [quote] }),
        builderFeePips(),
      ]);
      if (!qc.allowed) throw new Error(`${parsed.pair} pairs are not open for new launches`);

      const builder = bFee > 0 ? cfg.builder : null;
      const salt = viem.toHex(crypto.getRandomValues(new Uint8Array(32)));
      const { p, r } = buildLaunchArgs({ parsed, wallet: userWallet, builder, builderFeePips: bFee, salt });

      const { result, request } = await client.simulateContract({
        account, address: ADDR.escrowFactory, abi, functionName: 'launchChecked',
        args: [p, r, ruleSet, qc.startTick],
      });
      const [token, poolId, escrow] = result;

      if (cfg.dryRun) return { dryRun: true, token, poolId, escrow, txHash: null, builderFeePips: bFee };

      const txHash = await wallet.writeContract(request);
      const receipt = await client.waitForTransactionReceipt({ hash: txHash, timeout: 120_000 });
      if (receipt.status !== 'success') throw new Error(`Launch transaction reverted: ${txHash}`);

      const launched = viem.parseEventLogs({ abi: [launchedEvent], logs: receipt.logs })
        .find((l) => l.address.toLowerCase() === ADDR.launchpad.toLowerCase());
      return {
        dryRun: false,
        token: launched?.args.token ?? token,
        poolId: launched?.args.poolId ?? poolId,
        escrow,
        txHash,
        builderFeePips: bFee,
      };
    },
  };
}
