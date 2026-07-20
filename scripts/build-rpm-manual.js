const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const zlib = require('zlib');

const VERSION = '0.1.0';
const BUILD_DIR = path.join(__dirname, '..', 'dist');
const UNPACKED_DIR = path.join(BUILD_DIR, 'linux-unpacked');
const RPM_FILE = path.join(BUILD_DIR, `Discipline-Tracker-${VERSION}-Linux-x86_64.rpm`);

console.log('Generando paquete RPM manualmente...');

// Step 1: Create cpio archive from linux-unpacked
const CPIO_FILE = path.join(BUILD_DIR, 'payload.cpio.gz');
const RPM_WORK = path.join(BUILD_DIR, 'rpm-manual');
const INSTALL_ROOT = path.join(RPM_WORK, 'opt', 'Discipline Tracker');

// Clean and create dirs
execSync(`rm -rf ${RPM_WORK}`);
execSync(`mkdir -p ${INSTALL_ROOT}`);
execSync(`mkdir -p ${RPM_WORK}/usr/share/applications`);
execSync(`mkdir -p ${RPM_WORK}/usr/share/icons/hicolor/256x256/apps`);

// Copy app files
execSync(`cp -r ${UNPACKED_DIR}/* "${INSTALL_ROOT}/"`);

// Create desktop file
fs.writeFileSync(path.join(RPM_WORK, 'usr/share/applications/discipline-tracker.desktop'), `[Desktop Entry]
Name=Discipline Tracker
Comment=Sistema de seguimiento de habitos y tareas con IA avanzada
Exec=/opt/Discipline Tracker/discipline-tracker
Icon=discipline-tracker
Terminal=false
Type=Application
Categories=Utility;Productivity;
StartupWMClass=discipline-tracker
`);

// Copy icon
const iconSrc = path.join(__dirname, '..', 'public', 'icon.png');
if (fs.existsSync(iconSrc)) {
  execSync(`cp "${iconSrc}" ${RPM_WORK}/usr/share/icons/hicolor/256x256/apps/discipline-tracker.png`);
}

// Create cpio archive
console.log('Creando cpio archive...');
const cpioContent = fs.readdirSync(RPM_WORK, { recursive: true });
let cpioList = '';
cpioContent.forEach(item => {
  const fullPath = path.join(RPM_WORK, item);
  const stat = fs.statSync(fullPath);
  if (stat.isFile()) {
    cpioList += `./${item}\n`;
  }
});

// Use find + cpio to create archive
execSync(`cd ${RPM_WORK} && find . -type f | cpio -o -H newc 2>/dev/null | gzip -9 > ${CPIO_FILE}`);

const cpioSize = fs.statSync(CPIO_FILE).size;
console.log(`CPIO archive: ${(cpioSize / 1024 / 1024).toFixed(1)} MB`);

// Step 2: Create RPM manually
// RPM format: Lead + Signature + Header + Payload

// RPM Lead (96 bytes)
const lead = Buffer.alloc(96);
lead.writeUInt32BE(0xedabeedb, 0); // magic
lead.writeUInt16BE(3, 4); // major version
lead.writeUInt16BE(0, 6); // minor version
lead.writeUInt16BE(0, 8); // type: binary
lead.writeUInt16BE(1, 10); // arch: x86_64
lead.write('discipline-tracker', 12, 66, 'ascii'); // name
lead.writeUInt16BE(VERSION.length, 78); // os major
lead.writeUInt16BE(1, 80); // os minor
lead.writeUInt16BE(0, 82); // signature type

// For simplicity, let's use a prebuilt approach
// Actually, let's just use fpm from npm
console.log('Usando fpm para generar RPM...');

try {
  // Try to use fpm directly
  const fpmCmd = `npx fpm -s dir -t rpm \
    --name discipline-tracker \
    --version ${VERSION} \
    --architecture x86_64 \
    --description "Discipline Tracker - Sistema de seguimiento de habitos y tareas con IA avanzada" \
    --maintainer "Maikel-js <maikel@example.com>" \
    --url "https://github.com/Maikel-js/discipline-tracker" \
    --vendor "Discipline Tracker" \
    --license "MIT" \
    --depends gtk3 \
    --depends libnotify \
    --depends nss \
    --depends libXScrnSaver \
    --depends libXtst \
    --depends xdg-utils \
    --depends atspi2-core \
    --depends libuuid \
    --depends libsecret \
    --after-install scripts/rpm-postinst.sh \
    --before-remove scripts/rpm-prerm.sh \
    -C ${RPM_WORK} \
    ./opt=.opt \
    .usr=.usr \
    ${RPM_FILE}`;
  
  execSync(fpmCmd, { stdio: 'inherit' });
  console.log(`RPM generado: ${RPM_FILE}`);
} catch (e) {
  console.error('Error con fpm:', e.message);
  console.log('Creando paquete alternativo...');
  
  // Create a tar.gz as fallback
  const tarFile = path.join(BUILD_DIR, `Discipline-Tracker-${VERSION}-Linux-x86_64-fedora.tar.gz`);
  execSync(`cd ${RPM_WORK} && tar czf ${tarFile} .`);
  console.log(`Paquete alternativo: ${tarFile}`);
}

// Cleanup
execSync(`rm -rf ${RPM_WORK} ${CPIO_FILE}`);
console.log('Listo!');
