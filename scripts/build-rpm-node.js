const RpmBuilder = require('rpm-builder');
const path = require('path');
const fs = require('fs');

const VERSION = '0.1.0';
const BUILD_DIR = path.join(__dirname, '..', 'dist');
const UNPACKED_DIR = path.join(BUILD_DIR, 'linux-unpacked');

console.log('Generando paquete RPM...');

const builder = new RpmBuilder({
  name: 'discipline-tracker',
  version: VERSION,
  release: '1',
  arch: 'x86_64',
  os: 'linux',
  description: 'Discipline Tracker - Sistema de seguimiento de habitos y tareas con IA avanzada',
  maintainer: 'Maikel-js <maikel@example.com>',
  url: 'https://github.com/Maikel-js/discipline-tracker',
  vendor: 'Discipline Tracker',
  license: 'MIT',
  requires: [
    'gtk3',
    'libnotify',
    'nss',
    'libXScrnSaver',
    'libXtst',
    'xdg-utils',
    'atspi2-core',
    'libuuid',
    'libsecret'
  ],
  prefix: '/opt',
  workDir: path.join(BUILD_DIR, 'rpm-work'),
  tempDir: path.join(BUILD_DIR, 'rpm-temp')
});

// Add files from linux-unpacked
const files = fs.readdirSync(UNPACKED_DIR);
files.forEach(file => {
  const srcPath = path.join(UNPACKED_DIR, file);
  const stat = fs.statSync(srcPath);
  
  if (stat.isFile()) {
    builder.files.push({
      src: srcPath,
      dest: `/opt/Discipline Tracker/${file}`,
      mode: '0755'
    });
  }
});

// Add desktop file
const desktopContent = `[Desktop Entry]
Name=Discipline Tracker
Comment=Sistema de seguimiento de habitos y tareas con IA avanzada
Exec=/opt/Discipline Tracker/discipline-tracker
Icon=discipline-tracker
Terminal=false
Type=Application
Categories=Utility;Productivity;
StartupWMClass=discipline-tracker
`;

const desktopPath = path.join(BUILD_DIR, 'discipline-tracker.desktop');
fs.writeFileSync(desktopPath, desktopContent);
builder.files.push({
  src: desktopPath,
  dest: '/usr/share/applications/discipline-tracker.desktop',
  mode: '0644'
});

// Add icon if exists
const iconPath = path.join(__dirname, '..', 'public', 'icon.png');
if (fs.existsSync(iconPath)) {
  builder.files.push({
    src: iconPath,
    dest: '/usr/share/icons/hicolor/256x256/apps/discipline-tracker.png',
    mode: '0644'
  });
}

const outputPath = path.join(BUILD_DIR, `Discipline-Tracker-${VERSION}-Linux-x86_64.rpm`);

builder.build(outputPath)
  .then(() => {
    console.log(`Paquete RPM generado: ${outputPath}`);
    const stats = fs.statSync(outputPath);
    console.log(`Tamaño: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  })
  .catch(err => {
    console.error('Error generando RPM:', err);
    process.exit(1);
  });
