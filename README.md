# Discipline Tracker

Sistema de seguimiento de hábitos y tareas con IA avanzada.

## 🌐 Acceso Web

**https://discipline-tracker-rho.vercel.app**

## 📱 Instalar en Celular

### Android
1. Abre el enlace en Chrome
2. Menú → "Agregar a pantalla de inicio"
3. ¡Listo! Se instala como app

### iOS
1. Abre el enlace en Safari
2. Compartir → "Agregar a pantalla de inicio"

## 💻 Instalar en PC

### Web (Recomendado)
- Accede a **https://discipline-tracker-rho.vercel.app**
- Guarda en favoritos o crea acceso directo

### Linux

#### Ubuntu/Debian (.deb)
```bash
# Opción 1: Usar script de instalación
sudo ./scripts/install-ubuntu.sh

# Opción 2: Instalación manual
sudo dpkg -i dist/Discipline-Tracker-0.1.0-Linux-amd64.deb
sudo apt-get install -f  # Instalar dependencias faltantes
```

#### Fedora/RHEL (.rpm)
```bash
# Opción 1: Usar script de instalación
sudo ./scripts/install-fedora.sh

# Opción 2: Instalación manual
sudo dnf install dist/Discipline-Tracker-0.1.0-Linux-x86_64.rpm
```

#### AppImage (Cualquier distro)
```bash
# Opción 1: Usar script de instalación
./scripts/install-appimage.sh

# Opción 2: Ejecutar directamente
chmod +x Discipline-Tracker-0.1.0-Linux-x86_64.AppImage
./Discipline-Tracker-0.1.0-Linux-x86_64.AppImage
```

#### Build completo para Linux
```bash
# Construir todos los formatos (AppImage, .deb, .rpm)
npm run build:linux

# O formatos individuales
npm run electron:build:linux:appimage
npm run electron:build:linux:deb
npm run electron:build:linux:rpm
```

### Desktop App (Próximamente)
- Descarga desde GitHub Releases cuando esté disponible

## Características

- ✅ Hábitos y tareas avanzadas
- 🔥 Modo Extremo y Castigo
- 🤖 IA Coach
- 🧠 Digital Twin
- 🕸️ Life Graph
- 📋 Protocolos ejecutables
- 📊 Analytics avanzada

## Desarrollo

```bash
npm install
npm run dev
```

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS
- Zustand
- TypeScript

## GitHub

https://github.com/Maikel-js/discipline-tracker