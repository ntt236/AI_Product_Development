import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function downloadAndProcessAllTest01Images() {
  const dir = path.join(process.cwd(), 'public', 'images', 'toeic', 'real_exam');
  fs.mkdirSync(dir, { recursive: true });

  const listeningImages = [
    'listen_page_25.png',
    'listen_page_26.png',
    'listen_page_27.png',
    'listen_page_34.png',
    'listen_page_36.png',
    'listen_page_38.png',
    'listen_page_40.png',
    'listen_page_41.png'
  ];

  const readingImages = [];
  for (let i = 15; i <= 60; i++) {
    readingImages.push(`read_page_${i}.png`);
  }

  const allImages = [...new Set([...listeningImages, ...readingImages])];
  console.log(`[NTT-DATA Image Harvester] Checking & Downloading ${allImages.length} images for ETS Test 01...`);

  let downloadedCount = 0;
  let existingCount = 0;

  for (const img of allImages) {
    const target = path.join(dir, img);
    if (fs.existsSync(target) && fs.statSync(target).size > 1000) {
      existingCount++;
      continue;
    }
    const url = `https://raw.githubusercontent.com/TastyHeadphones/TOEIC/main/TOEIC_%E7%B2%BE%E8%AF%BB%E8%A7%A3%E6%9E%90%E5%8C%85/images/${img}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(target, buf);
        downloadedCount++;
        console.log(`[SUCCESS] Downloaded ${img} (${(buf.length / 1024).toFixed(1)} KB)`);
      } else {
        console.warn(`[WARN] Failed to download ${img}: HTTP ${res.status}`);
      }
    } catch (e) {
      console.warn(`[ERROR] ${img}: ${e.message}`);
    }
  }

  console.log(`[SUMMARY] Images checked: ${allImages.length}. Already cached: ${existingCount}. Newly downloaded: ${downloadedCount}.`);

  // Crop exact individual Part 1 photos (Q1 - Q6)
  console.log('[NTT-DATA] Cropping high-resolution individual Part 1 question photographs (Q1 - Q6)...');
  const p25 = path.join(dir, 'listen_page_25.png');
  const p26 = path.join(dir, 'listen_page_26.png');
  const p27 = path.join(dir, 'listen_page_27.png');

  if (fs.existsSync(p25) && fs.existsSync(p26) && fs.existsSync(p27)) {
    // Q1: Raft / Boat
    await sharp(p25)
      .extract({ left: 165, top: 785, width: 760, height: 535 })
      .toFile(path.join(dir, 'toeic_part1_q1.png'));

    // Q2: Airplanes on tarmac
    await sharp(p26)
      .extract({ left: 165, top: 55, width: 760, height: 470 })
      .toFile(path.join(dir, 'toeic_part1_q2.png'));

    // Q3: Bookshelf & office desk
    await sharp(p26)
      .extract({ left: 165, top: 580, width: 760, height: 450 })
      .toFile(path.join(dir, 'toeic_part1_q3.png'));

    // Q4: Car dealership paperwork meeting
    await sharp(p26)
      .extract({ left: 165, top: 1115, width: 760, height: 400 })
      .toFile(path.join(dir, 'toeic_part1_q4.png'));

    // Q5: Buffet dinner serving table
    await sharp(p27)
      .extract({ left: 165, top: 35, width: 760, height: 480 })
      .toFile(path.join(dir, 'toeic_part1_q5.png'));

    // Q6: Canal St. subway station platform
    await sharp(p27)
      .extract({ left: 165, top: 680, width: 760, height: 380 })
      .toFile(path.join(dir, 'toeic_part1_q6.png'));

    console.log('[SUCCESS] All 6 individual Part 1 photographs cropped & ready: toeic_part1_q1.png -> q6.png');
  }

  console.log(`[STORAGE READY] All assets stored at: ${dir}`);
}

downloadAndProcessAllTest01Images();
