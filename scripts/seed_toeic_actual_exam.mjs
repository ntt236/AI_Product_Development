import fs from 'fs';
import path from 'path';

// 1. Read environment variables
const env = {};
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  for (const line of envFile.split('\n')) {
    const idx = line.indexOf('=');
    if (idx > 0 && !line.startsWith('#')) {
      env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
} catch (e) {
  console.warn('Could not read .env.local:', e.message);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[NTT-Data Error] Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

// 2. Read dataset JSON
const datasetPath = path.resolve('data/toeic/toeic_ets_actual_test_01.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

console.log(`[NTT-Data ETL Pipeline] Loaded dataset: "${dataset.assessment.title}"`);
console.log(`[NTT-Data ETL Pipeline] Target Assessment: ${dataset.assessment.slug}`);
console.log(`[NTT-Data ETL Pipeline] Questions count: ${dataset.questions.length}`);

async function seedDatabase() {
  const { assessment, questions } = dataset;

  // A. Upsert Assessment
  const checkAssessmentRes = await fetch(`${supabaseUrl}/rest/v1/assessments?slug=eq.${assessment.slug}&select=id`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  });
  const existingAssessment = await checkAssessmentRes.json();

  let assessmentId;
  const assessmentPayload = {
    slug: assessment.slug,
    title: assessment.title,
    description: assessment.description,
    assessment_type: 'toeic',
    time_limit_seconds: assessment.time_limit_seconds,
    total_questions: questions.length,
    is_published: true
  };

  if (existingAssessment && existingAssessment.length > 0) {
    assessmentId = existingAssessment[0].id;
    console.log(`[NTT-Data] Updating existing assessment: ${assessmentId}`);
    await fetch(`${supabaseUrl}/rest/v1/assessments?id=eq.${assessmentId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(assessmentPayload)
    });
  } else {
    console.log(`[NTT-Data] Creating new assessment: ${assessment.slug}`);
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/assessments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(assessmentPayload)
    });
    const created = await insertRes.json();
    assessmentId = created[0].id;
  }

  console.log(`[NTT-Data] Assessment ID: ${assessmentId}. Ingesting ${questions.length} questions...`);

  // B. Upsert Questions & Answers in batches of 10
  let qSuccess = 0;
  const batchSize = 10;
  for (let i = 0; i < questions.length; i += batchSize) {
    const chunk = questions.slice(i, i + batchSize);
    for (const q of chunk) {
      // Check if question exists by assessment_id + position
      const checkQRes = await fetch(
        `${supabaseUrl}/rest/v1/assessment_questions?assessment_id=eq.${assessmentId}&position=eq.${q.position}&select=id`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      const existingQ = await checkQRes.json();

      let questionId;
      const partNum = parseInt(q.category.replace('toeic_part_', ''), 10) || 1;
      const level = partNum <= 2 ? 'a2' : partNum <= 5 ? 'b1' : 'b2';

      const qPayload = {
        assessment_id: assessmentId,
        skill: q.skill,
        category: q.category,
        difficulty: partNum <= 2 ? 1 : partNum <= 5 ? 2 : 3,
        level: level,
        question_type: 'multiple_choice',
        prompt: q.prompt,
        context_text: q.context_text,
        audio_url: q.audio_url,
        options: q.options,
        position: q.position,
        weight: 1.0
      };

      if (existingQ && existingQ.length > 0) {
        questionId = existingQ[0].id;
        await fetch(`${supabaseUrl}/rest/v1/assessment_questions?id=eq.${questionId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(qPayload)
        });
      } else {
        const createQRes = await fetch(`${supabaseUrl}/rest/v1/assessment_questions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(qPayload)
        });
        const createdQ = await createQRes.json();
        questionId = createdQ[0].id;
      }

      // Upsert answer key
      const ansPayload = {
        question_id: questionId,
        correct_option_id: q.correct_answer,
        explanation: q.explanation,
        transcript_text: q.transcript_text
      };

      const checkAnsRes = await fetch(
        `${supabaseUrl}/rest/v1/assessment_question_answers?question_id=eq.${questionId}&select=id`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      const existingAns = await checkAnsRes.json();

      if (existingAns && existingAns.length > 0) {
        await fetch(`${supabaseUrl}/rest/v1/assessment_question_answers?question_id=eq.${questionId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(ansPayload)
        });
      } else {
        await fetch(`${supabaseUrl}/rest/v1/assessment_question_answers`, {
          method: 'POST',
          headers,
          body: JSON.stringify(ansPayload)
        });
      }

      qSuccess++;
    }
    process.stdout.write(`\r[NTT-Data] Upserted ${qSuccess}/${questions.length} questions & answers`);
  }

  console.log(`\n[NTT-Data] Ingestion complete: ${qSuccess} questions and answers successfully synced to Supabase.`);
}

seedDatabase().catch(err => {
  console.error('[NTT-Data Fatal]', err);
  process.exit(1);
});
