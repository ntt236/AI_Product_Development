import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const testDir = join(process.cwd(), 'tests', 'assessment');
const files = readdirSync(testDir)
  .filter((f) => f.endsWith('.test.mjs'))
  .map((f) => join(testDir, f));

console.log(`Chạy ${files.length} test suite(s)...`);

const result = spawnSync('npx', ['tsx', '--test', ...files], {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 0);
