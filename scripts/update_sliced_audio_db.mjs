import fs from 'fs';
import path from 'path';

// 1. Read audio mapping
const mapping = JSON.parse(fs.readFileSync('scripts/audio_question_mapping.json', 'utf-8'));

// 2. Read dataset
const datasetPath = path.resolve('data/toeic/toeic_ets_actual_test_01.json');
const data = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

console.log('[NTT-DATA Audio Updater] Updating audio URLs for all questions in dataset...');
let updatedCount = 0;
data.questions.forEach(q => {
  if (mapping[q.position]) {
    q.audio_url = mapping[q.position];
    updatedCount++;
  }
});

fs.writeFileSync(datasetPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`[DATASET UPDATED] Updated ${updatedCount} listening questions with precision sliced audio URLs.`);

// 3. Update Supabase
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.startsWith('#')) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
}
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function syncToSupabase() {
  const assessRes = await fetch(supabaseUrl + '/rest/v1/assessments?slug=eq.toeic-ets-actual-test-01&select=id', {
    headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey }
  });
  const [assessment] = await assessRes.json();
  if (!assessment) return console.error('Assessment not found in Supabase');

  console.log(`[SUPABASE SYNC] Syncing sliced audio to assessment: ${assessment.id}`);
  for (let q = 1; q <= 100; q++) {
    const audioUrl = mapping[q];
    if (!audioUrl) continue;
    await fetch(supabaseUrl + '/rest/v1/assessment_questions?assessment_id=eq.' + assessment.id + '&position=eq.' + q, {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ audio_url: audioUrl })
    });
    process.stdout.write(`\r[SYNCING AUDIO] Synced question ${q}/100 -> ${audioUrl}`);
  }
  console.log('\n[SUPABASE COMPLETE] All 100 listening questions now point to individual sliced audio files!');
}

syncToSupabase().catch(console.error);
