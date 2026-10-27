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
const inputAudio = path.resolve('public/audio/toeic/real_exam/toeic_test_01_full.mp3');

async function transcribeChunk(startSec, durationSec, promptText) {
  const tmp = path.resolve(`scripts/chunk_${startSec}.mp3`);
  await new Promise((res, rej) => {
    execFile(ffmpeg.path, [
      '-ss', startSec.toString(),
      '-t', durationSec.toString(),
      '-i', inputAudio,
      '-ar', '16000',
      '-ac', '1',
      '-b:a', '32k',
      '-y',
      tmp
    ], err => err ? rej(err) : res());
  });

  const base64Audio = fs.readFileSync(tmp).toString('base64');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: promptText },
          { inlineData: { mimeType: 'audio/mp3', data: base64Audio } }
        ]
      }]
    })
  });
  const data = await response.json();
  if (data.candidates && data.candidates[0]) {
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error(JSON.stringify(data));
}

async function main() {
  console.log('Transcribing Part 3 (850s to 1400s)...');
  const p3a = await transcribeChunk(850, 550, 'This is TOEIC Part 3 (first half, 850s in master). Give start timestamp (mm:ss relative to 0:00 = 850s) for "Questions 32-34", "Questions 35-37", "Questions 38-40", "Questions 41-43", "Questions 44-46", "Questions 47-49", "Questions 50-52".');
  console.log('Part 3 First Half:\n', p3a);

  console.log('Transcribing Part 3 (1400s to 1950s)...');
  const p3b = await transcribeChunk(1400, 550, 'This is TOEIC Part 3 (second half, 1400s in master). Give start timestamp (mm:ss relative to 0:00 = 1400s) for "Questions 53-55", "Questions 56-58", "Questions 59-61", "Questions 62-64", "Questions 65-67", "Questions 68-70", and when Part 4 starts.');
  console.log('Part 3 Second Half:\n', p3b);

  console.log('Transcribing Part 4 (1950s to 2950s)...');
  const p4 = await transcribeChunk(1950, 1000, 'This is TOEIC Part 4 (1950s in master). Give start timestamp (mm:ss relative to 0:00 = 1950s) for sets: Questions 71-73, 74-76, 77-79, 80-82, 83-85, 86-88, 89-91, 92-94, 95-97, 98-100.');
  console.log('Part 4:\n', p4);
}

main().catch(console.error);
