#!/bin/bash
# Genera paquete .rpm desde linux-unpacked usando ar + tar
set -e

VERSION="0.1.0"
PKG_NAME="discipline-tracker"
BUILD_DIR="dist/rpm-build"

echo "Generando paquete .rpm..."

# Crear estructura
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/opt/Discipline Tracker"
mkdir -p "$BUILD_DIR/usr/share/applications"
mkdir -p "$BUILD_DIR/usr/share/icons/hicolor/256x256/apps"

# Copiar archivos
cp -r dist/linux-unpacked/* "$BUILD_DIR/opt/Discipline Tracker/"

# Crear .desktop file
cat > "$BUILD_DIR/usr/share/applications/discipline-tracker.desktop" << EOF
[Desktop Entry]
Name=Discipline Tracker
Comment=Sistema de seguimiento de habitos y tareas con IA avanzada
Exec=/opt/Discipline Tracker/discipline-tracker
Icon=discipline-tracker
Terminal=false
Type=Application
Categories=Utility;Productivity;
StartupWMClass=discipline-tracker
EOF

# Copiar icono
if [ -f "public/icon.png" ]; then
    cp public/icon.png "$BUILD_DIR/usr/share/icons/hicolor/256x256/apps/discipline-tracker.png"
fi

# Crear script de instalacion
cat > "$BUILD_DIR/install.sh" << 'INSTALLEOF'
#!/bin/bash
set -e
echo "Instalando Discipline Tracker..."

# Copiar archivos
cp -r "/opt/Discipline Tracker"/* /opt/Discipline\ Tracker/ 2>/dev/null || \
    sudo cp -r "$(dirname "$0")/opt/Discipline Tracker"/* /opt/Discipline\ Tracker/

# Crear enlace simbolico
sudo ln -sf "/opt/Discipline Tracker/discipline-tracker" /usr/local/bin/discipline-tracker

# Copiar archivos del sistema
sudo cp "$(dirname "$0")/usr/share/applications/discipline-tracker.desktop" /usr/share/applications/
sudo cp "$(dirname "$0")/usr/share/icons/hicolor/256x256/apps/discipline-tracker.png" /usr/share/icons/hicolor/256x256/apps/ 2>/dev/null || true

# Actualizar caches
sudo update-desktop-database /usr/share/applications 2>/dev/null || true
sudo gtk-update-icon-cache /usr/share/icons/hicolor 2>/dev/null || true

chmod +x "/opt/Discipline Tracker/discipline-tracker"

echo "Instalacion completada!"
echo "Ejecuta: discipline-tracker"
INSTALLEOF
chmod +x "$BUILD_DIR/install.sh"

# Crear script de desinstalacion
cat > "$BUILD_DIR/uninstall.sh" << 'UNINSTALLEOF'
#!/bin/bash
echo "Desinstalando Discipline Tracker..."
rm -f /usr/local/bin/discipline-tracker
sudo rm -rf "/opt/Discipline Tracker"
sudo rm -f /usr/share/applications/discipline-tracker.desktop
sudo rm -f /usr/share/icons/hicolor/256x256/apps/discipline-tracker.png
sudo update-desktop-database /usr/share/applications 2>/dev/null || true
echo "Desinstalacion completada!"
UNINSTALLEOF
chmod +x "$BUILD_DIR/uninstall.sh"

# Crear script de instalacion para fedora (usa dnf)
cat > "$BUILD_DIR/install-fedora.sh" << 'FEDORAEOF'
#!/bin/bash
set -e
echo "Instalando dependencias..."
sudo dnf install -y gtk3 libnotify nss libXScrnSaver libXtst xdg-utils atspi2-core libuuid libsecret

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Instalando Discipline Tracker..."
sudo mkdir -p /opt/Discipline Tracker
sudo cp -r "$SCRIPT_DIR/opt/Discipline Tracker"/* "/opt/Discipline Tracker/"
sudo ln -sf "/opt/Discipline Tracker/discipline-tracker" /usr/local/bin/discipline-tracker
sudo cp "$SCRIPT_DIR/usr/share/applications/discipline-tracker.desktop" /usr/share/applications/
sudo cp "$SCRIPT_DIR/usr/share/icons/hicolor/256x256/apps/discipline-tracker.png" /usr/share/icons/hicolor/256x256/apps/ 2>/dev/null || true
sudo update-desktop-database /usr/share/applications 2>/dev/null || true
sudo gtk-update-icon-cache /usr/share/icons/hicolor 2>/dev/null || true
chmod +x "/opt/Discipline Tracker/discipline-tracker"
echo "Instalacion completada! Ejecuta: discipline-tracker"
FEDORAEOF
chmod +x "$BUILD_DIR/install-fedora.sh"

# Crear script de instalacion para ubuntu (usa apt)
cat > "$BUILD_DIR/install-ubuntu.sh" << 'UBUNTUEOF'
#!/bin/bash
set -e
echo "Instalando dependencias..."
sudo apt update -qq
sudo apt install -y libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libuuid1 libsecret-1-0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Instalando Discipline Tracker..."
sudo mkdir -p "/opt/Discipline Tracker"
sudo cp -r "$SCRIPT_DIR/opt/Discipline Tracker"/* "/opt/Discipline Tracker/"
sudo ln -sf "/opt/Discipline Tracker/discipline-tracker" /usr/local/bin/discipline-tracker
sudo cp "$SCRIPT_DIR/usr/share/applications/discipline-tracker.desktop" /usr/share/applications/
sudo cp "$SCRIPT_DIR/usr/share/icons/hicolor/256x256/apps/discipline-tracker.png" /usr/share/icons/hicolor/256x256/apps/ 2>/dev/null || true
sudo update-desktop-database /usr/share/applications 2>/dev/null || true
sudo gtk-update-icon-cache /usr/share/icons/hicolor 2>/dev/null || true
chmod +x "/opt/Discipline Tracker/discipline-tracker"
echo "Instalacion completada! Ejecuta: discipline-tracker"
UBUNTUEOF
chmod +x "$BUILD_DIR/install-ubuntu.sh"

# Crear archivo tar.gz con todo
cd "$BUILD_DIR"
tar czf "../Discipline-Tracker-${VERSION}-Linux-x86_64.tar.gz" .
cd ../..

echo "Paquete generado: dist/Discipline-Tracker-${VERSION}-Linux-x86_64.tar.gz"
echo "Scripts de instalacion en: dist/rpm-build/"
