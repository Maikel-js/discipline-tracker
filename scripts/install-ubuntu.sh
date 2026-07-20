#!/bin/bash
# Discipline Tracker - Instalador para Ubuntu/Debian
# Uso: chmod +x install-ubuntu.sh && ./install-ubuntu.sh

set -e

APP_NAME="discipline-tracker"
APP_VERSION="0.1.0"
INSTALL_DIR="/opt/$APP_NAME"
BIN_DIR="/usr/local/bin"
DESKTOP_DIR="/usr/share/applications"
ICON_DIR="/usr/share/icons"

echo "=========================================="
echo "  Discipline Tracker - Instalador Ubuntu"
echo "=========================================="
echo ""

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo "Este script necesita permisos de root."
    echo "Ejecuta: sudo ./install-ubuntu.sh"
    exit 1
fi

# Detectar arquitectura
ARCH=$(dpkg --print-architecture)
if [ "$ARCH" = "amd64" ]; then
    DEB_FILE="Discipline-Tracker-${APP_VERSION}-Linux-amd64.deb"
elif [ "$ARCH" = "arm64" ]; then
    DEB_FILE="Discipline-Tracker-${APP_VERSION}-Linux-arm64.deb"
else
    echo "Arquitectura no soportada: $ARCH"
    exit 1
fi

echo "[1/5] Verificando dependencias..."
apt-get update -qq
apt-get install -y -qq libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libuuid1 libsecret-1-0

echo "[2/5] Buscando paquete $DEB_FILE..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_DIR/dist"

if [ -f "$DIST_DIR/$DEB_FILE" ]; then
    DEB_PATH="$DIST_DIR/$DEB_FILE"
elif [ -f "$PROJECT_DIR/$DEB_FILE" ]; then
    DEB_PATH="$PROJECT_DIR/$DEB_FILE"
else
    echo "Error: No se encontro $DEB_FILE"
    echo "Ejecuta primero: npm run electron:build:linux:deb"
    exit 1
fi

echo "[3/5] Instalando $DEB_FILE..."
dpkg -i "$DEB_PATH"

echo "[4/5] Verificando instalacion..."
if command -v discipline-tracker &> /dev/null; then
    echo "  ✓ Comando 'discipline-tracker' disponible"
else
    echo "  ⚠ El comando no esta en PATH, pero la app esta instalada"
fi

echo "[5/5] Limpiando cache..."
apt-get autoremove -y -qq

echo ""
echo "=========================================="
echo "  Instalacion completada!"
echo "=========================================="
echo ""
echo "Para ejecutar:"
echo "  - Menu de aplicaciones: Busca 'Discipline Tracker'"
echo "  - Terminal: discipline-tracker"
echo ""
echo "Para desinstalar:"
echo "  sudo dpkg -r discipline-tracker"
echo ""
