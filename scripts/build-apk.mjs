import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function getVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return '0.1.0';
  }
}

async function main() {
  const version = getVersion();
  const apkName = `Discipline-Tracker-v${version}.apk`;

  console.log('1/4 📦 Building Next.js...');
  execSync('npx next build', { cwd: root, stdio: 'inherit' });

  console.log('2/4 🔄 Syncing Capacitor...');
  execSync('npx cap sync', { cwd: root, stdio: 'inherit' });

  console.log('3/4 🤖 Building Android APK...');
  execSync('gradlew.bat assembleRelease', {
    cwd: join(root, 'android'),
    stdio: 'inherit',
    env: { ...process.env, JAVA_HOME: 'C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.11.10-hotspot' },
  });

  console.log('4/4 📋 Copying APK to web output...');
  const apkSource = join(
    root,
    'android',
    'app',
    'build',
    'outputs',
    'apk',
    'release',
    'app-release.apk'
  );

  const outDir = join(root, 'out', 'downloads');
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }
  const publicDir = join(root, 'public', 'downloads');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const apkDest = join(outDir, apkName);
  copyFileSync(apkSource, apkDest);
  const apkFixed = join(outDir, 'app-release.apk');
  copyFileSync(apkSource, apkFixed);
  copyFileSync(apkSource, join(publicDir, apkName));
  copyFileSync(apkSource, join(publicDir, 'app-release.apk'));

  const sizeMB = (existsSync(apkSource) ? readFileSync(apkSource).length : 0) / 1024 / 1024;
  const buildDate = new Date().toISOString().split('T')[0];
  const info = { version, sizeMB: Math.round(sizeMB * 10) / 10, buildDate };

  writeFileSync(join(publicDir, 'apk-info.json'), JSON.stringify(info, null, 2));
  writeFileSync(join(outDir, 'apk-info.json'), JSON.stringify(info, null, 2));

  console.log(`\n✅ APK generado: out/downloads/${apkName}`);
  console.log(`   Tamaño: ${sizeMB | 0} MB`);
  console.log('   También disponible como: out/downloads/app-release.apk');
  console.log('   Copiado a public/downloads/ para desarrollo.');
  console.log('   Listo para descargar desde la web.');
}

main().catch((err) => {
  console.error('❌ Build falló:', err.message);
  process.exit(1);
});
