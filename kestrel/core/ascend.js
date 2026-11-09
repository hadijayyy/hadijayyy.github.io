// Ascend on Elysium mainnet: addresses and ABI fragments.
// Source: https://ascendlaunch.gitbook.io/docs/developers/mainnet-contracts
// and https://ascendlaunch.gitbook.io/docs/developers/abis-and-events
// Pure data, no dependencies: shared by the web scanner and the Telegram bot.

export const CHAIN_ID = 99901;
export const START_BLOCK = 422319n; // first block of Ascend V5 on Elysium

export const ADDR = {
  launchpad: '0xe0dEF4221b9840a610D4e7d55812a79A6431a8eC',
  escrowFactory: '0x63f6a8A8d0257c0363251a50cdE8A8b1046e4d19',
  seatFactory: '0xBDB8d64452191041C4dAA3AD0f64bE4380FEA0b1',
  multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
};

// Public Elysium mainnet RPC, published by Kinetiq at mainnet launch.
export const PUBLIC_RPC = 'https://rpc.elysium.kinetiq.xyz';

export const QUOTES = {
  USDC: { address: '0xb47c4C8F73F009CC0C0d3f92B388d13E293F0B65', decimals: 6, label: 'USDC' },
  HYPE: { address: '0xbA876237B0F021A6c6D852d6c26E107997cC5E81', decimals: 18, label: 'HYPE' },
  KNTQ: { address: '0xe45a355d9e9cAd2aD85F2d03E3eE3102A036acF0', decimals: 18, label: 'KNTQ' },
};

export function quoteByAddress(address) {
  const a = String(address || '').toLowerCase();
  return Object.values(QUOTES).find((q) => q.address.toLowerCase() === a) || null;
}

// A standard Ascend launch mints 1,000,000,000 coins with 18 decimals.
export const STANDARD_SUPPLY = 10n ** 27n;
export const PIPS = 1_000_000; // 1,000,000 pips = 100%

export const MIN_CREATOR_FEE_PIPS = 10_000; // 1%
export const MAX_CREATOR_FEE_PIPS = 100_000; // 10%

const LAUNCH_PARAMS =
  '(string name, string symbol, address quote, uint256 devBuyQuote, uint256 minDevOut, bytes32 salt, address creator, uint24 fee, uint24 builderFee) p';
const ROUTE = '(address recipient, address dev, address builder, bool cto) r';

// Human-readable ABI, for viem's parseAbi.
export const ABI_STRINGS = [
  // Launchpad
  'event Launched(bytes32 indexed poolId, address indexed token, address indexed creator, address quote, uint256 supplySeeded, uint256 devBuyTokens, uint24 fee, uint24 builderFee)',
  'function quoteConfig(address quote) view returns ((bool allowed, int24 startTick, uint128 maxClip))',
  'function paused() view returns (bool)',
  'function currentFee(bytes32 poolId) view returns (uint24)',
  'function poolLaunchedAt(bytes32 poolId) view returns (uint256)',
  // EscrowFactory
  'event EscrowLaunched(bytes32 indexed poolId, address indexed escrow, address indexed recipient, address dev, address builder, address ruleSet, bool cto)',
  'function ruleSet() view returns (address)',
  'function builderFeeCap(address) view returns (uint24)',
  `function launchChecked(${LAUNCH_PARAMS}, ${ROUTE}, address expectedRuleSet, int24 expectedStartTick) returns (address token, bytes32 poolId, address escrow)`,
  `function predict(address payer, ${LAUNCH_PARAMS}, ${ROUTE}) view returns (address escrow, address token)`,
  // Seat factory (Holder Rewards / Buyback coins)
  'event SeatDeployed(address indexed seat, address indexed deployer, address indexed primaryPayee, address devBuyTo, uint16 holderBpsQuote, uint16 holderBpsToken, uint16 buybackBps, bool burnBought, address[] payees, uint16[] bps, address[] exclusions)',
  // ERC-20 reads
  'function name() view returns (string)',
  'function symbol() view returns (string)',
];

export function pipsToPercent(pips) {
  return Number(pips) / 10_000; // 10,000 pips = 1%
}

export function percentToPips(percent) {
  return Math.round(Number(percent) * 10_000);
}

export function shortAddr(a) {
  const s = String(a || '');
  return s.length > 12 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
