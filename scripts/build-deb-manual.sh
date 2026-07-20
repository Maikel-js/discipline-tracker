#!/bin/bash
# Genera paquete .deb manualmente usando ar y tar
set -e

VERSION="0.1.0"
PKG_NAME="discipline-tracker"
BUILD_DIR="dist/deb-build"
PKG_DIR="$BUILD_DIR/${PKG_NAME}_${VERSION}_amd64"

echo "Generando paquete .deb..."

# Limpiar
rm -rf "$BUILD_DIR"
mkdir -p "$PKG_DIR/DEBIAN"
mkdir -p "$PKG_DIR/opt/Discipline Tracker"
mkdir -p "$PKG_DIR/usr/share/applications"
mkdir -p "$PKG_DIR/usr/share/icons/hicolor/256x256/apps"

# Copiar archivos de la app
cp -r dist/linux-unpacked/* "$PKG_DIR/opt/Discipline Tracker/"

# Crear archivo de control
cat > "$PKG_DIR/DEBIAN/control" << EOF
Package: $PKG_NAME
Version: $VERSION
Section: utils
Priority: optional
Architecture: amd64
Maintainer: Maikel-js <maikel@example.com>
Description: Discipline Tracker - Sistema de seguimiento de habitos y tareas con IA avanzada
Homepage: https://github.com/Maikel-js/discipline-tracker
Depends: libgtk-3-0, libnotify4, libnss3, libxss1, libxtst6, xdg-utils, libatspi2.0-0, libuuid1, libsecret-1-0
Recommends: libappindicator3-1
Installed-Size: $(du -sk "$PKG_DIR/opt" | cut -f1)
EOF

# Crear postinst
cat > "$PKG_DIR/DEBIAN/postinst" << 'EOF'
#!/bin/bash
chmod +x "/opt/Discipline Tracker/discipline-tracker"
ln -sf "/opt/Discipline Tracker/discipline-tracker" /usr/local/bin/discipline-tracker
update-desktop-database /usr/share/applications 2>/dev/null || true
update-icon-caches /usr/share/icons/hicolor 2>/dev/null || true
EOF
chmod 755 "$PKG_DIR/DEBIAN/postinst"

# Crear prerm
cat > "$PKG_DIR/DEBIAN/prerm" << 'EOF'
#!/bin/bash
rm -f /usr/local/bin/discipline-tracker
EOF
chmod 755 "$PKG_DIR/DEBIAN/prerm"

# Crear .desktop file
cat > "$PKG_DIR/usr/share/applications/discipline-tracker.desktop" << EOF
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
    cp public/icon.png "$PKG_DIR/usr/share/icons/hicolor/256x256/apps/discipline-tracker.png"
elif [ -f "public/icon.svg" ]; then
    cp public/icon.svg "$PKG_DIR/usr/share/icons/hicolor/256x256/apps/discipline-tracker.svg"
fi

# Crear el .deb usando ar
DEB_FILE="../Discipline-Tracker-${VERSION}-Linux-amd64.deb"
cd "$BUILD_DIR"

# Crear debian-binary
echo "2.0" > debian-binary

# Crear control.tar.gz
tar czf control.tar.gz -C "${PKG_NAME}_${VERSION}_amd64/DEBIAN" .

# Crear data.tar.gz
tar czf data.tar.gz -C "${PKG_NAME}_${VERSION}_amd64" --exclude=DEBIAN --exclude=debian-binary .

# Crear el paquete .deb con ar
ar rcs "$DEB_FILE" debian-binary control.tar.gz data.tar.gz

cd ../..

echo "Paquete generado: dist/Discipline-Tracker-${VERSION}-Linux-amd64.deb"
ls -lh "dist/Discipline-Tracker-${VERSION}-Linux-amd64.deb"
