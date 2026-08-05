import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const {
  GITHUB_TOKEN = '',
  GITHUB_REPO = 'Maikel-js/discipline-tracker',
  APK_PATH = 'builds/discipline-tracker-preview.apk',
  VERSION = '',
} = process.env;

if (!GITHUB_TOKEN) {
  console.error('✗ GITHUB_TOKEN no está definido');
  console.error('  Crea un Personal Access Token en https://github.com/settings/tokens');
  console.error('  Scopes requeridos: repo (para releases)');
  process.exit(1);
}

if (!existsSync(APK_PATH)) {
  console.error(`✗ No se encontró el APK en: ${APK_PATH}`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf-8'));
const version = VERSION || pkg.version;
const tag = `v${version}`;
const assetName = 'discipline-tracker.apk';

async function api(method, path, body, isBinary = false) {
  const url = path.startsWith('http') ? path : `https://api.github.com${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'discipline-tracker-release-uploader',
      ...(isBinary ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body && !isBinary ? JSON.stringify(body) : body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} → ${res.status}\n${text}`);
  }
  return res.json();
}

async function main() {
  console.log(`Subiendo APK a GitHub Releases`);
  console.log(`  Repo: ${GITHUB_REPO}`);
  console.log(`  Tag:  ${tag}`);
  console.log(`  APK:  ${APK_PATH} (${(readFileSync(APK_PATH).length / 1024 / 1024).toFixed(1)} MB)`);

  const [owner, repo] = GITHUB_REPO.split('/');
  const base = `/repos/${owner}/${repo}`;

  let release;
  try {
    const existing = await api('GET', `${base}/releases/tags/${tag}`);
    console.log(`✓ Release ${tag} ya existe (id: ${existing.id})`);
    release = existing;
  } catch {
    const commit = await api('GET', `${base}/commits/main`);
    release = await api('POST', `${base}/releases`, {
      tag_name: tag,
      name: tag,
      body: `## Discipline Tracker ${tag}\n\nAndroid APK (${(readFileSync(APK_PATH).length / 1024 / 1024).toFixed(1)} MB) generado con EAS Build.`,
      draft: false,
      prerelease: false,
      target_commitish: commit.sha,
    });
    console.log(`✓ Release ${tag} creada (id: ${release.id})`);
  }

  const existingAssets = await api('GET', `${base}/releases/${release.id}/assets`);
  for (const a of existingAssets) {
    if (a.name === assetName) {
      console.log(`  Borrando asset previo: ${a.name}`);
      await api('DELETE', `${base}/releases/assets/${a.id}`);
    }
  }

  const buffer = readFileSync(APK_PATH);
  const uploadUrl = release.upload_url.split('{')[0];
  const uploaded = await api(
    'POST',
    `${uploadUrl}?name=${assetName}`,
    buffer,
    true,
  );
  console.log(`✓ Asset subido: ${uploaded.name} (${(uploaded.size / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`\nURL permanente: ${uploaded.browser_download_url}`);
  console.log(`URL siempre-última: https://github.com/${GITHUB_REPO}/releases/latest/download/${assetName}`);
}

main().catch((e) => {
  console.error('✗ Error:', e.message);
  process.exit(1);
});
