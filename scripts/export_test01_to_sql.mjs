import fs from 'fs';
import path from 'path';

function exportSql() {
  const data = JSON.parse(fs.readFileSync('data/toeic/toeic_ets_actual_test_01.json', 'utf-8'));
  const { assessment, questions } = data;

  const escapeSql = (str) => {
    if (str === null || str === undefined) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
  };

  const lines = [
    `-- ============================================================================`,
    `-- Migration: 20261022_toeic_ets_actual_test_01.sql`,
    `-- Description: Seed full 200-question ETS TOEIC Actual Test 01 (Parts 1-7)`,
    `-- Author: NTT-Data (DATA-NTT-4F8B2C) / Lead Data & Intelligence Engineer`,
    `-- ============================================================================`,
    ``,
    `DO $$`,
    `DECLARE`,
    `  v_assessment_id UUID;`,
    `  v_question_id UUID;`,
    `BEGIN`,
    `  -- 1. Insert or update Assessment`,
    `  SELECT id INTO v_assessment_id FROM assessments WHERE slug = ${escapeSql(assessment.slug)};`,
    `  IF v_assessment_id IS NULL THEN`,
    `    INSERT INTO assessments (slug, title, description, assessment_type, time_limit_seconds, total_questions, is_published)`,
    `    VALUES (`,
    `      ${escapeSql(assessment.slug)},`,
    `      ${escapeSql(assessment.title)},`,
    `      ${escapeSql(assessment.description)},`,
    `      'toeic',`,
    `      ${assessment.time_limit_seconds},`,
    `      ${questions.length},`,
    `      true`,
    `    )`,
    `    RETURNING id INTO v_assessment_id;`,
    `  ELSE`,
    `    UPDATE assessments SET`,
    `      title = ${escapeSql(assessment.title)},`,
    `      description = ${escapeSql(assessment.description)},`,
    `      time_limit_seconds = ${assessment.time_limit_seconds},`,
    `      total_questions = ${questions.length},`,
    `      is_published = true`,
    `    WHERE id = v_assessment_id;`,
    `  END IF;`,
    ``
  ];

  for (const q of questions) {
    const partNum = parseInt(q.category.replace('toeic_part_', ''), 10) || 1;
    const level = partNum <= 2 ? 'a2' : partNum <= 5 ? 'b1' : 'b2';
    const difficulty = partNum <= 2 ? 1 : partNum <= 5 ? 2 : 3;
    const optionsJson = JSON.stringify(q.options).replace(/'/g, "''");

    lines.push(`  -- Question #${q.position} (${q.category})`);
    lines.push(`  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = ${q.position};`);
    lines.push(`  IF v_question_id IS NULL THEN`);
    lines.push(`    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)`);
    lines.push(`    VALUES (v_assessment_id, ${escapeSql(q.skill)}, ${escapeSql(q.category)}, ${difficulty}, '${level}', 'multiple_choice', ${escapeSql(q.prompt)}, ${escapeSql(q.context_text)}, ${escapeSql(q.audio_url)}, '${optionsJson}'::jsonb, ${q.position}, 1.0)`);
    lines.push(`    RETURNING id INTO v_question_id;`);
    lines.push(`  ELSE`);
    lines.push(`    UPDATE assessment_questions SET`);
    lines.push(`      skill = ${escapeSql(q.skill)},`);
    lines.push(`      category = ${escapeSql(q.category)},`);
    lines.push(`      difficulty = ${difficulty},`);
    lines.push(`      level = '${level}',`);
    lines.push(`      prompt = ${escapeSql(q.prompt)},`);
    lines.push(`      context_text = ${escapeSql(q.context_text)},`);
    lines.push(`      audio_url = ${escapeSql(q.audio_url)},`);
    lines.push(`      options = '${optionsJson}'::jsonb`);
    lines.push(`    WHERE id = v_question_id;`);
    lines.push(`  END IF;`);
    lines.push(``);
    lines.push(`  -- Answer for #${q.position}`);
    lines.push(`  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;`);
    lines.push(`  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)`);
    lines.push(`  VALUES (v_question_id, ${escapeSql(q.correct_answer)}, ${escapeSql(q.explanation)}, ${escapeSql(q.transcript_text)});`);
    lines.push(``);
  }

  lines.push(`END $$;`);

  const outSql = path.resolve('supabase/migrations/20261022_toeic_ets_actual_test_01.sql');
  fs.writeFileSync(outSql, lines.join('\n'), 'utf-8');
  console.log(`Generated migration SQL at ${outSql} (${(fs.statSync(outSql).size / 1024).toFixed(1)} KB)`);
}

exportSql();
