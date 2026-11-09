// Reads Ascend launches from Elysium over JSON-RPC.
// viem is injected so this file runs both in the browser (esm.sh) and in Node (npm).

import { ABI_STRINGS, ADDR, CHAIN_ID, START_BLOCK } from './ascend.js';

export function elysiumChain(viem, rpcUrl) {
  return viem.defineChain({
    id: CHAIN_ID,
    name: 'Elysium',
    nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
    contracts: { multicall3: { address: ADDR.multicall3 } },
  });
}

export function createReader({ viem, rpcUrl, chunk = 20_000n }) {
  const abi = viem.parseAbi(ABI_STRINGS);
  const ev = (name) => abi.find((x) => x.type === 'event' && x.name === name);
  const client = viem.createPublicClient({ chain: elysiumChain(viem, rpcUrl), transport: viem.http(rpcUrl) });

  async function logsBackwards({ address, event, args, want, maxBlocks = 2_000_000n }) {
    const head = await client.getBlockNumber();
    const out = [];
    let to = head;
    let size = chunk;
    while (to >= START_BLOCK && head - to < maxBlocks && out.length < want) {
      const from = to - size + 1n > START_BLOCK ? to - size + 1n : START_BLOCK;
      try {
        const logs = await client.getLogs({ address, event, args, fromBlock: from, toBlock: to });
        out.unshift(...logs);
        to = from - 1n;
      } catch (e) {
        if (size <= 500n) throw e;
        size /= 4n; // provider range limit: shrink and retry
      }
    }
    return { logs: out, head };
  }

  async function logsForPools(event, address, poolIds, fromBlock, toBlock) {
    if (!poolIds.length) return [];
    return client.getLogs({ address, event, args: { poolId: poolIds }, fromBlock, toBlock });
  }

  async function erc20Meta(tokens) {
    const calls = tokens.flatMap((t) => [
      { address: t, abi, functionName: 'name' },
      { address: t, abi, functionName: 'symbol' },
    ]);
    const res = await client.multicall({ contracts: calls, allowFailure: true });
    return tokens.map((t, i) => ({
      name: res[2 * i]?.result ?? '',
      symbol: res[2 * i + 1]?.result ?? '',
    }));
  }

  async function enrich(launchLogs) {
    if (!launchLogs.length) return [];
    const poolIds = launchLogs.map((l) => l.args.poolId);
    const minBlock = launchLogs.reduce((m, l) => (l.blockNumber < m ? l.blockNumber : m), launchLogs[0].blockNumber);
    const maxBlock = launchLogs.reduce((m, l) => (l.blockNumber > m ? l.blockNumber : m), launchLogs[0].blockNumber);

    const escrows = await logsForPools(ev('EscrowLaunched'), ADDR.escrowFactory, poolIds, minBlock, maxBlock);
    const byPool = new Map(escrows.map((e) => [e.args.poolId, e.args]));

    // Holder Rewards / Buyback coins: the seat is the escrow's recipient.
    const seats = await client.getLogs({
      address: ADDR.seatFactory, event: ev('SeatDeployed'), fromBlock: minBlock, toBlock: maxBlock,
    });
    const bySeat = new Map(seats.map((s) => [s.args.seat.toLowerCase(), s.args]));

    const meta = await erc20Meta(launchLogs.map((l) => l.args.token));
    const blocks = new Map();
    for (const l of launchLogs) {
      if (!blocks.has(l.blockNumber)) blocks.set(l.blockNumber, client.getBlock({ blockNumber: l.blockNumber }));
    }

    const out = [];
    for (let i = 0; i < launchLogs.length; i++) {
      const a = launchLogs[i].args;
      const e = byPool.get(a.poolId) || {};
      const seat = e.recipient ? bySeat.get(e.recipient.toLowerCase()) : null;
      const block = await blocks.get(launchLogs[i].blockNumber);
      out.push({
        token: a.token,
        poolId: a.poolId,
        name: meta[i].name,
        symbol: meta[i].symbol,
        quote: a.quote,
        fee: Number(a.fee),
        builderFee: Number(a.builderFee),
        supplySeeded: a.supplySeeded.toString(),
        devBuyTokens: a.devBuyTokens.toString(),
        escrow: e.escrow || a.creator,
        recipient: e.recipient || null,
        dev: e.dev || null,
        builder: e.builder || null,
        cto: e.cto ?? null,
        seat: seat ? {
          holderBpsQuote: Number(seat.holderBpsQuote),
          holderBpsToken: Number(seat.holderBpsToken),
          buybackBps: Number(seat.buybackBps),
          burnBought: seat.burnBought,
        } : null,
        launchedAt: Number(block.timestamp),
        blockNumber: launchLogs[i].blockNumber.toString(),
        txHash: launchLogs[i].transactionHash,
      });
    }
    return out;
  }

  return {
    client,
    abi,

    /** Throws if the RPC is not Elysium mainnet. */
    async assertMainnet() {
      const id = await client.getChainId();
      if (id !== CHAIN_ID) throw new Error(`This RPC is chain ${id}, not Elysium mainnet (${CHAIN_ID}).`);
    },

    /** Most recent launches, newest first. */
    async latestLaunches(n = 12) {
      const { logs } = await logsBackwards({ address: ADDR.launchpad, event: ev('Launched'), want: n });
      return (await enrich(logs.slice(-n))).reverse();
    },

    /** One launch by coin address, or null. */
    async launchByToken(token) {
      const { logs } = await logsBackwards({
        address: ADDR.launchpad, event: ev('Launched'), args: { token }, want: 1, maxBlocks: 1n << 62n,
      });
      const [l] = await enrich(logs.slice(-1));
      return l || null;
    },

    /** Launches in (fromBlock, head]. Returns { launches, head }. */
    async launchesSince(fromBlock) {
      const head = await client.getBlockNumber();
      if (head <= fromBlock) return { launches: [], head };
      const logs = [];
      for (let from = fromBlock + 1n; from <= head; from += chunk) {
        const to = from + chunk - 1n < head ? from + chunk - 1n : head;
        logs.push(...await client.getLogs({ address: ADDR.launchpad, event: ev('Launched'), fromBlock: from, toBlock: to }));
      }
      return { launches: await enrich(logs), head };
    },
  };
}
