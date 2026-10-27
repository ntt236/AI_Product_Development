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

// Slice first 300 seconds (5 minutes) into a lightweight 16kHz mono mp3
const inputAudio = path.resolve('public/audio/toeic/real_exam/toeic_test_01_full.mp3');
const tempAudio = path.resolve('scripts/part1_first_5min.mp3');

execFile(ffmpeg.path, [
  '-ss', '0',
  '-t', '300',
  '-i', inputAudio,
  '-ar', '16000',
  '-ac', '1',
  '-b:a', '32k',
  '-y',
  tempAudio
], async (err) => {
  if (err) return console.error('FFmpeg error:', err);
  console.log('Created lightweight audio snippet:', fs.statSync(tempAudio).size, 'bytes');

  // Send to Gemini to transcribe with timestamps
  const base64Audio = fs.readFileSync(tempAudio).toString('base64');
  console.log('Sending to Gemini for timestamp transcription...');

  const prompt = `Transcribe this TOEIC listening audio from 0:00 to 5:00. 
For every direction and every question, provide the EXACT START TIMESTAMP in [mm:ss] format.
Specifically identify:
- When "Part 1" directions start
- When the sample question starts and ends
- When "Number 1" starts and ends (and the 4 choices A, B, C, D)
- When "Number 2" starts and ends
- When "Number 3" starts and ends
- When "Number 4" starts and ends
- When "Number 5" starts and ends
- When "Number 6" starts and ends
- When "Part 2" directions start`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'audio/mp3',
              data: base64Audio
            }
          }
        ]
      }]
    })
  });

  const data = await res.json();
  if (data.candidates && data.candidates[0]) {
    console.log('=== GEMINI TRANSCRIPTION & TIMESTAMPS ===');
    console.log(data.candidates[0].content.parts[0].text);
  } else {
    console.error('Gemini error:', JSON.stringify(data));
  }
});
