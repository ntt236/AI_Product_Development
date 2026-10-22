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

// Part 3 runs from 850s to 2000s
// Let's create two 10-minute snippets: Part 3 (850s to 1950s) and Part 4 (1950s to 2950s)
const inputAudio = path.resolve('public/audio/toeic/real_exam/toeic_test_01_full.mp3');

async function getP3Timestamps() {
  const p3Temp = path.resolve('scripts/part3_snippet.mp3');
  await new Promise((res, rej) => {
    execFile(ffmpeg.path, [
      '-ss', '850',
      '-t', '1100',
      '-i', inputAudio,
      '-ar', '16000',
      '-ac', '1',
      '-b:a', '32k',
      '-y',
      p3Temp
    ], (err) => err ? rej(err) : res());
  });

  console.log('Created Part 3 snippet:', fs.statSync(p3Temp).size);
  const base64Audio = fs.readFileSync(p3Temp).toString('base64');

  const prompt = `This is Part 3 of a TOEIC exam (starting from 14:10 / 850s in master).
List the start timestamp for each conversation question set:
- Questions 32-34: [mm:ss relative to start of audio (0:00 = 850s in master)]
- Questions 35-37: ...
- Questions 38-40: ...
- Questions 41-43: ...
- Questions 44-46: ...
- Questions 47-49: ...
- Questions 50-52: ...
- Questions 53-55: ...
- Questions 56-58: ...
- Questions 59-61: ...
- Questions 62-64: ...
- Questions 65-67: ...
- Questions 68-70: ...
- Part 4 directions start: ...`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
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

  const data = await response.json();
  console.log('=== PART 3 SET TIMESTAMPS ===');
  console.log(data.candidates[0].content.parts[0].text);
  fs.writeFileSync('scripts/part3_timestamps.txt', data.candidates[0].content.parts[0].text, 'utf-8');
}

getP3Timestamps().catch(console.error);
