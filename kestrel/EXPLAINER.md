# Kestrel, explained simply

## In one sentence

**Kestrel is a Telegram bot that launches a crypto coin from a single chat message, and puts a "nutrition label" on every new coin so people can see the risks before they buy.**

The name comes from the kestrel, a small falcon that hovers in place while it watches the ground. Both of its traits match the product: it **launches fast**, and it has **sharp eyes** for risk.

## The problem

Think of a new marketplace where hundreds of new sellers open a stall every day.

1. **Opening a stall is hard.** Launching a coin on Ascend means dealing with wallets, contracts and technical settings, and most people give up halfway.
2. **Buyers can't read the label.** The important facts about every coin are public: how high its fee is, whether the creator bought a big chunk first, and where the fees go. But they are written in code, so ordinary buyers can't read them. That is how people fall for copycat coins, or for coins the creator dumps right away.

## How Kestrel works

**For creators:**
1. Open the Kestrel bot on Telegram.
2. Send your wallet address: `/wallet 0x...`
3. Type: `/launch KOPI Kopi Nusantara`
4. Tap "Launch". That's it: your coin is live on Ascend.

Every time someone buys or sells your coin, your share of the fee is paid to you automatically.

**For buyers:**
- Send `/scan` followed by a coin's address, or open the Kestrel website.
- Kestrel shows a simple card, 🟢 low, 🟡 medium or 🔴 high risk, with the reasons in plain words.
- For example: *"The creator holds 18% of the supply, watch for selling,"* or *"The ticker copies a well-known asset, likely a copycat."*

## Why it's safe

- **Kestrel never holds your money** and never asks for your private key. Fees from your coin go straight to your wallet through Ascend's contracts.
- **Safe defaults.** The bot never buys your coin at launch (no *dev buy*), and the community can take a coin over if its creator walks away.
- **Anti-spam brakes.** One launch per person per day. Names that copy well-known assets, such as BTC or HYPE, are blocked.
- **Every rating can be checked.** Each risk flag comes from public on-chain data, not from opinion.

## How Kestrel makes money

Ascend has a feature called the *builder fee*. An approved app that helps people launch coins can take a small cut, at most 1%, of every trade in the coins it launched.

The more coins launch through Kestrel and the more they trade, the more Kestrel earns. Ascend earns more too, because every trade pays a fee to Ascend. **Kestrel and Ascend win together.**

## Where it stands today

- ✅ The website and scanner are built. Until the Elysium mainnet RPC is public, they show example coins; with an RPC address they read real launches.
- ✅ The Telegram bot is built and tested. It runs in *simulation mode* by default, so nothing is sent until it is switched on for real.
- ⏳ To collect the builder fee, Ascend must approve Kestrel's address. That is one reason Kestrel is applying to the Ascend Builder Incubator.

*Kestrel provides automated analysis, not financial advice. Every buying decision remains your own.*
