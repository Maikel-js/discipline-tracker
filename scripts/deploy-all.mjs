import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

const ROOT = resolve('.');

function run(cmd, cwd = ROOT) {
  console.log(`\n> ${cmd}`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit', shell: true });
  } catch (e) {
    console.error(`✗ Failed: ${cmd}`);
    process.exit(1);
  }
}

function step(msg) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${msg}`);
  console.log('='.repeat(60));
}

async function deployWeb() {
  step('1/3: Building Next.js static export...');
  run('npm run build');
  console.log('✓ Next.js build complete (out/)');
  console.log('  Push to main to deploy on Vercel (auto-deploy via git integration)');
}

async function deployDesktop() {
  step('2/3: Building Electron apps...');

  if (process.platform === 'win32') {
    console.log('  Building Windows .exe...');
    run('npm run electron:build:win');
    console.log('✓ Windows build complete (dist/)');
  }

  if (process.platform === 'linux') {
    console.log('  Building Linux AppImage...');
    run('npm run electron:build:linux');
    console.log('✓ Linux build complete (dist/)');
  }

  const distDir = join(ROOT, 'dist');
  if (existsSync(distDir)) {
    run('npm run upload');
  } else {
    console.log('  (dist/ not found, skipping upload)');
  }
}

async function deployBackend() {
  step('3/3: Backend deployment...');
  console.log('  Backend deploys automatically via Render.com');
  console.log('  Render config: render.yaml');
  console.log('  Dashboard: https://dashboard.render.com');
  console.log('  Service: discipline-tracker-api');
  console.log('\n  Required environment variables (set in Render dashboard):');
  console.log('    SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM');
}

async function main() {
  const args = process.argv.slice(2);
  const all = args.length === 0 || args.includes('all');
  const web = all || args.includes('web');
  const desktop = all || args.includes('desktop');
  const backend = all || args.includes('backend');

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     Discipline Tracker - Deploy All              ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Web:     ${web ? '✓' : '✗'}`);
  console.log(`  Desktop: ${desktop ? '✓' : '✗'}`);
  console.log(`  Backend: ${backend ? '✓' : '✗'}`);
  console.log('');

  if (web) await deployWeb();
  if (desktop) await deployDesktop();
  if (backend) await deployBackend();

  console.log(`\n${'='.repeat(60)}`);
  console.log('  ✅ Deploy complete!');
  console.log('  🌐 Web:   https://discipline-tracker-rho.vercel.app');
  console.log('  ⚙️ API:   https://discipline-tracker-api.onrender.com');
  console.log(`${'='.repeat(60)}`);
}

main();
