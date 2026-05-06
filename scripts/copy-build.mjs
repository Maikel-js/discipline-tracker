import { cpSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const releaseDir = resolve('release');
const downloadsDir = resolve('public/downloads');

const files = readdirSync(releaseDir);

const copyMap = [
  { pattern: /\.exe$/, dest: 'Discipline-Tracker-Windows.zip' },
  { pattern: /\.AppImage$/, dest: 'Discipline-Tracker.AppImage' },
  { pattern: /app-release\.apk/, dest: 'app-release.apk' },
];

for (const { pattern, dest } of copyMap) {
  const found = files.find(f => pattern.test(f));
  if (found) {
    cpSync(join(releaseDir, found), join(downloadsDir, dest), { force: true });
    console.log(`✓ Copiado: ${found} → public/downloads/${dest}`);
  }
}
