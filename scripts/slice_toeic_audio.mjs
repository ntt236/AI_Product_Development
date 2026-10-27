import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

const inputAudio = path.resolve('public/audio/toeic/real_exam/toeic_test_01_full.mp3');
const outDir = path.resolve('public/audio/toeic/real_exam');
fs.mkdirSync(outDir, { recursive: true });

function sliceSegment(startTime, duration, outputFile) {
  return new Promise((resolve, reject) => {
    execFile(ffmpeg.path, [
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-i', inputAudio,
      '-acodec', 'copy',
      '-y',
      outputFile
    ], (err) => {
      if (err) reject(err);
      else resolve(outputFile);
    });
  });
}

async function run() {
  console.log('[NTT-DATA Audio Slicer] Starting precision audio segmentation with verified acoustic timestamps...');
  const mapping = {};

  // ==========================================
  // PART 1 (Q1 - Q6): Exact Timestamps
  // ==========================================
  // Directions end at 106.8s
  // Q1: 107.0s -> 130.5s (23.5s) - Boat rowing
  // Q2: 130.5s -> 161.5s (31.0s) - Passengers at airport
  // Q3: 161.5s -> 188.5s (27.0s) - Computer / bookshelf
  // Q4: 188.5s -> 216.5s (28.0s) - Office discussion
  // Q5: 216.5s -> 242.5s (26.0s) - Food buffet
  // Q6: 242.5s -> 270.0s (27.5s) - Train platform
  const part1Timings = [
    { q: 1, start: 107.0, dur: 23.5 },
    { q: 2, start: 130.5, dur: 31.0 },
    { q: 3, start: 161.5, dur: 27.0 },
    { q: 4, start: 188.5, dur: 28.0 },
    { q: 5, start: 216.5, dur: 26.0 },
    { q: 6, start: 242.5, dur: 27.5 }
  ];

  for (const item of part1Timings) {
    const filename = `toeic_p1_q${item.q}.mp3`;
    const target = path.join(outDir, filename);
    await sliceSegment(item.start, item.dur, target);
    mapping[item.q] = `/audio/toeic/real_exam/${filename}`;
    console.log(`[PART 1] Sliced Question ${item.q}: ${filename} (${item.dur}s)`);
  }

  // ==========================================
  // PART 2 (Q7 - Q31): Exact Acoustic Timestamps
  // ==========================================
  const part2Timings = [
    { q: 7, start: 333.0, dur: 18.8 },
    { q: 8, start: 351.8, dur: 21.0 },
    { q: 9, start: 372.8, dur: 19.2 },
    { q: 10, start: 392.0, dur: 20.2 },
    { q: 11, start: 412.2, dur: 19.9 },
    { q: 12, start: 432.1, dur: 21.1 },
    { q: 13, start: 453.2, dur: 21.4 },
    { q: 14, start: 474.6, dur: 20.9 },
    { q: 15, start: 495.5, dur: 22.7 },
    { q: 16, start: 518.2, dur: 19.8 },
    { q: 17, start: 538.0, dur: 21.2 },
    { q: 18, start: 559.2, dur: 22.4 },
    { q: 19, start: 581.6, dur: 21.2 },
    { q: 20, start: 602.8, dur: 20.0 },
    { q: 21, start: 622.8, dur: 21.8 },
    { q: 22, start: 644.6, dur: 17.9 },
    { q: 23, start: 662.5, dur: 23.3 },
    { q: 24, start: 685.8, dur: 22.0 },
    { q: 25, start: 707.8, dur: 20.8 },
    { q: 26, start: 728.6, dur: 21.8 },
    { q: 27, start: 750.4, dur: 20.3 },
    { q: 28, start: 770.7, dur: 19.6 },
    { q: 29, start: 790.3, dur: 20.4 },
    { q: 30, start: 810.7, dur: 21.3 },
    { q: 31, start: 832.0, dur: 19.4 }
  ];

  for (const item of part2Timings) {
    const filename = `toeic_p2_q${item.q}.mp3`;
    const target = path.join(outDir, filename);
    await sliceSegment(item.start, item.dur, target);
    mapping[item.q] = `/audio/toeic/real_exam/${filename}`;
    console.log(`[PART 2] Sliced Question ${item.q}: ${filename} (${item.dur}s)`);
  }

  // ==========================================
  // PART 3 (Q32 - Q70) - 13 Conversation Sets
  // ==========================================
  const p3Sets = [
    { startQ: 32, endQ: 34, start: 874.0, dur: 76.5 },
    { startQ: 35, endQ: 37, start: 950.5, dur: 91.0 },
    { startQ: 38, endQ: 40, start: 1041.5, dur: 76.0 },
    { startQ: 41, endQ: 43, start: 1117.5, dur: 82.1 },
    { startQ: 44, endQ: 46, start: 1199.6, dur: 82.0 },
    { startQ: 47, endQ: 49, start: 1281.6, dur: 89.9 },
    { startQ: 50, endQ: 52, start: 1371.5, dur: 94.5 },
    { startQ: 53, endQ: 55, start: 1466.0, dur: 107.4 },
    { startQ: 56, endQ: 58, start: 1573.4, dur: 70.7 },
    { startQ: 59, endQ: 61, start: 1644.1, dur: 84.6 },
    { startQ: 62, endQ: 64, start: 1728.7, dur: 87.8 },
    { startQ: 65, endQ: 67, start: 1816.5, dur: 68.3 },
    { startQ: 68, endQ: 70, start: 1884.8, dur: 67.2 }
  ];

  for (const set of p3Sets) {
    const filename = `toeic_p3_q${set.startQ}_${set.endQ}.mp3`;
    const target = path.join(outDir, filename);
    await sliceSegment(set.start, set.dur, target);
    for (let q = set.startQ; q <= set.endQ; q++) {
      mapping[q] = `/audio/toeic/real_exam/${filename}`;
    }
    console.log(`[PART 3] Sliced Questions ${set.startQ}-${set.endQ}: ${filename} (${set.dur}s)`);
  }

  // ==========================================
  // PART 4 (Q71 - Q100) - 10 Talk Sets
  // ==========================================
  const p4Sets = [
    { startQ: 71, endQ: 73, start: 1980.0, dur: 89.3 },
    { startQ: 74, endQ: 76, start: 2069.3, dur: 113.1 },
    { startQ: 77, endQ: 79, start: 2182.4, dur: 94.6 },
    { startQ: 80, endQ: 82, start: 2277.0, dur: 115.9 },
    { startQ: 83, endQ: 85, start: 2392.9, dur: 91.4 },
    { startQ: 86, endQ: 88, start: 2484.3, dur: 79.7 },
    { startQ: 89, endQ: 91, start: 2564.0, dur: 101.3 },
    { startQ: 92, endQ: 94, start: 2665.3, dur: 102.8 },
    { startQ: 95, endQ: 97, start: 2768.1, dur: 96.9 },
    { startQ: 98, endQ: 100, start: 2865.0, dur: 79.0 }
  ];

  for (const set of p4Sets) {
    const filename = `toeic_p4_q${set.startQ}_${set.endQ}.mp3`;
    const target = path.join(outDir, filename);
    await sliceSegment(set.start, set.dur, target);
    for (let q = set.startQ; q <= set.endQ; q++) {
      mapping[q] = `/audio/toeic/real_exam/${filename}`;
    }
    console.log(`[PART 4] Sliced Questions ${set.startQ}-${set.endQ}: ${filename} (${set.dur}s)`);
  }

  // Save the audio mapping to JSON
  fs.writeFileSync('scripts/audio_question_mapping.json', JSON.stringify(mapping, null, 2), 'utf-8');
  console.log(`[SUCCESS] Generated calibrated audio slices for all 100 listening questions (Q1 - Q100)!`);
}

run().catch(console.error);
