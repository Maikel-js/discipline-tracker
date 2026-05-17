import { writeFileSync, readFileSync, chmodSync, existsSync } from 'fs';
import { resolve } from 'path';

const HOOKS_DIR = resolve('.git/hooks');
const POST_COMMIT = resolve(HOOKS_DIR, 'post-commit');
const PROJECT_ROOT = resolve('.');

const POST_COMMIT_CONTENT = `#!/bin/sh
# Git LFS hook (preserved)
command -v git-lfs >/dev/null 2>&1 || { printf >&2 "\\n%s\\n\\n" "This repository is configured for Git LFS but 'git-lfs' was not found on your path. If you no longer wish to use Git LFS, remove this hook by deleting the 'post-commit' file in the hooks directory (set by 'core.hookspath'; usually '.git/hooks')."; exit 2; }
git lfs post-commit "$@"

# Discipline Tracker - Docs to Obsidian Vault
node "${PROJECT_ROOT.replace(/\\/g, '/')}/scripts/docs-to-vault.mjs" --hook
`;

function install() {
  console.log('🔧 Instalando hook post-commit...\n');

  // Create hooks directory if it doesn't exist
  if (!existsSync(HOOKS_DIR)) {
    console.error('✗ .git/hooks/ no encontrado. ¿Estás en la raíz del repo?');
    process.exit(1);
  }

  // Backup existing hook
  if (existsSync(POST_COMMIT)) {
    const existing = readFileSync(POST_COMMIT, 'utf-8');
    const backupPath = POST_COMMIT + '.bak';
    writeFileSync(backupPath, existing);
    console.log(`  ✓ Backup del hook existente: post-commit.bak`);
  }

  // Write new hook
  writeFileSync(POST_COMMIT, POST_COMMIT_CONTENT);

  // Make executable (best effort on Windows)
  try { chmodSync(POST_COMMIT, 0o755); } catch { /* Windows may not support chmod */ }

  console.log(`  ✓ post-commit hook instalado`);
  console.log(`  ✓ Se ejecutará: node scripts/docs-to-vault.mjs --hook`);
  console.log(`\n✅ Hook instalado correctamente.\n`);

  // Also show manual command
  console.log('📌 También puedes ejecutar manualmente:');
  console.log('   npm run docs:vault           # Último commit');
  console.log('   npm run docs:vault:all       # Historial completo');
}

install();
