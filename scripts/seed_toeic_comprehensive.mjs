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
const datasetPath = path.resolve('data/toeic/toeic_comprehensive_bank.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

console.log(`[NTT-Data ETL Pipeline] Loaded dataset: "${dataset.dataset_info.title}"`);
console.log(`[NTT-Data ETL Pipeline] Target Assessment: ${dataset.mock_assessment.slug}`);
console.log(`[NTT-Data ETL Pipeline] Questions count: ${dataset.mock_assessment.questions.length}`);
console.log(`[NTT-Data ETL Pipeline] Vocabulary items: ${dataset.vocabulary_bank.length}`);

async function seedDatabase() {
  const mock = dataset.mock_assessment;

  // A. Upsert Assessment
  const checkAssessmentRes = await fetch(`${supabaseUrl}/rest/v1/assessments?slug=eq.${mock.slug}&select=id`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  });
  const existingAssessment = await checkAssessmentRes.json();

  let assessmentId;
  const assessmentPayload = {
    slug: mock.slug,
    title: mock.title,
    description: mock.description,
    assessment_type: 'toeic',
    time_limit_seconds: mock.time_limit_seconds,
    total_questions: mock.questions.length,
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
    console.log(`[NTT-Data] Creating new assessment: ${mock.slug}`);
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/assessments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(assessmentPayload)
    });
    const created = await insertRes.json();
    assessmentId = created[0].id;
  }

  // B. Upsert Questions & Answers
  let qSuccess = 0;
  for (const q of mock.questions) {
    // Check if question exists by assessment_id + position
    const checkQRes = await fetch(
      `${supabaseUrl}/rest/v1/assessment_questions?assessment_id=eq.${assessmentId}&position=eq.${q.position}&select=id`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    const existingQ = await checkQRes.json();

    let questionId;
    const qPayload = {
      assessment_id: assessmentId,
      skill: q.section,
      category: q.category,
      difficulty: q.part <= 2 ? 1 : q.part <= 5 ? 2 : 3,
      level: q.part <= 2 ? 'a2' : q.part <= 5 ? 'b1' : 'b2',
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
      correct_option_id: q.correct_option_id,
      explanation: q.explanation
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

  console.log(`[NTT-Data] Successfully synced ${qSuccess} questions and answer keys into Supabase.`);
  console.log(`[NTT-Data Status] Mission Complete! Dataset ready for testing and live evaluation.`);
}

seedDatabase().catch((err) => {
  console.error('[NTT-Data Error] Pipeline execution failed:', err);
  process.exit(1);
});
