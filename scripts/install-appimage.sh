#!/bin/bash
# Discipline Tracker - Instalador AppImage (Universal)
# Uso: chmod +x install-appimage.sh && ./install-appimage.sh

set -e

APP_NAME="discipline-tracker"
APP_VERSION="0.1.0"
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons"

echo "=========================================="
echo "  Discipline Tracker - Instalador AppImage"
echo "=========================================="
echo ""

# Detectar arquitectura
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    APPIMAGE_FILE="Discipline-Tracker-${APP_VERSION}-Linux-x86_64.AppImage"
elif [ "$ARCH" = "aarch64" ]; then
    APPIMAGE_FILE="Discipline-Tracker-${APP_VERSION}-Linux-arm64.AppImage"
else
    echo "Arquitectura no soportada: $ARCH"
    exit 1
fi

echo "[1/6] Creando directorios de instalacion..."
mkdir -p "$INSTALL_DIR"
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

echo "[2/6] Buscando $APPIMAGE_FILE..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_DIR/dist"

if [ -f "$DIST_DIR/$APPIMAGE_FILE" ]; then
    APPIMAGE_PATH="$DIST_DIR/$APPIMAGE_FILE"
elif [ -f "$PROJECT_DIR/$APPIMAGE_FILE" ]; then
    APPIMAGE_PATH="$PROJECT_DIR/$APPIMAGE_FILE"
else
    echo "Error: No se encontro $APPIMAGE_FILE"
    echo "Ejecuta primero: npm run electron:build:linux:appimage"
    exit 1
fi

echo "[3/6] Copiando AppImage a $INSTALL_DIR..."
cp "$APPIMAGE_PATH" "$INSTALL_DIR/discipline-tracker"
chmod +x "$INSTALL_DIR/discipline-tracker"

echo "[4/6] Creando icono..."
# Buscar icono en el proyecto
ICON_SOURCE="$PROJECT_DIR/public/icon.svg"
if [ -f "$ICON_SOURCE" ]; then
    # Convertir SVG a PNG si es necesario
    if command -v convert &> /dev/null; then
        convert "$ICON_SOURCE" -resize 256x256 "$ICON_DIR/discipline-tracker.png"
    else
        cp "$ICON_SOURCE" "$ICON_DIR/discipline-tracker.svg"
    fi
    echo "  ✓ Icono instalado"
else
    echo "  ⚠ Icono no encontrado, usando predeterminado"
fi

echo "[5/6] Creando archivo .desktop..."
cat > "$DESKTOP_DIR/discipline-tracker.desktop" << EOF
[Desktop Entry]
Name=Discipline Tracker
Comment=Sistema de seguimiento de habitos y tareas con IA avanzada
Exec=$INSTALL_DIR/discipline-tracker
Icon=discipline-tracker
Terminal=false
Type=Application
Categories=Utility;Productivity;
StartupWMClass=discipline-tracker
EOF

chmod +x "$DESKTOP_DIR/discipline-tracker.desktop"
update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true

echo "[6/6] Verificando instalacion..."
if [ -f "$INSTALL_DIR/discipline-tracker" ]; then
    echo "  ✓ AppImage instalado correctamente"
else
    echo "  ✗ Error en la instalacion"
    exit 1
fi

echo ""
echo "=========================================="
echo "  Instalacion completada!"
echo "=========================================="
echo ""
echo "Para ejecutar:"
echo "  - Menu de aplicaciones: Busca 'Discipline Tracker'"
echo "  - Terminal: $INSTALL_DIR/discipline-tracker"
echo ""
echo "Para desinstalar:"
echo "  rm $INSTALL_DIR/discipline-tracker"
echo "  rm $DESKTOP_DIR/discipline-tracker.desktop"
echo ""
