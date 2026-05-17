import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync, copyFileSync, mkdirSync, appendFileSync } from 'fs';
import { join, resolve, relative, basename } from 'path';

// --- CONFIG ---
const VAULT_PATH = resolve('C:/Users/Edwin/OneDrive/Escritorio/Code/Erwin Andres Cruz Munoz/Bovedas/disciplie-tracker');
const PROJECT_ROOT = resolve('.');

const DIARIO_DIR = join(VAULT_PATH, '00 - Diario');
const CHANGELOG_DIR = join(VAULT_PATH, '01 - Changelog');
const ADRS_DIR = join(VAULT_PATH, '02 - ADRs');
const FEATURES_DIR = join(VAULT_PATH, '03 - Features');
const DIAGRAMAS_DIR = join(VAULT_PATH, '04 - Diagramas');
const EXTRACTOS_DIR = join(VAULT_PATH, '05 - Extractos');

const CHANGELOG_FILE = join(CHANGELOG_DIR, 'CHANGELOG.md');
const COMMITS_DB = join(VAULT_PATH, '.commits-processed.json');

// --- HELPERS ---
function runGit(cmd) {
  try {
    return execSync(cmd, { cwd: PROJECT_ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, '').trim();
}

// --- GIT DATA ---
function getLastCommit() {
  const log = runGit('git log -1 --format="%H|%an|%ae|%ad|%s" --date=short');
  if (!log) return null;
  const [hash, author, email, date, ...msgParts] = log.split('|');
  const msg = msgParts.join('|');

  const files = runGit('git diff-tree --no-commit-id -r --name-only HEAD').split('\n').filter(Boolean);
  const filesFull = runGit('git diff-tree --no-commit-id -r HEAD').split('\n').filter(Boolean);

  const stats = runGit('git diff-tree --no-commit-id -r --numstat HEAD').split('\n').filter(Boolean);

  let type = 'other';
  let scope = '';
  const match = msg.match(/^(\w+)(?:\(([^)]+)\))?:/);
  if (match) {
    type = match[1];
    scope = match[2] || '';
  }

  const insertions = stats.reduce((sum, line) => { const m = line.match(/^(\d+)/); return sum + (m ? parseInt(m[1]) : 0); }, 0);
  const deletions = stats.reduce((sum, line) => {
    const parts = line.split('\t');
    return sum + (parts.length >= 2 && /^\d+$/.test(parts[0]) ? parseInt(parts[1]) : 0);
  }, 0);

  return { hash, author, email, date, msg, type, scope, files, insertions, deletions, stats, filesFull };
}

function getAllCommits() {
  const log = runGit('git log --reverse --format="%H|%an|%ae|%ad|%s" --date=short');
  if (!log) return [];
  const lines = log.split('\n').filter(Boolean);
  return lines.map((line) => {
    const [hash, author, email, date, ...msgParts] = line.split('|');
    const msg = msgParts.join('|');
    let type = 'other';
    let scope = '';
    const match = msg.match(/^(\w+)(?:\(([^)]+)\))?:/);
    if (match) {
      type = match[1];
      scope = match[2] || '';
    }
    return { hash, author, email, date, msg, type, scope };
  });
}

function getProcessedHashes() {
  try {
    return JSON.parse(readFileSync(COMMITS_DB, 'utf-8'));
  } catch {
    return [];
  }
}

function saveProcessedHash(hash) {
  const processed = getProcessedHashes();
  if (!processed.includes(hash)) {
    processed.push(hash);
    writeFileSync(COMMITS_DB, JSON.stringify(processed, null, 2));
  }
}

// --- CONTENT TEMPLATES ---
function frontmatter(title, tags, extra = {}) {
  const extras = Object.entries(extra).map(([k, v]) => `${k}: ${v}`).join('\n');
  return [
    '---',
    `title: "${title}"`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
    extras,
    '---',
    '',
  ].filter(Boolean).join('\n');
}

// --- GENERATORS ---

function generateDailyNote(commits, customDate) {
  const date = customDate || today();
  const filePath = join(DIARIO_DIR, `${date}.md`);

  let content = '';
  if (existsSync(filePath)) {
    content = readFileSync(filePath, 'utf-8');
  } else {
    content = frontmatter(`Diario ${date}`, ['diario', 'daily'], { date, week: new Date().toLocaleDateString('es-ES', { weekday: 'long' }) });
    content += `# ${date}\n\n`;
    content += `## Resumen del Día\n\n`;
    content += `## Commits\n\n`;
  }

  for (const c of commits) {
    const entry = `| ${c.hash.slice(0, 7)} | \`${c.type}\` | ${c.msg} | ${c.files?.length || 0} archivos |\n`;
    if (!content.includes(c.hash.slice(0, 7))) {
      content += entry;
    }
  }

  if (commits.some(c => c.files)) {
    content += `\n### Archivos Modificados\n\n`;
    for (const c of commits) {
      if (c.files && c.files.length > 0) {
        content += `**${c.hash.slice(0, 7)}** — ${c.msg}\n\`\`\`\n${c.files.join('\n')}\n\`\`\`\n\n`;
      }
    }
  }

  writeFileSync(filePath, content);
  console.log(`  ✓ Daily note actualizada: ${date}.md`);
}

function updateChangelog(commits) {
  const byDate = {};
  for (const c of commits) {
    if (!byDate[c.date]) byDate[c.date] = [];
    byDate[c.date].push(c);
  }

  const dates = Object.keys(byDate).sort().reverse();

  let content = '';
  if (existsSync(CHANGELOG_FILE)) {
    content = readFileSync(CHANGELOG_FILE, 'utf-8');
  } else {
    content = frontmatter('CHANGELOG', ['changelog', 'historial']);
    content += '# CHANGELOG\n\n';
    content += '## Historial de Cambios\n\n';
  }

  let hasNew = false;
  for (const date of dates) {
    const header = `### ${date}\n`;
    if (content.includes(header)) continue;
    hasNew = true;

    content += `\n${header}\n`;
    for (const c of byDate[date]) {
      const emoji = { feat: '✨', fix: '🐛', docs: '📝', style: '🎨', refactor: '♻️', perf: '⚡', test: '✅', chore: '🔧', other: '🔹' }[c.type] || '🔹';
      content += `- ${emoji} **[\`${c.type}\`]** ${c.msg} (\`${c.hash.slice(0, 7)}\`)\n`;
    }
    content += `\n📖 [Nota diaria completa](../00%20-%20Diario/${date}.md)\n`;
  }

  if (hasNew) {
    writeFileSync(CHANGELOG_FILE, content);
    console.log('  ✓ CHANGELOG actualizado');
  }
}

function updateFeatureDoc(commits) {
  for (const c of commits) {
    if (c.type !== 'feat') continue;

    // Extract feature name from scope or message
    let featureName = c.scope || c.msg.replace(/^feat(\([^)]+\))?:\s*/i, '').split(/[,:.!]/)[0].trim();
    featureName = sanitizeName(featureName);
    if (!featureName) featureName = c.hash.slice(0, 7);

    // PascalCase for the file
    const fileName = featureName
      .split(/[\s-_]+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('')
      .replace(/[^a-zA-Z0-9]/g, '');
    const filePath = join(FEATURES_DIR, `${fileName}.md`);

    let content = '';
    if (existsSync(filePath)) {
      content = readFileSync(filePath, 'utf-8');
      // Add commit entry if not already present
      const commitLine = `- \`${c.hash.slice(0, 7)}\` — ${c.date} — ${c.msg}`;
      if (!content.includes(commitLine)) {
        content = content.replace('## Commits Relacionados', `## Commits Relacionados\n${commitLine}`);
        content += c.files ? `\n### Últimos Archivos\n\`\`\`\n${(c.files || []).join('\n')}\n\`\`\`\n` : '';
      }
    } else {
      content = frontmatter(featureName, ['feature', fileName.toLowerCase()], { created: c.date, 'last-commit': c.hash.slice(0, 7) });
      content += `# ${featureName}\n\n`;
      content += `## Descripción\n\n${c.msg}\n\n`;
      content += `## Commits Relacionados\n`;
      content += `- \`${c.hash.slice(0, 7)}\` — ${c.date} — ${c.msg}\n\n`;
      if (c.files && c.files.length > 0) {
        content += `### Archivos\n\`\`\`\n${c.files.join('\n')}\n\`\`\`\n`;
      }
    }

    writeFileSync(filePath, content);
    console.log(`  ✓ Feature doc actualizada/creada: ${fileName}.md`);
  }
}

function generateADR(commits) {
  const architectural = commits.filter(c => {
    const keywords = ['refactor', 'arch', 'migrat', 'restructur', 'redesign', 'reorganiz'];
    return keywords.some(k => c.msg.toLowerCase().includes(k)) ||
           (c.files && c.files.some(f =>
             f.includes('tsconfig') || f.includes('next.config') ||
             f.includes('eslint') || f.includes('jest.config') ||
             f.includes('capacitor') || f.includes('electron/') ||
             f.includes('scripts/') || f.includes('package.json')
           ));
  });

  for (const c of architectural) {
    // Check existing ADRs to avoid duplicates
    const existing = readdirSync(ADRS_DIR).filter(f => f.endsWith('.md'));
    const adrNum = existing.length + 1;

    const filePath = join(ADRS_DIR, `ADR-${String(adrNum).padStart(3, '0')}.md`);
    if (existsSync(filePath)) continue;

    let content = frontmatter(
      `ADR-${adrNum}: ${c.msg.replace(/^(\w+)(\([^)]+\))?:\s*/i, '').slice(0, 60)}`,
      ['adr', 'decision'],
      { adr: adrNum, date: c.date, status: 'propuesto', commit: c.hash.slice(0, 7) }
    );
    const title = c.msg.replace(/^(\w+)(\([^)]+\))?:\s*/i, '').slice(0, 60);
    content += `# ADR-${adrNum}: ${title}\n\n`;
    content += `**Fecha:** ${c.date}  \n`;
    content += `**Status:** Propuesto  \n`;
    content += `**Commit:** \`${c.hash.slice(0, 7)}\`\n\n`;
    content += `## Contexto\n\n${c.msg}\n\n`;
    content += '## Decisión\n\n*(Completar manualmente)*\n\n';
    content += '## Consecuencias\n\n*(Completar manualmente)*\n\n';
    content += `## Archivos Relacionados\n\`\`\`\n${(c.files || []).join('\n')}\n\`\`\`\n`;

    writeFileSync(filePath, content);
    console.log(`  ✓ ADR creado: ADR-${String(adrNum).padStart(3, '0')}.md (borrador)`);
  }
}

function refreshDiagrams() {
  // --- Component Tree Diagram ---
  const componentsDir = join(PROJECT_ROOT, 'src', 'components');
  const appDir = join(PROJECT_ROOT, 'src', 'app');

  let componentFiles = [];
  let appFiles = [];

  if (existsSync(componentsDir)) {
    componentFiles = readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  }
  if (existsSync(appDir)) {
    appFiles = readdirSync(appDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  }

  // Detect dependencies via imports
  const deps = {};
  const allComponents = [...componentFiles.map(f => f.replace(/\.(tsx|ts)$/, '')), ...appFiles.map(f => f.replace(/\.(tsx|ts)$/, ''))];

  for (const comp of componentFiles) {
    const compPath = join(componentsDir, comp);
    const name = comp.replace(/\.(tsx|ts)$/, '');
    try {
      const content = readFileSync(compPath, 'utf-8');
      const imports = [];
      const importRegex = /from\s+['"]@\/components\/([^'"]+)['"]/g;
      let m;
      while ((m = importRegex.exec(content)) !== null) {
        imports.push(m[1].replace(/\.(tsx|ts)$/, '').split('/')[0]);
      }
      // Also detect service/store/lib imports
      const serviceRegex = /from\s+['"]@\/(services|store|types|lib)\/[^'"]+['"]/g;
      let sm;
      while ((sm = serviceRegex.exec(content)) !== null) {
        imports.push(sm[1].split('/')[0]);
      }
      deps[name] = [...new Set(imports)];
    } catch { /* skip */ }
  }

  const mermaidLines = ['graph TD'];
  mermaidLines.push('  %% Componentes');
  for (const [name, imports] of Object.entries(deps)) {
    for (const imp of imports) {
      if (allComponents.includes(imp)) {
        mermaidLines.push(`  ${name} --> ${imp}`);
      } else if (['services', 'store', 'types', 'lib'].includes(imp)) {
        mermaidLines.push(`  ${name} -.->|${imp}| ${imp}_module`);
      }
    }
  }
  // Highlight top-level components
  const topLevel = componentFiles.filter(f => {
    const name = f.replace(/\.(tsx|ts)$/, '');
    return !Object.values(deps).some(imports => imports.includes(name));
  }).map(f => f.replace(/\.(tsx|ts)$/, ''));
  mermaidLines.push('');
  mermaidLines.push('  %% Componentes raíz (sin dependencias de otros componentes)');
  for (const t of topLevel) {
    mermaidLines.push(`  style ${t} fill:#4a9eff,stroke:#2d7dff,color:#fff`);
  }

  // --- Architecture Diagram ---
  const archLines = [
    'graph TB',
    '  subgraph Plataforma',
    '    direction LR',
    '    Web[Web - Next.js Static]',
    '    Electron[Desktop - Electron]',
    '    Android[Mobile - Capacitor Android]',
    '  end',
    '  subgraph Frontend',
    '    direction TB',
    '    Components[33 Componentes React]',
    '    Store[Zustand + localStorage]',
    '    Styles[Tailwind CSS v4]',
    '    Charts[Recharts]',
    '  end',
    '  subgraph Herramientas',
    '    Jest[Jest + RTL - Tests Unit]',
    '    Playwright[Playwright - E2E]',
    '    ESLint[ESLint]',
    '  end',
    '  Web --> Frontend',
    '  Electron --> Frontend',
    '  Android --> Frontend',
    '  Frontend --> Store',
    '  Components --> Charts',
    '  Frontend --> Herramientas',
  ];

  // --- Data Flow Diagram ---
  const flowLines = [
    'graph LR',
    '  User[Usuario] --> UI[Interfaz React]',
    '  UI --> Store[Zustand Store]',
    '  Store --> LS[(localStorage)]',
    '  Store --> Components[Componentes]',
    '  Components --> Charts[Recharts Gráficos]',
    '  Components --> Notifications[Notificaciones]',
    '  Notifications -->|Capacitor| Native[Notificaciones Nativas]',
    '  Notifications -->|Web| Browser[Notificaciones Browser]',
  ];

  // --- Write Diagram files ---
  const componentsDiagram = join(DIAGRAMAS_DIR, 'Componentes.md');
  let compContent = frontmatter('Diagrama de Componentes', ['diagrama', 'componentes'], { updated: today() });
  compContent += '# Diagrama de Componentes\n\n';
  compContent += '_Actualizado automáticamente_\n\n';
  compContent += '```mermaid\n' + mermaidLines.join('\n') + '\n```\n\n';
  compContent += '### Leyenda\n';
  compContent += '- **Flecha sólida (→)**: Dependencia directa entre componentes\n';
  compContent += '- **Flecha punteada (-.->)**: Dependencia a módulo externo\n';
  compContent += '- **Fondo azul**: Componente raíz (sin dependencias de otros componentes)\n';
  writeFileSync(componentsDiagram, compContent);
  console.log('  ✓ Diagrama de Componentes actualizado');

  const archDiagram = join(DIAGRAMAS_DIR, 'Arquitectura.md');
  let archContent = frontmatter('Arquitectura del Proyecto', ['diagrama', 'arquitectura'], { updated: today() });
  archContent += '# Arquitectura del Proyecto\n\n';
  archContent += '_Actualizado automáticamente_\n\n';
  archContent += '```mermaid\n' + archLines.join('\n') + '\n```\n';
  writeFileSync(archDiagram, archContent);
  console.log('  ✓ Diagrama de Arquitectura actualizado');

  const flowDiagram = join(DIAGRAMAS_DIR, 'Flujo-de-Datos.md');
  let flowContent = frontmatter('Flujo de Datos', ['diagrama', 'flujo', 'datos'], { updated: today() });
  flowContent += '# Flujo de Datos\n\n';
  flowContent += '_Actualizado automáticamente_\n\n';
  flowContent += '```mermaid\n' + flowLines.join('\n') + '\n```\n';
  writeFileSync(flowDiagram, flowContent);
  console.log('  ✓ Diagrama de Flujo de Datos actualizado');
}

function extractSessionNotes() {
  const sessionFiles = [];
  try {
    const files = readdirSync(PROJECT_ROOT);
    for (const f of files) {
      if (f.startsWith('session-') && f.endsWith('.md')) {
        sessionFiles.push(f);
      }
    }
  } catch { /* ignore */ }

  for (const f of sessionFiles) {
    const src = join(PROJECT_ROOT, f);
    const dest = join(EXTRACTOS_DIR, f);
    if (existsSync(dest)) continue;
    try {
      copyFileSync(src, dest);
      console.log(`  ✓ Session note copiada: ${f}`);
    } catch { /* ignore */ }
  }

  if (sessionFiles.length === 0) {
    console.log('  - No hay session notes nuevas para copiar');
  }
}

// --- MAIN ---
function main() {
  const args = process.argv.slice(2);
  const processAll = args.includes('--all') || args.includes('-a');
  const isHookRun = args.includes('--hook');

  if (processAll) {
    console.log('\n📦 Generando documentación completa desde todos los commits...\n');
    const allCommits = getAllCommits();

    // Get files for all commits in one pass (batched)
    console.log('  Obteniendo datos de archivos (puede tomar unos segundos)...');
    for (const c of allCommits) {
      c.files = runGit(`git diff-tree --no-commit-id -r --name-only ${c.hash}`).split('\n').filter(Boolean);
    }

    // Group by date for daily notes
    const byDate = {};
    for (const c of allCommits) {
      if (!byDate[c.date]) byDate[c.date] = [];
      byDate[c.date].push(c);
    }

    for (const [date, commits] of Object.entries(byDate)) {
      console.log(`  Procesando ${date} (${commits.length} commits)...`);
      generateDailyNote(commits, date);
    }

    updateChangelog(allCommits);

    for (const c of allCommits) {
      if (c.type === 'feat') updateFeatureDoc([c]);
    }
    for (const c of allCommits) {
      generateADR([c]);
    }

    refreshDiagrams();
    extractSessionNotes();
    console.log('\n✅ Documentación completa generada.\n');

  } else {
    console.log('\n📝 Procesando último commit...\n');
    const commit = getLastCommit();
    if (!commit) {
      console.log('  No hay commits para procesar.');
      return;
    }

    const processed = getProcessedHashes();
    if (processed.includes(commit.hash)) {
      console.log(`  Commit ${commit.hash.slice(0, 7)} ya procesado.`);
      return;
    }

    generateDailyNote([commit]);
    updateChangelog([commit]);

    if (commit.type === 'feat') {
      updateFeatureDoc([commit]);
    }

    generateADR([commit]);
    refreshDiagrams();
    extractSessionNotes();

    saveProcessedHash(commit.hash);
    console.log(`\n✅ Commit ${commit.hash.slice(0, 7)} documentado en vault.\n`);
  }
}

main();
