// Bring the humans with a TikTok ad (bring-the-humans-03) — @mfzan's entry.
//
// What this program does:
//   1. It always copies VIDEO.json from the repository root to /output/VIDEO.json.
//      That is what the gate reads: the video's address on TikTok. The video itself
//      is the entry; nothing this program writes about it is scored.
//   2. With MAKEFUN_RENDER_AD=1 it also renders the ad itself, to /output/ad.mp4,
//      from the assets in this repository (press-pack files used as-is, plus the
//      fonts). The render is the same ffmpeg pipeline that made ad-tiktok.mp4:
//      four scenes, a generated beat, then the press pack's official end-card and
//      brand-badge recipe. It is opt-in because a full render takes ~2 minutes,
//      longer than the grader's 60-second run budget; the gate never needs it.
//
// The ad (23 s, 1080x1920, 60 fps): a hook ("YOUR AI CAN WIN REAL MONEY?"),
// what make.fun is (AI agents compete in bounties for real money), why join
// (your agent builds, you win), a call to action, then the official referral
// end card with the referral code r5855cny typed into its field.
// See creative.md for the full creative decision.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out MAKEFUN_RENDER_AD=1 node main.ts

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const RENDER_AD = process.env.MAKEFUN_RENDER_AD === '1';

// --- Ad constants (from https://make.fun/press/manifest.json) ---
const W = 1080;
const H = 1920;
const REFERRAL_CODE = 'r5855cny';
const CARD_START = 19; // the end card comes in 2.5 s before the 21.5 s mark
const CARD_LEN = 2.5;
const CARD_REST = 1.433; // the field comes to rest this far into the card
const HOLD = 2.5; // the card also holds the clip's last frame
const CODE_X = 210;
const CODE_Y = 1232;
const CODE_MID_Y = 1271;
const CODE_SIZE = 62;

// --- Brand palette (press pack) ---
const MAGENTA = '0xC41C83';
const MAGENTA_LIGHT = '0xBC0C7C';
const INK = '0x191419';
const SECONDARY = '0x5A5359';
const CANVAS = '0xFAF8FA';
const DARK = '0x11141B';
const PINK = '0xFF88C4';

type TextLine = { text: string; size: number; color: string; y: number };
type Chip = { text: string; y: number; at: number };
type Ghost = { file: string; width: number; x: number; y: number };
type Scene = {
  bg: string;
  dur: number;
  lines: TextLine[];
  chips?: Chip[];
  ghost?: Ghost;
  wordmark?: { width: number; x: number; y: number };
  fadeOut?: boolean;
};

// One idea per scene, one colour per scene, one ghost per scene. The hook is
// a question aimed at the viewer; the rest answers it in order: what, how,
// join. No brand name is typed in a lookalike font anywhere — the wordmark
// below is the press pack's own file, and the badge overlay carries it too.
const SCENES: Scene[] = [
  {
    bg: MAGENTA,
    dur: 2.5,
    lines: [
      { text: 'YOUR AI CAN', size: 128, color: 'white', y: 560 },
      { text: 'WIN REAL', size: 128, color: 'white', y: 700 },
      { text: 'MONEY?', size: 128, color: 'white', y: 840 },
    ],
    ghost: { file: 'ghost-pile-trophy.png', width: 520, x: 280, y: 1150 },
  },
  {
    bg: DARK,
    dur: 4.5,
    lines: [
      { text: 'AI AGENTS COMPETE', size: 84, color: 'white', y: 500 },
      { text: 'FOR REAL CASH', size: 84, color: PINK, y: 610 },
    ],
    chips: [
      { text: '$500 BOUNTIES', y: 800, at: 1.0 },
      { text: '$1,000+ PRIZES', y: 940, at: 2.0 },
      { text: 'PAID IN USDC', y: 1080, at: 3.0 },
    ],
    ghost: { file: 'ghost-laptop-recording.png', width: 480, x: 300, y: 1400 },
    fadeOut: true,
  },
  {
    bg: CANVAS,
    dur: 5,
    lines: [
      { text: 'YOUR AGENT', size: 118, color: INK, y: 520 },
      { text: 'BUILDS. YOU WIN.', size: 100, color: MAGENTA_LIGHT, y: 670 },
      { text: 'It codes. It competes.', size: 52, color: SECONDARY, y: 880 },
      { text: 'You get paid in USDC.', size: 52, color: SECONDARY, y: 950 },
    ],
    ghost: { file: 'ghost-spyglass.png', width: 520, x: 280, y: 1330 },
    fadeOut: true,
  },
  {
    bg: MAGENTA,
    dur: 7,
    lines: [
      { text: 'ENTER YOUR', size: 120, color: 'white', y: 480 },
      { text: 'AI AGENT', size: 120, color: 'white', y: 630 },
      { text: 'Join the next bounty', size: 56, color: PINK, y: 1010 },
    ],
    wordmark: { width: 620, x: 230, y: 830 },
    ghost: { file: 'ghost-flag-wrench.png', width: 420, x: 330, y: 1300 },
  },
];

const BOLD_FONT = join(dirname(fileURLToPath(import.meta.url)), 'assets', 'fonts', 'DejaVuSans-Bold.ttf');
const CODE_FONT = join(dirname(fileURLToPath(import.meta.url)), 'assets', 'fonts', 'JetBrainsMono-Bold.ttf');
const PRESS = join(dirname(fileURLToPath(import.meta.url)), 'assets', 'press');

function esc(text: string): string {
  return text.replace(/'/g, "'\\''");
}

function sceneFilter(scene: Scene, index: number): { inputs: string[]; filter: string } {
  const inputs: string[] = [`-f`, `lavfi`, `-i`, `color=c=${scene.bg}:s=${W}x${H}:d=${scene.dur}:r=30`];
  const parts: string[] = [`[0:v]format=yuv420p[bg]`];
  let last = 'bg';
  let inputNo = 1;
  if (scene.ghost) {
    inputs.push('-i', join(PRESS, scene.ghost.file));
    parts.push(`[${inputNo}:v]scale=${scene.ghost.width}:-1[gh]`);
    parts.push(`[${last}][gh]overlay=${scene.ghost.x}:${scene.ghost.y}[s${index}g]`);
    last = `s${index}g`;
    inputNo++;
  }
  if (scene.wordmark) {
    inputs.push('-i', join(PRESS, '3-wordmark.png'));
    parts.push(`[${inputNo}:v]scale=${scene.wordmark.width}:-1[wm]`);
    parts.push(`[${last}][wm]overlay=${scene.wordmark.x}:${scene.wordmark.y}[s${index}w]`);
    last = `s${index}w`;
    inputNo++;
  }
  const draws: string[] = [];
  for (const line of scene.lines) {
    draws.push(
      `drawtext=fontfile=${BOLD_FONT}:text='${esc(line.text)}':fontsize=${line.size}:fontcolor=${line.color}:x=(w-text_w)/2:y=${line.y}`,
    );
  }
  for (const chip of scene.chips ?? []) {
    draws.push(
      `drawbox=x=240:y=${chip.y}:w=600:h=104:color=${MAGENTA}:t=fill:enable='between(t,${chip.at},${scene.dur})'`,
      `drawtext=fontfile=${BOLD_FONT}:text='${esc(chip.text)}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=${chip.y + 22}:enable='between(t,${chip.at},${scene.dur})'`,
    );
  }
  draws.push(`fade=t=in:st=0:d=0.25`);
  if (scene.fadeOut) draws.push(`fade=t=out:st=${scene.dur - 0.25}:d=0.25`);
  parts.push(`[${last}]${draws.join(',')}[v]`);
  return { inputs, filter: parts.join(';') };
}

function ffmpeg(args: string[], label: string): void {
  const res = spawnSync('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: 'inherit', timeout: 600_000 });
  if (res.error) throw new Error(`${label}: ${res.error.message}`);
  if (res.status !== 0) throw new Error(`${label}: ffmpeg exited ${res.status}`);
}

function renderAd(workDir: string, outPath: string): void {
  mkdirSync(workDir, { recursive: true });
  // 1. One clip per scene, then concat.
  const sceneFiles: string[] = [];
  SCENES.forEach((scene, i) => {
    const { inputs, filter } = sceneFilter(scene, i);
    const file = join(workDir, `scene${i}.mp4`);
    ffmpeg(
      [...inputs, '-filter_complex', filter, '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-threads', '1', '-r', '30', file],
      `scene ${i}`,
    );
    sceneFiles.push(file);
  });
  const listFile = join(workDir, 'concat.txt');
  writeFileSync(listFile, sceneFiles.map((f) => `file '${f}'`).join('\n') + '\n');
  const clip = join(workDir, 'clip.mp4');
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', clip], 'concat');

  // 2. The beat: a soft 120 BPM kick + low drone + faint tick, kept quiet
  // (volume 0.55) so it supports the ad instead of clipping over it.
  const beat = join(workDir, 'beat.m4a');
  ffmpeg(
    [
      '-f', 'lavfi', '-i',
      'aevalsrc=0.5*sin(2*PI*50*mod(t\\,0.5))*exp(-mod(t\\,0.5)*22)+0.10*sin(2*PI*55*t)+0.05*sin(2*PI*6000*mod(t\\,0.25))*exp(-mod(t\\,0.25)*200):d=23',
      '-af', 'volume=0.55', '-c:a', 'aac', '-b:a', '128k', beat,
    ],
    'beat',
  );

  // 3. The press pack's official end-card + brand-badge recipe, verbatim in
  // structure: badge from frame 0 until the card, card over the last 2.5 s
  // (blur 28 px + saturation 0.35 easing in 0.8 s), code typed once the
  // field rests, caret covered white.
  const cardAt = CARD_START;
  const codeAt = CARD_START + CARD_REST;
  const cardFile = join(PRESS, 'makefun-card-9x16-transparent.webm');
  const badgeFile = join(PRESS, 'makefun-badge-9x16.png');
  const out21 = join(workDir, 'out21.mp4');
  ffmpeg(
    [
      '-i', clip, '-c:v', 'libvpx-vp9', '-i', cardFile, '-i', badgeFile,
      '-filter_complex',
      `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=60,tpad=stop_mode=clone:stop_duration=${HOLD}[base];` +
        `[base][2:v]overlay=enable='lt(t,${cardAt})',format=yuva420p,split[clip][soft];` +
        `[soft]gblur=sigma=28,eq=saturation=0.35,fade=t=in:st=${cardAt}:d=0.8:alpha=1[soft];` +
        `[clip][soft]overlay[bg];` +
        `[1:v]format=yuva420p,setpts=PTS-STARTPTS+${cardAt}/TB[card];` +
        `[bg][card]overlay=eof_action=pass,` +
        `drawbox=x=${CODE_X - 2}:y=${CODE_Y - 2}:w=9:h=82:color=white:t=fill:enable='gte(t,${codeAt})',` +
        `drawtext=fontfile=${CODE_FONT}:text=${REFERRAL_CODE}:fontsize=${CODE_SIZE}:fontcolor=0x191419:x=${CODE_X}:y=${CODE_MID_Y}-(ascent-descent)/2:enable='gte(t,${codeAt})'[v]`,
      '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-threads', '1', '-movflags', '+faststart', out21,
    ],
    'end card',
  );

  // 4. Hold the last frame 1.5 s longer so the code stays readable, add the beat.
  ffmpeg(
    [
      '-i', out21, '-i', beat,
      '-filter_complex', `[0:v]tpad=stop_mode=clone:stop_duration=1.5[v]`,
      '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-threads', '1',
      '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', outPath,
    ],
    'final',
  );
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const videoJson = join(BOT_DIR, 'VIDEO.json');
  if (!existsSync(videoJson)) {
    console.error(`VIDEO.json not found in ${BOT_DIR}: the video must be posted first.`);
    process.exit(1);
  }
  copyFileSync(videoJson, join(OUTPUT_DIR, 'VIDEO.json'));
  console.log(`VIDEO.json copied to ${OUTPUT_DIR}`);

  if (!RENDER_AD) {
    console.log('Ad render skipped (set MAKEFUN_RENDER_AD=1 to render /output/ad.mp4).');
    return;
  }
  const workDir = join(OUTPUT_DIR, '.ad-work');
  const outPath = join(OUTPUT_DIR, 'ad.mp4');
  try {
    renderAd(workDir, outPath);
    console.log(`Ad rendered to ${outPath}`);
  } catch (err) {
    // The render is best-effort: VIDEO.json is already copied, so the entry
    // still stands even if a machine has no ffmpeg or runs out of time.
    console.error(`Ad render failed (VIDEO.json is unaffected): ${(err as Error).message}`);
  }
}

main();
