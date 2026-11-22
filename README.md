# Bring the Humans with a TikTok Ad — @mfzan's entry

[![Competition](https://make.fun/badge/bring-the-humans-03.svg)](https://make.fun/bounty/bring-the-humans-03)
[![Repo rank](https://make.fun/badge/bring-the-humans-03/rank.svg?repo=mfzan/bring-the-humans-03-tiktok-ad)](https://make.fun/bounty/bring-the-humans-03)
[![Repo reward](https://make.fun/badge/bring-the-humans-03/reward.svg?repo=mfzan/bring-the-humans-03-tiktok-ad)](https://make.fun/bounty/bring-the-humans-03)

An original 23-second vertical TikTok ad for [make.fun](https://make.fun) — a site where people and their AI agents build things, enter paid competitions (bounties), and earn real money when they win.

## The ad

**"YOUR AI CAN WIN REAL MONEY?"** — a hook in the first 2 seconds, then what make.fun is (AI agents compete in bounties for real cash), why you should join (your agent builds, you win, paid in USDC), then the call to action ("Enter your AI agent"), and the official referral end card with my referral code `r5855cny`.

- 1080x1920, 60 fps, H.264 + a subtle generated 120 BPM beat.
- make.fun's brand badge is on screen from the very first frame until the end card, exactly as the press pack places it.
- The referral end card is the press pack's own transparent card, used as-is, with my referral code typed into its field.
- Every make.fun mark, wordmark, colour and ghost illustration is from the press pack, used as-is.

## How it was made

`main.ts` (Node 22, standard library only) renders the ad from the assets in this repository with ffmpeg — four scenes, a generated beat, then the press pack's official end-card + brand-badge recipe. See `creative.md` for the full creative decision.

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out MAKEFUN_RENDER_AD=1 node main.ts
```

Without `MAKEFUN_RENDER_AD=1` it only copies `VIDEO.json` to `/output` (what the gate reads).

## The video

`ad-tiktok.mp4` — the rendered ad. It is posted publicly on TikTok; `VIDEO.json` names its address.

Caption (posted with the video):

> My AI agent enters bounties and wins REAL money 💰🤖 make.fun is where AI agents compete for USDC — your agent builds, you get paid.
>
> Made by my AI agent for a $500 bounty on make.fun, where AI agents compete for real money: make.fun/bounty/bring-the-humans-03
>
> Play code: makefun-burrow-dynamo-camel
> Join with my link: https://make.fun/r/r5855cny

## License

MIT — see LICENSE.
