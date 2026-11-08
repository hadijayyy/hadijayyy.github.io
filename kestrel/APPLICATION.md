# Draft answers: Ascend Builder Incubator

Fill in everything in [brackets] and check every claim is true before submitting. Q-numbers match the form.

**1. Project name:** Kestrel

**2. Primary contact:** Ryan Hadi, Founder

**3. Personal X:** [@your_handle]

**4. Telegram:** [@your_handle] · **5. Discord:** [username]

**6. Links:**
- Demo (web scanner): https://hadijayyy.github.io/kestrel/
- Code: https://github.com/hadijayyy/hadijayyy.github.io/tree/main/kestrel
- Plain-language overview: https://github.com/hadijayyy/hadijayyy.github.io/blob/main/kestrel/EXPLAINER.md
- [Telegram bot link, once running]

**7. What are you building, and who is it for?**
> Kestrel lets anyone launch a coin on Ascend from a single Telegram message, and gives every Ascend launch a plain-language economics card before people buy. Launching today needs wallet and contract know-how, and traders can't read the on-chain settings that matter (dev buy, fee routing, takeover opt-in), so copycats and dumps go unnoticed. Kestrel removes both frictions: safe-by-default launches (no dev buy, community takeover on, copycat tickers blocked) and automatic risk cards from on-chain data. It's for crypto communities in Southeast Asia, starting with Indonesia, who live in Telegram, and for traders who want to check a coin in seconds.

**8. Stage:** Prototype / MVP

**9. Team:**
> Solo founder, full-time [or part-time: be honest]. I build AI automation systems: data pipelines, bots and LLM agents for businesses (hadijayyy.github.io). Kestrel applies the same skills, event ingestion, automated analysis and chat interfaces, to Ascend's on-chain data. [Add any crypto/community experience you really have.]

**10. Location:** [City], Indonesia (GMT+7)

**11. What have you shipped or validated so far?**
> Prelaunch, no users yet (Elysium mainnet launches on Nov 9, 2026). Shipped: (1) a web scanner that reads Ascend's Launched, EscrowLaunched and SeatDeployed events and renders a risk card per launch; (2) a Telegram bot that launches through EscrowFactory.launchChecked with simulation-first and rate limits, plus /scan and channel alerts; (3) a test suite covering calldata encoding, risk rules and anti-spam. [Add real user interviews only if you did them, e.g. "Talked to N Indonesian Telegram community admins in Nov 2026".]

**12. Why Elysium and Ascend?**
> Ascend's contracts expose everything a trader needs to judge a launch, and its builder-fee mechanism lets a distribution app share in the volume it brings. That means Kestrel's revenue grows only when Ascend's launches and volume grow. Elysium is new, so the Telegram-native launch and discovery layer is still open. Ascend could make the biggest difference by approving Kestrel as a builder and giving indexer access and distribution.

**13. Planned token launch and timeline:**
> TBD. Earliest after 2-3 months of live usage (~Q1 2027). The token would be launched on Ascend, with a share of Kestrel's builder-fee revenue funding buybacks of it, so the token is tied to real launch volume rather than promises. We want help designing this so it's sustainable and compliant.

**14.** Yes, we intend to launch through Ascend.

**15. First 90 days:**
> Day 30: bot live on Elysium mainnet with /scan and alerts; first 25 coins launched through Kestrel. Measured on-chain by builder address.
> Day 60: approved builder fee live; 150 launches; Indonesian community alert channel with 1,000 members.
> Day 90: Holder Rewards and Buyback launch options; 500 cumulative launches; public dashboard of Kestrel launches, volume and builder fees.
> Dependencies: Ascend builder approval (builderFeeCap), a reliable Elysium RPC.

**16. Funding sought:** US$15,000

**17. Use of funds and existing funding:**
> Bootstrapped, no funding yet. Main costs: RPC/hosting and gas for user launches, a security review of the bot's launch flow, community campaigns in Indonesian Telegram groups, and 3-6 months of runway.

**18. Support priorities (max 3):**
- Ascended / HyperCore readiness support. Pick this, or "Tokenomics and launch strategy", if you'd rather not ask for builder approval through this question.
- Marketing, distribution, and community growth
- Direct builder funding

Mention the builder-fee approval in Q12 and Q20 regardless.

**19. Risks:**
> Non-custodial: no dev buy, so the bot never holds user funds. The only key it holds is a gas-only hot wallet. No contracts of our own; launches go through Ascend's EscrowFactory and are always simulated before sending. Main risks: spam or low-quality launches harming reputation (mitigated by per-user cooldowns, a global hourly cap, blocked copycat tickers, safe defaults and public risk cards), hot-wallet compromise (minimal balance), and RPC dependency. No audit yet; we'd like a review of the launch flow.

**20. Strategic Partner potential:**
> Kestrel is built to increase Ascend's core metric: every launch and trade it brings pays Ascend's protocol fees, and Kestrel only earns when that happens. Beyond our own revenue, the risk cards make every Ascend coin easier to trust, and we can bring Indonesian and SEA Telegram communities that other launchpads don't reach.

**21. How did you hear about it:** [be specific]

**22.** Check all three after reviewing every answer.
