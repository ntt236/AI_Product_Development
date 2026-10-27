import fs from 'fs';
import path from 'path';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { execFile } from 'child_process';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.startsWith('#')) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
}
const apiKey = env.GEMINI_API_KEY;

// Slice 04:30 to 15:00 (from 270s to 900s, total 630s)
const inputAudio = path.resolve('public/audio/toeic/real_exam/toeic_test_01_full.mp3');
const tempAudio = path.resolve('scripts/part2_audio_snippet.mp3');

execFile(ffmpeg.path, [
  '-ss', '270',
  '-t', '630',
  '-i', inputAudio,
  '-ar', '16000',
  '-ac', '1',
  '-b:a', '32k',
  '-y',
  tempAudio
], async (err) => {
  if (err) return console.error('FFmpeg error:', err);
  console.log('Created Part 2 snippet:', fs.statSync(tempAudio).size, 'bytes');

  const base64Audio = fs.readFileSync(tempAudio).toString('base64');
  console.log('Sending Part 2 to Gemini for timestamp transcription...');

  const prompt = `This is Part 2 of a TOEIC exam (starting from 4:30 in the original recording).
Please transcribe the start timestamp of each question from "Number 7" to "Number 31".
Format:
Number 7: [mm:ss relative to start of audio (0:00 = 4:30 in master)]
Number 8: ...
up to Number 31.
Also mention when Part 3 directions start.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'audio/mp3', data: base64Audio } }
        ]
      }]
    })
  });

  const data = await res.json();
  if (data.candidates && data.candidates[0]) {
    console.log('=== PART 2 TRANSCRIPTION & TIMESTAMPS ===');
    console.log(data.candidates[0].content.parts[0].text);
    fs.writeFileSync('scripts/part2_timestamps.txt', data.candidates[0].content.parts[0].text, 'utf-8');
  } else {
    console.error('Gemini error:', JSON.stringify(data));
  }
});
