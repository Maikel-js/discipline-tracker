#!/bin/bash
# Discipline Tracker - Instalador para Fedora/RHEL
# Uso: chmod +x install-fedora.sh && sudo ./install-fedora.sh

set -e

APP_NAME="discipline-tracker"
APP_VERSION="0.1.0"
INSTALL_DIR="/opt/$APP_NAME"

echo "=========================================="
echo "  Discipline Tracker - Instalador Fedora"
echo "=========================================="
echo ""

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo "Este script necesita permisos de root."
    echo "Ejecuta: sudo ./install-fedora.sh"
    exit 1
fi

# Detectar arquitectura
ARCH=$(rpm --query --queryformat '%{ARCH}' rpm 2>/dev/null || echo "x86_64")
if [ "$ARCH" = "x86_64" ]; then
    RPM_FILE="Discipline-Tracker-${APP_VERSION}-Linux-x86_64.rpm"
elif [ "$ARCH" = "aarch64" ]; then
    RPM_FILE="Discipline-Tracker-${APP_VERSION}-Linux-aarch64.rpm"
else
    echo "Arquitectura no soportada: $ARCH"
    exit 1
fi

echo "[1/5] Verificando dependencias..."
dnf install -y gtk3 libnotify nss libXScrnSaver libXtst xdg-utils atspi2-core libuuid libsecret

echo "[2/5] Buscando paquete $RPM_FILE..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_DIR/dist"

if [ -f "$DIST_DIR/$RPM_FILE" ]; then
    RPM_PATH="$DIST_DIR/$RPM_FILE"
elif [ -f "$PROJECT_DIR/$RPM_FILE" ]; then
    RPM_PATH="$PROJECT_DIR/$RPM_FILE"
else
    echo "Error: No se encontro $RPM_FILE"
    echo "Ejecuta primero: npm run electron:build:linux:rpm"
    exit 1
fi

echo "[3/5] Instalando $RPM_FILE..."
dnf install -y "$RPM_PATH"

echo "[4/5] Verificando instalacion..."
if command -v discipline-tracker &> /dev/null; then
    echo "  ✓ Comando 'discipline-tracker' disponible"
else
    echo "  ⚠ El comando no esta en PATH, pero la app esta instalada"
fi

echo "[5/5] Limpiando cache..."
dnf clean all

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
echo "  sudo dnf remove discipline-tracker"
echo ""
