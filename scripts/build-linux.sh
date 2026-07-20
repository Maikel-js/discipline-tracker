#!/bin/bash
# Discipline Tracker - Build completo para Linux
# Uso: chmod +x build-linux.sh && ./build-linux.sh

set -e

echo "=========================================="
echo "  Discipline Tracker - Build Linux"
echo "=========================================="
echo ""

# Verificar que npm esta instalado
if ! command -v npm &> /dev/null; then
    echo "Error: npm no esta instalado"
    echo "Instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar que esta en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "Error: Ejecuta este script desde la raiz del proyecto"
    exit 1
fi

echo "[1/5] Instalando dependencias..."
npm install

echo "[2/5] Construyendo app web..."
npm run build

echo "[3/5] Construyendo Electron (AppImage + DEB + RPM)..."
npm run electron:build:linux

echo "[4/5] Verificando archivos generados..."
echo ""
echo "Archivos generados en dist/:"
ls -lh dist/ 2>/dev/null || echo "  ⚠ Directorio dist/ no encontrado"

echo "[5/5] Resumen de builds..."
echo ""
echo "✓ AppImage: Portable, funciona en cualquier distro"
echo "✓ DEB: Para Ubuntu/Debian (sudo dpkg -i archivo.deb)"
echo "✓ RPM: Para Fedora/RHEL (sudo dnf install archivo.rpm)"
echo "✓ TAR.GZ: Archivo comprimido manual"
echo ""
echo "=========================================="
echo "  Build completado!"
echo "=========================================="
echo ""
echo "Para instalar:"
echo "  Ubuntu/Debian: sudo ./scripts/install-ubuntu.sh"
echo "  Fedora/RHEL:   sudo ./scripts/install-fedora.sh"
echo "  AppImage:      ./scripts/install-appimage.sh"
echo ""
