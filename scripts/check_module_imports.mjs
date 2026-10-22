import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const installedPackages = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  'react/jsx-runtime',
  'next/navigation',
  'next/link',
  'next/image',
  'next/server',
  'next/headers',
  'next/font/google',
  'node:test',
  'node:assert/strict',
  'node:fs',
  'node:path',
  'node:url',
  'node:crypto',
  'node:stream',
  'node:os',
  'node:child_process',
  'node:events'
]);

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(getFiles(fullPath));
      }
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = [...getFiles('src'), ...getFiles('tests'), ...getFiles('scripts')];
console.log(`Checking ${allFiles.length} files across src, tests, scripts...`);

const issues = [];

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    // Match actual import or export ... from statements or require()
    const match = trimmed.match(/^(?:import|export)\s+.*?\s+from\s+['"]([^'"]+)['"]/);
    const dynamicMatch = !match && trimmed.match(/(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    const bareImportMatch = !match && !dynamicMatch && trimmed.match(/^import\s+['"]([^'"]+)['"]/);

    const m = match || dynamicMatch || bareImportMatch;
    if (m) {
      const specifier = m[1];

      // Node built-in
      if (specifier.startsWith('node:') || ['fs', 'path', 'http', 'https', 'crypto', 'stream', 'os', 'child_process', 'assert', 'events', 'url'].includes(specifier)) {
        return;
      }

      if (specifier.startsWith('.') || specifier.startsWith('@/')) {
        let basePath;
        if (specifier.startsWith('@/')) {
          basePath = path.join(process.cwd(), 'src', specifier.slice(2));
        } else {
          basePath = path.resolve(path.dirname(filePath), specifier);
        }

        const exactExists = fs.existsSync(basePath) && !fs.statSync(basePath).isDirectory();
        if (exactExists) return;

        const candidates = [
          basePath + '.ts',
          basePath + '.tsx',
          basePath + '.js',
          basePath + '.mjs',
          path.join(basePath, 'index.ts'),
          path.join(basePath, 'index.tsx'),
          path.join(basePath, 'index.js'),
          path.join(basePath, 'index.mjs')
        ];

        const candidateFound = candidates.some(c => fs.existsSync(c) && !fs.statSync(c).isDirectory());

        if (!candidateFound) {
          issues.push({
            file: filePath,
            line: index + 1,
            specifier,
            reason: 'Module file or candidate does not exist'
          });
        } else if (specifier.endsWith('.js') && !fs.existsSync(basePath)) {
          issues.push({
            file: filePath,
            line: index + 1,
            specifier,
            reason: 'Specified .js extension but only .ts exists (ESM failure in Node.js test runner)'
          });
        }
      } else {
        const rootPkg = specifier.startsWith('@') 
          ? specifier.split('/').slice(0, 2).join('/') 
          : specifier.split('/')[0];

        if (!installedPackages.has(rootPkg) && !installedPackages.has(specifier)) {
          issues.push({
            file: filePath,
            line: index + 1,
            specifier,
            reason: `Package '${rootPkg}' is not listed in package.json dependencies`
          });
        }
      }
    }
  });
}

console.log(`Audit complete. Found ${issues.length} issues.`);
if (issues.length > 0) {
  console.log(JSON.stringify(issues, null, 2));
} else {
  console.log('ALL MODULE IMPORTS AND SPECIFIERS ARE 100% VALID.');
}
