# Kestrel

Launch a coin on [Ascend](https://ascendlaunch.gitbook.io/docs) (Elysium) from one Telegram message, and read any Ascend launch's economics in plain language before buying.

- **Landing page + web scanner:** `kestrel/index.html` (English; copy in `i18n.js`, which also keeps an Indonesian translation), served by GitHub Pages at `/kestrel/`. Runs fully in the browser. Shows example coins until you paste an Elysium mainnet RPC URL.
- **Telegram bot:** `kestrel/bot/`. Commands: `/wallet`, `/launch`, `/scan`, `/new`, `/lang`. Optional channel alerts for every new Ascend launch.
- **Shared core:** `kestrel/core/`. Contract addresses and ABIs, launch analysis, command parsing, on-chain reader. No dependencies; viem is injected.

Plain-language explanation: [EXPLAINER.md](EXPLAINER.md) (English) · [PENJELASAN.md](PENJELASAN.md) (Bahasa Indonesia).

## How a launch works

1. The user sets a payout wallet with `/wallet 0x…`.
2. `/launch KOPI Kopi Nusantara fee=2 pair=USDC cto=yes` is validated: 2–10 char ticker, well-known tickers blocked, hidden characters blocked, fee 1–10%.
3. The bot shows a preview with Launch and Cancel buttons. The request expires after 5 minutes.
4. On confirm, the bot calls `EscrowFactory.launchChecked`. It always simulates first, and sends only when `DRY_RUN=0`.
   - `devBuyQuote = 0`: the bot never spends or holds user funds, it only pays gas.
   - `recipient = dev = user wallet`: creator fees accrue to the user via the coin's CreatorEscrow.
   - `builder = BUILDER_ADDRESS`, `builderFee = min(BUILDER_FEE_PERCENT, on-chain builderFeeCap)`. This is Kestrel's revenue. The cap is 0 until Ascend's multisig approves the builder, so launches still work without approval, just with no builder fee.
5. Rate limits: one launch per user every `LAUNCH_COOLDOWN_HOURS`, and `MAX_LAUNCHES_PER_HOUR` across all users.

## Risk analysis

`core/analyze.js` is rule-based and deterministic. Every flag maps to an on-chain field:

| Signal | Source | Effect |
|---|---|---|
| Ticker copies a well-known asset | token `symbol()` | +40 |
| Dev buy share of the 1B supply | `Launched.devBuyTokens` | 0 / +20 / +30 / +50 |
| Total trading fee | `Launched.fee + builderFee` | +5 above 3%, +15 above 5% |
| Fee routed to holders or buybacks | `SeatDeployed` | shown as a plus |
| Dev-buy wallet also gets all fees | `EscrowLaunched.recipient == dev` | +10 |
| Community takeover disabled | `EscrowLaunched.cto` | +10 |
| Launched under an hour ago | block timestamp | +5 |

The score maps to a level: 0–19 low, 20–39 medium, 40+ high. Good signals are listed on the card but never cancel out red flags.

## Run the bot

Requires Node 20+.

```bash
cd kestrel/bot
cp .env.example .env   # fill in TELEGRAM_BOT_TOKEN and ELYSIUM_RPC_URL
npm install
npm test
npm start
```

The bot refuses to start unless the RPC reports chain 99901 (Elysium mainnet). It runs read-only when `LAUNCHER_PRIVATE_KEY` is empty, and it only simulates launches until you set `DRY_RUN=0`. Keep only a small amount of HYPE for gas in the launcher wallet.

## Status

- Tested: command parsing, risk rules, `launchChecked` calldata encoding, config, rate limits, HTML escaping (`npm test`). Also tested: the web page in a headless browser, and the RPC chain check against Elysium testnet.
- Tested on Elysium mainnet (Nov 9, 2026) through the public RPC `https://rpc.elysium.kinetiq.xyz`: the reader loads and scores live launches, and the website auto-loads them. Not yet run on mainnet: the Telegram bot itself and a `DRY_RUN=1` launch simulation.
- Holder Rewards and Buyback launches (`SeatFactoryV5`) are read and shown by the scanner but not yet offered by `/launch`.
