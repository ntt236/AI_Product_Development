import sharp from 'sharp';
import path from 'path';

async function cropAllSixExact() {
  const p25 = path.resolve('public/images/toeic/real_exam/listen_page_25.png');
  const p26 = path.resolve('public/images/toeic/real_exam/listen_page_26.png');
  const p27 = path.resolve('public/images/toeic/real_exam/listen_page_27.png');
  const outDir = path.resolve('public/images/toeic/real_exam');

  // Q1: Raft / Boat
  await sharp(p25)
    .extract({ left: 165, top: 785, width: 760, height: 535 })
    .toFile(path.join(outDir, 'toeic_part1_q1.png'));

  // Q2: Airplanes on tarmac
  await sharp(p26)
    .extract({ left: 165, top: 55, width: 760, height: 470 })
    .toFile(path.join(outDir, 'toeic_part1_q2.png'));

  // Q3: Bookshelf & office desk
  await sharp(p26)
    .extract({ left: 165, top: 580, width: 760, height: 450 })
    .toFile(path.join(outDir, 'toeic_part1_q3.png'));

  // Q4: Car dealership paperwork meeting
  await sharp(p26)
    .extract({ left: 165, top: 1115, width: 760, height: 400 })
    .toFile(path.join(outDir, 'toeic_part1_q4.png'));

  // Q5: Buffet dinner serving table
  await sharp(p27)
    .extract({ left: 165, top: 35, width: 760, height: 480 })
    .toFile(path.join(outDir, 'toeic_part1_q5.png'));

  // Q6: Canal St. subway station platform
  await sharp(p27)
    .extract({ left: 165, top: 680, width: 760, height: 380 })
    .toFile(path.join(outDir, 'toeic_part1_q6.png'));

  console.log('Successfully cropped all 6 individual Part 1 photographic images!');
}

cropAllSixExact().catch(console.error);
