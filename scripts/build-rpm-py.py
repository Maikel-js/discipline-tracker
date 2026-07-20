#!/usr/bin/env python3
import os
import subprocess
import tempfile
import shutil

VERSION = '0.1.0'
BUILD_DIR = os.path.join(os.path.dirname(__file__), '..', 'dist')
UNPACKED_DIR = os.path.join(BUILD_DIR, 'linux-unpacked')
RPM_FILE = os.path.join(BUILD_DIR, f'Discipline-Tracker-{VERSION}-Linux-x86_64.rpm')

print('Generando paquete RPM...')

# Create temp working directory
work_dir = tempfile.mkdtemp(prefix='rpm-build-')
install_dir = os.path.join(work_dir, 'opt', 'Discipline Tracker')
os.makedirs(install_dir, exist_ok=True)

# Copy app files
print('Copiando archivos de la app...')
subprocess.run(['cp', '-r', f'{UNPACKED_DIR}/.', install_dir], check=True)

# Make binary executable
binary_path = os.path.join(install_dir, 'discipline-tracker')
if os.path.exists(binary_path):
    os.chmod(binary_path, 0o755)

# Create desktop file
desktop_dir = os.path.join(work_dir, 'usr', 'share', 'applications')
os.makedirs(desktop_dir, exist_ok=True)
with open(os.path.join(desktop_dir, 'discipline-tracker.desktop'), 'w') as f:
    f.write('''[Desktop Entry]
Name=Discipline Tracker
Comment=Sistema de seguimiento de habitos y tareas con IA avanzada
Exec=/opt/Discipline Tracker/discipline-tracker
Icon=discipline-tracker
Terminal=false
Type=Application
Categories=Utility;Productivity;
StartupWMClass=discipline-tracker
''')

# Copy icon
icon_src = os.path.join(os.path.dirname(__file__), '..', 'public', 'icon.png')
icon_dir = os.path.join(work_dir, 'usr', 'share', 'icons', 'hicolor', '256x256', 'apps')
os.makedirs(icon_dir, exist_ok=True)
if os.path.exists(icon_src):
    shutil.copy(icon_src, os.path.join(icon_dir, 'discipline-tracker.png'))

# Create post-install script
postinst_path = os.path.join(work_dir, 'postinst.sh')
with open(postinst_path, 'w') as f:
    f.write('''#!/bin/bash
chmod +x "/opt/Discipline Tracker/discipline-tracker"
ln -sf "/opt/Discipline Tracker/discipline-tracker" /usr/local/bin/discipline-tracker
update-desktop-database /usr/share/applications 2>/dev/null || true
gtk-update-icon-cache /usr/share/icons/hicolor 2>/dev/null || true
''')
os.chmod(postinst_path, 0o755)

# Create pre-uninstall script
prerm_path = os.path.join(work_dir, 'prerm.sh')
with open(prerm_path, 'w') as f:
    f.write('''#!/bin/bash
rm -f /usr/local/bin/discipline-tracker
''')
os.chmod(prerm_path, 0o755)

# Use fpm via npx to create RPM
print('Construyendo RPM con fpm...')
cmd = [
    'npx', 'fpm',
    '-s', 'dir',
    '-t', 'rpm',
    '--name', 'discipline-tracker',
    '--version', VERSION,
    '--architecture', 'x86_64',
    '--description', 'Discipline Tracker - Sistema de seguimiento de habitos y tareas con IA avanzada',
    '--maintainer', 'Maikel-js <maikel@example.com>',
    '--url', 'https://github.com/Maikel-js/discipline-tracker',
    '--vendor', 'Discipline Tracker',
    '--license', 'MIT',
    '--depends', 'gtk3',
    '--depends', 'libnotify',
    '--depends', 'nss',
    '--depends', 'libXScrnSaver',
    '--depends', 'libXtst',
    '--depends', 'xdg-utils',
    '--depends', 'atspi2-core',
    '--depends', 'libuuid',
    '--depends', 'libsecret',
    '--after-install', postinst_path,
    '--before-remove', prerm_path,
    '-C', work_dir,
    '.',
    RPM_FILE
]

try:
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode == 0:
        size_mb = os.path.getsize(RPM_FILE) / 1024 / 1024
        print(f'RPM generado: {RPM_FILE}')
        print(f'Tamaño: {size_mb:.1f} MB')
    else:
        print(f'Error fpm: {result.stderr}')
        raise Exception('fpm failed')
except Exception as e:
    print(f'Error con fpm: {e}')
    # Fallback: create install script package
    print('Creando paquete alternativo con script de instalación...')
    
    tar_file = os.path.join(BUILD_DIR, f'Discipline-Tracker-{VERSION}-Linux-x86_64-fedora.tar.gz')
    
    # Create install script
    install_script = os.path.join(work_dir, 'install.sh')
    with open(install_script, 'w') as f:
        f.write(f'''#!/bin/bash
set -e
echo "Instalando Discipline Tracker {VERSION}..."

# Instalar dependencias
echo "Instalando dependencias..."
sudo dnf install -y gtk3 libnotify nss libXScrnSaver libXtst xdg-utils atspi2-core libuuid libsecret 2>/dev/null || true

# Crear directorio
sudo mkdir -p "/opt/Discipline Tracker"

# Copiar archivos
SCRIPT_DIR="$(cd "$(dirname "${{BASH_SOURCE[0]}}")" && pwd)"
sudo cp -r "$SCRIPT_DIR/opt/Discipline Tracker"/* "/opt/Discipline Tracker/"

# Permisos
sudo chmod +x "/opt/Discipline Tracker/discipline-tracker"

# Enlace simbolico
sudo ln -sf "/opt/Discipline Tracker/discipline-tracker" /usr/local/bin/discipline-tracker

# Desktop file
sudo cp "$SCRIPT_DIR/usr/share/applications/discipline-tracker.desktop" /usr/share/applications/ 2>/dev/null || true

# Icono
sudo mkdir -p /usr/share/icons/hicolor/256x256/apps
sudo cp "$SCRIPT_DIR/usr/share/icons/hicolor/256x256/apps/discipline-tracker.png" /usr/share/icons/hicolor/256x256/apps/ 2>/dev/null || true

# Actualizar caches
sudo update-desktop-database /usr/share/applications 2>/dev/null || true
sudo gtk-update-icon-cache /usr/share/icons/hicolor 2>/dev/null || true

echo ""
echo "Instalacion completada!"
echo "Ejecuta: discipline-tracker"
echo "Desinstalar: sudo rm -rf /opt/Discipline\\ Tracker /usr/local/bin/discipline-tracker"
''')
    os.chmod(install_script, 0o755)
    
    # Create uninstall script
    uninstall_script = os.path.join(work_dir, 'uninstall.sh')
    with open(uninstall_script, 'w') as f:
        f.write('''#!/bin/bash
echo "Desinstalando Discipline Tracker..."
rm -f /usr/local/bin/discipline-tracker
sudo rm -rf "/opt/Discipline Tracker"
sudo rm -f /usr/share/applications/discipline-tracker.desktop
sudo rm -f /usr/share/icons/hicolor/256x256/apps/discipline-tracker.png
sudo update-desktop-database /usr/share/applications 2>/dev/null || true
echo "Desinstalacion completada!"
''')
    os.chmod(uninstall_script, 0o755)
    
    # Create tar.gz
    subprocess.run(['tar', 'czf', tar_file, '-C', work_dir, '.'], check=True)
    size_mb = os.path.getsize(tar_file) / 1024 / 1024
    print(f'Paquete alternativo: {tar_file}')
    print(f'Tamaño: {size_mb:.1f} MB')

# Cleanup
shutil.rmtree(work_dir, ignore_errors=True)
print('Listo!')
