#!/usr/bin/env bash
# Build the make.fun TikTok ad (bring-the-humans-03) — see creative.md for the concept.
# Renders 4 scenes with ffmpeg, concats them, then applies the press pack's
# official end-card + brand-badge recipe (https://make.fun/press/llms.txt).
# Output: ad-tiktok.mp4 (1080x1920, 23 s, H.264 + AAC beat).
set -euo pipefail

R="$(cd "$(dirname "$0")" && pwd)"
PRESS="$R/assets/press"
FONT="$R/assets/fonts/JetBrainsMono-Bold.ttf"
BOLD=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
WORK="$R/build"
mkdir -p "$WORK"
cd "$WORK"

# ---------- Scene A (0-2.5s): HOOK, magenta ----------
ffmpeg -y -v error -f lavfi -i "color=c=0xC41C83:s=1080x1920:d=2.5:r=30" -i "$PRESS/ghost-pile-trophy.png" -filter_complex \
"[0:v]format=yuv420p[bg];[1:v]scale=520:-1[gh];[bg][gh]overlay=(W-w)/2:1150[base];[base]drawtext=fontfile=$BOLD:text='YOUR AI CAN':fontsize=128:fontcolor=white:x=(w-text_w)/2:y=560,drawtext=fontfile=$BOLD:text='WIN REAL':fontsize=128:fontcolor=white:x=(w-text_w)/2:y=700,drawtext=fontfile=$BOLD:text='MONEY?':fontsize=128:fontcolor=white:x=(w-text_w)/2:y=840,fade=t=in:st=0:d=0.25[v]" \
-map "[v]" -c:v libx264 -pix_fmt yuv420p -crf 18 -r 30 sceneA.mp4

# ---------- Scene B (2.5-7.0s): WHAT, dark ----------
ffmpeg -y -v error -f lavfi -i "color=c=0x11141B:s=1080x1920:d=4.5:r=30" -i "$PRESS/ghost-laptop-recording.png" -filter_complex \
"[0:v]format=yuv420p[bg];[1:v]scale=480:-1[gh];[bg][gh]overlay=300:1400[base];[base]drawtext=fontfile=$BOLD:text='AI AGENTS COMPETE':fontsize=84:fontcolor=white:x=(w-text_w)/2:y=500,drawtext=fontfile=$BOLD:text='FOR REAL CASH':fontsize=84:fontcolor=0xFF88C4:x=(w-text_w)/2:y=610,drawbox=x=240:y=800:w=600:h=104:color=0xC41C83:t=fill:enable='between(t,1.0,4.5)',drawtext=fontfile=$BOLD:text='\$500 BOUNTIES':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=822:enable='between(t,1.0,4.5)',drawbox=x=240:y=940:w=600:h=104:color=0xC41C83:t=fill:enable='between(t,2.0,4.5)',drawtext=fontfile=$BOLD:text='\$1,000+ PRIZES':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=962:enable='between(t,2.0,4.5)',drawbox=x=240:y=1080:w=600:h=104:color=0xC41C83:t=fill:enable='between(t,3.0,4.5)',drawtext=fontfile=$BOLD:text='PAID IN USDC':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=1102:enable='between(t,3.0,4.5)',fade=t=in:st=0:d=0.25,fade=t=out:st=4.25:d=0.25[v]" \
-map "[v]" -c:v libx264 -pix_fmt yuv420p -crf 18 -r 30 sceneB.mp4

# ---------- Scene C (7-12s): HOW, light ----------
ffmpeg -y -v error -f lavfi -i "color=c=0xFAF8FA:s=1080x1920:d=5:r=30" -i "$PRESS/ghost-spyglass.png" -filter_complex \
"[0:v]format=yuv420p[bg];[1:v]scale=520:-1[gh];[bg][gh]overlay=280:1330[base];[base]drawtext=fontfile=$BOLD:text='YOUR AGENT':fontsize=118:fontcolor=0x191419:x=(w-text_w)/2:y=520,drawtext=fontfile=$BOLD:text='BUILDS. YOU WIN.':fontsize=100:fontcolor=0xBC0C7C:x=(w-text_w)/2:y=670,drawtext=fontfile=$BOLD:text='It codes. It competes.':fontsize=52:fontcolor=0x5A5359:x=(w-text_w)/2:y=880,drawtext=fontfile=$BOLD:text='You get paid in USDC.':fontsize=52:fontcolor=0x5A5359:x=(w-text_w)/2:y=950,fade=t=in:st=0:d=0.25,fade=t=out:st=4.75:d=0.25[v]" \
-map "[v]" -c:v libx264 -pix_fmt yuv420p -crf 18 -r 30 sceneC.mp4

# ---------- Scene D (12-19s): CTA, magenta ----------
ffmpeg -y -v error -f lavfi -i "color=c=0xC41C83:s=1080x1920:d=7:r=30" -i "$PRESS/ghost-flag-wrench.png" -i "$PRESS/3-wordmark.png" -filter_complex \
"[0:v]format=yuv420p[bg];[1:v]scale=420:-1[gh];[bg][gh]overlay=330:1300[base];[2:v]scale=620:-1[wm];[base][wm]overlay=230:830[base2];[base2]drawtext=fontfile=$BOLD:text='ENTER YOUR':fontsize=120:fontcolor=white:x=(w-text_w)/2:y=480,drawtext=fontfile=$BOLD:text='AI AGENT':fontsize=120:fontcolor=white:x=(w-text_w)/2:y=630,drawtext=fontfile=$BOLD:text='Join the next bounty':fontsize=56:fontcolor=0xFF88C4:x=(w-text_w)/2:y=1010,fade=t=in:st=0:d=0.25[v]" \
-map "[v]" -c:v libx264 -pix_fmt yuv420p -crf 18 -r 30 sceneD.mp4

# ---------- Concat scenes -> 19 s clip ----------
printf "file 'sceneA.mp4'\nfile 'sceneB.mp4'\nfile 'sceneC.mp4'\nfile 'sceneD.mp4'\n" > concat.txt
ffmpeg -y -v error -f concat -safe 0 -i concat.txt -c copy clip.mp4

# ---------- Beat (23 s, 120 BPM, subtle) ----------
ffmpeg -y -v error -f lavfi -i "aevalsrc=0.5*sin(2*PI*50*mod(t\,0.5))*exp(-mod(t\,0.5)*22)+0.10*sin(2*PI*55*t)+0.05*sin(2*PI*6000*mod(t\,0.25))*exp(-mod(t\,0.25)*200):d=23" -af volume=0.55 -c:a aac -b:a 128k beat.m4a

# ---------- Pass 1: official end-card + badge recipe (HOLD=2.5) ----------
# Clip 19 s -> padded to 21.5 s; card over 19.0-21.5; code typed from 20.433 s.
ffmpeg -y -v error -i clip.mp4 -c:v libvpx-vp9 -i "$PRESS/makefun-card-9x16-transparent.webm" -i "$PRESS/makefun-badge-9x16.png" -filter_complex \
"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=60,tpad=stop_mode=clone:stop_duration=2.5[base];[base][2:v]overlay=enable='lt(t,19)',format=yuva420p,split[clip][soft];[soft]gblur=sigma=28,eq=saturation=0.35,fade=t=in:st=19:d=0.8:alpha=1[soft];[clip][soft]overlay[bg];[1:v]format=yuva420p,setpts=PTS-STARTPTS+19/TB[card];[bg][card]overlay=eof_action=pass,drawbox=x=208:y=1230:w=9:h=82:color=white:t=fill:enable='gte(t,20.433)',drawtext=fontfile=$FONT:text=r5855cny:fontsize=62:fontcolor=0x191419:x=210:y=1271-(ascent-descent)/2:enable='gte(t,20.433)'[v]" \
-map "[v]" -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart out21.mp4

# ---------- Pass 2: hold last frame +1.5 s (code stays readable) + beat ----------
ffmpeg -y -v error -i out21.mp4 -i beat.m4a -filter_complex "[0:v]tpad=stop_mode=clone:stop_duration=1.5[v]" \
-map "[v]" -map 1:a -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 128k -shortest -movflags +faststart "$R/ad-tiktok.mp4"

echo "=== DONE ==="
ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,codec_name,r_frame_rate -of default=noprint_wrappers=1 "$R/ad-tiktok.mp4"
