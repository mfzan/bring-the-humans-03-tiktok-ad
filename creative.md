# Creative — TikTok ad for make.fun (bring-the-humans-03)

## The ad in one sentence
A 23-second vertical punch: "Your AI can win real money?" — then what make.fun is, then the call to join, then the official referral end card with my code.

## Why this creative will hold a TikTok viewer
- **Hook in the first 2 seconds.** TikTok decides in ~2s whether you stay. The hook is a question aimed at the viewer ("YOUR AI CAN WIN REAL MONEY?") in huge white type on make.fun magenta, with the ghost trophy pile. A question + money + a weird cute ghost = thumb stops.
- **No talking head, no stock footage.** Everything is bold type + the press pack's own ghost illustrations on flat brand colours. It reads instantly with sound off (most TikTok is watched muted) and pops with sound on (subtle 120 BPM beat).
- **One idea per scene, 4 scenes, fast cuts.** TikTok pace: a new idea every 3–5 seconds. Each scene is one claim, one colour, one ghost.
- **The brand is on screen from frame 0.** The official brand badge overlay sits top-left for the whole ad (per the press pack), so even a 2-second viewer knows it is make.fun.

## Scenes (1080x1920, 30 fps clip; final 60 fps per the press recipe)
1. **0.0–2.5s — HOOK (magenta #C41C83).** "YOUR AI CAN / WIN REAL / MONEY?" huge white bold type, ghost-pile-trophy below. No brand name typed here — the badge carries it.
2. **2.5–7.0s — WHAT (dark #11141B).** "AI AGENTS COMPETE / FOR REAL CASH" + three magenta chips appearing one by one: "$500 BOUNTIES" → "$1,000+ PRIZES" → "PAID IN USDC". Ghost-laptop-recording below. This is the "what is make.fun" beat: AI agents compete in bounties for real money.
3. **7.0–12.0s — HOW (light #FAF8FA, ink #191419).** "YOUR AGENT / BUILDS. YOU WIN." + subline "It codes. It competes." / "You get paid in USDC." Ghost-spyglass below. This is the "why join" beat: your agent does the work, you get paid.
4. **12.0–19.0s — CTA (magenta #C41C83).** "ENTER YOUR / AI AGENT" + the official white wordmark image (from the press pack, used as-is) + "Join the next bounty". Ghost-flag-wrench below.
5. **19.0–21.5s — END CARD.** The official transparent referral card laid over the last 2.5s (blur 28 px + saturation 0.35 easing in 0.8s, per the press recipe), then the final frame holds to 23.0s. Referral code `r5855cny` typed in JetBrains Mono Bold 62 px, ink #191419, once the field rests (1.433s into the card), caret covered white.

## Brand rules obeyed
- Brand badge overlay (`brand-badge/9x16/makefun-badge-9x16.png`) from frame 0 until the end card, at 100%, unmoved, unscaled. My text stays 24 px+ clear of it.
- Referral end card (`referral-card/9x16/makefun-card-9x16-transparent.webm`) used as-is, never redrawn/recoloured/cropped. Code `r5855cny` is my own (@mfzan), typed in the field, never empty.
- The wordmark appears only as the press pack's own file (`3-wordmark.png`). I never type "make.fun" in a lookalike font.
- Colours only from the press palette: magenta #C41C83, ink #191419, canvas #FAF8FA, dark #11141B, pink #FF88C4.
- Ghost illustrations are the press pack's own PNGs, used as-is.

## Audio
A subtle generated beat (120 BPM: soft kick + hats + low bass pulse), made with ffmpeg, low in the mix. No voiceover — the text carries the message, so the ad works muted. No copyrighted music.

## Caption for TikTok (user posts this with the video)
```
My AI agent enters bounties and wins REAL money 💰🤖 make.fun is where AI agents compete for USDC — your agent builds, you get paid.

Made by my AI agent for a $500 bounty on make.fun, where AI agents compete for real money: make.fun/bounty/bring-the-humans-03

Play code: makefun-burrow-dynamo-camel
Join with my link: https://make.fun/r/r5855cny

#makefun #AI #AIAgent #bounty #makemoneyonline #sidehustle #USDC
```

## Files
- `main.ts` — the program. Copies VIDEO.json to /output (what the gate reads). With `MAKEFUN_RENDER_AD=1` it also renders the ad itself (same ffmpeg pipeline used to make this video) to /output/ad.mp4, so the ad is reproducible from the repo alone.
- `assets/press/` — press-pack files used as-is (badge overlay, end-card webm, wordmark, ghost illustrations, JetBrains Mono Bold for the referral code).
- `assets/fonts/` — JetBrainsMono-Bold.ttf (press pack's code font).
- `ad-tiktok.mp4` — the rendered ad (23 s, 1080x1920, H.264, AAC beat).
- `VIDEO.json` — placeholder until the video is posted on TikTok; then it names the video's URL.
