import { execSync } from 'child_process';

const isAdmin = () => {
  try {
    execSync('net session', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

if (!isAdmin()) {
  console.log('⚠ No se ejecuta como administrador. Continuando sin Developer Mode...');
  console.log('  Si el build falla por winCodeSign, ejecuta PowerShell como ADMIN:');
  console.log('    npm run electron:build');
  process.exit(0);
}

try {
  console.log('✓ Ejecutando como administrador, configurando symlinks...');
  execSync('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AppModelUnlock" /t REG_DWORD /f /v "AllowDevelopmentWithoutDevLicense" /d 1', { stdio: 'pipe' });
  console.log('✓ Developer Mode habilitado');
} catch {
  console.log('⚠ No se pudo modificar el registro, continuando con variables de entorno...');
}
