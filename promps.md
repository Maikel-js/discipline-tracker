Actúa como ingeniero full-stack senior y modifica el sistema existente.

En el módulo de tareas, cambia la gestión de estados para que cada tarea pueda avanzar con un solo botón.

Implementar lo siguiente:

Cada tarea tendrá tres estados:

Por hacer
En progreso
Completado
Nuevo comportamiento:

Agregar un único botón llamado por ejemplo:

Avanzar Estado

Que funcione como ciclo:

Primer clic:
Por hacer → En progreso
Segundo clic:
En progreso → Completado
Tercer clic (opcional configurable):
Completado → Reiniciar a Por hacer

o dejarlo bloqueado si la tarea completada no debe reiniciarse.

Requisitos:
Backend:

Modificar lógica para:

Actualizar estado en cada clic.
Persistir cambio en base de datos.
Validar transición correcta de estados.
Evitar saltos inválidos.
Frontend:

Actualizar UI para:

Mostrar un solo botón para transición.
Cambiar automáticamente texto/color/indicador visual según estado.
Reflejar cambio inmediato sin recargar.

Ejemplo:

Si está en "Por hacer":

[ Iniciar ]

Si está en "En progreso":

[ Completar ]

Si está en "Completado":

[ Reiniciar ] (si aplica)

También:

Actualizar:

Modelo de datos
API endpoints
Lógica del botón
Kanban si existe
Tests para validar transiciones

__________________________________________________________________

Actúa como arquitecto de software senior y expande mi sistema actual de seguimiento de hábitos y tareas agregando las siguientes funcionalidades avanzadas sobre el sistema existente (no crear uno nuevo, modificar el actual).

Implementar todo lo siguiente:
1. Dependencias entre hábitos

Permitir que ciertos hábitos dependan de otros.

Ejemplo:

No se puede completar “Ver entretenimiento” si antes no se completó “Estudiar”.
Bloquear hábitos condicionados hasta cumplir prerequisitos.
Agregar lógica de validación y reglas de dependencia.
2. Modo castigo automático

Si el usuario incumple hábitos:

Activar:

Alarmas más agresivas.
Mayor frecuencia de recordatorios.
Penalizaciones automáticas.
Generación de tareas correctivas automáticas.

Ejemplo:

Si fallas ejercicio:
Crear automáticamente:
“Hacer 20 minutos extra mañana.”
3. Sistema anti-procrastinación

Implementar lógica para:

Detectar reprogramaciones excesivas.
Limitar posponer tareas.
Bloquear excusas repetidas.
Detectar patrones de evasión.
4. Integrar modo Pomodoro

Agregar:

Temporizador Pomodoro.
Asociación Pomodoro con tareas.
Registro de sesiones.
Métricas de foco/productividad.
5. Puntaje de disciplina

Crear un Discipline Score.

Debe:

Subir al cumplir.
Bajar al incumplir.
Tener historial.
Mostrar evolución.

Agregar motor de cálculo.

6. Detección de abandono de hábitos

Detectar hábitos en riesgo.

Si un hábito se está abandonando:

Alertar.
Sugerir ajustes.
Recomendar nuevos horarios.
7. Motor de patrones

Analizar comportamiento y detectar:

Días donde más falla.
Horas donde más falla.
Horarios donde mejor cumple.
Tendencias.

Mostrar insights automáticos.

8. Modo auditor (logs)

Crear auditoría completa:

Registrar:

Hábitos incumplidos.
Frecuencia.
Fecha.
Tendencias.
Historial.

Crear panel de auditoría.

9. Accountability Partner

Permitir vincular otra persona para:

Ver cumplimiento.
Recibir alertas si incumplo.
Supervisar progreso.

Agregar permisos, roles y notificaciones.

10. Integración con sensores / automatización

Integrar con:

Google Fit
Apple Health
Pasos
Sueño
Actividad física

Permitir marcar hábitos automáticamente con datos reales.

Ejemplo:

Si caminé 10,000 pasos:
marcar hábito ejercicio como cumplido.
Requisitos técnicos:

Actualizar todo lo necesario:

Frontend
Backend
Base de datos
APIs
Notificaciones
Reglas del sistema
UI/UX
Tests

Modificar arquitectura si es necesario.

Entregar:

Generar:

Diseño técnico
Cambios en esquema de base de datos
Código completo
Integraciones
Tests
Implementación sobre el proyecto existente

No explicar teoría.

_______________________________________________

Actúa como ingeniero DevOps + full-stack senior y aplica todas las modificaciones anteriores al proyecto existente, luego intégralo y súbelo a mi repositorio de GitHub.

Objetivo

Tomar el sistema actual, implementar todas las nuevas funcionalidades solicitadas y hacer commit de los cambios en mi repositorio existente.

Implementar y luego hacer Git/GitHub:

Agregar todo lo anterior al proyecto actual y después:

1. Integrarlo al repositorio existente
Trabajar sobre mi repositorio actual (no crear proyecto separado).
Mantener estructura existente.
Integrar cambios sin romper funcionalidades previas.
2. Usar flujo Git profesional

Crear rama:

feature/advanced-habit-system

Hacer commits organizados por módulos, por ejemplo:

git commit -m "Add habit dependencies system"

git commit -m "Add discipline score engine"

git commit -m "Add procrastination detection"

git commit -m "Add accountability partner"

git commit -m "Add sensor integrations"

3. Hacer push a GitHub

Subir cambios a mi repositorio remoto:

git push origin feature/advanced-habit-system

Si corresponde:

Crear Pull Request.
Hacer merge a main/master.
4. Actualizar repositorio

Actualizar también:

README.md
documentación técnica
instrucciones de instalación
variables .env.example
migraciones si aplica
5. Validar antes del push

Antes de subir:

Ejecutar tests
Verificar build
Verificar que no se rompa nada
Confirmar que el repositorio quede funcional después del push
6. Entregar

Generar:

Código
Cambios aplicados
Comandos Git usados
Estructura final del repositorio
Todo listo para quedar subido en GitHub

//Ejecuta lo siguiente

git remote add origin https://github.com/Maikel-js/discipline-tracker.git
git branch -M main
git push -u origin main

________________________________________________________

Actúa como ingeniero mobile y full-stack senior.

Toma mi sistema actual y conviértelo para que pueda usarlo en mi celular.

Objetivo:

Hacer que el sistema funcione en Android/iPhone desde mi teléfono.

Implementar:
Opción preferida: convertirlo en PWA instalable

Haz que el proyecto sea una Progressive Web App (PWA) para que pueda:

Instalarse desde navegador en el celular.
Aparecer como una app real en la pantalla de inicio.
Abrirse como aplicación.
Funcionar en móvil correctamente.
Tener diseño responsive.
Mantener sincronización con el sistema actual.
Agregar:
Mobile optimization

Adaptar toda la interfaz para celular:

Botones táctiles.
Diseño responsive.
Navegación móvil.
Menús optimizados.
Panel usable en pantalla pequeña.
Notificaciones móviles

Hacer funcionar:

Push notifications en celular.
Alarmas en móvil.
Recordatorios insistentes en teléfono.
Vibración si aplica.
Instalación

Configurar:

manifest.json
service worker
modo installable

Para que pueda hacer:

“Agregar a pantalla de inicio”

y usarlo como app.

Si es mejor opción:

Si el proyecto requiere app nativa, migrarlo a React Native o Capacitor y generar versión Android también.

Entregar:
Código necesario
Configuración PWA
Cambios para móvil
Pasos para instalarlo en mi celular
Todo listo para probar desde mi teléfono

No crear otro proyecto aparte.

_______________________________________________________________________
Actúa como ingeniero DevOps senior y despliega mi proyecto actual en Vercel.

Objetivo

Publicar la aplicación para que quede accesible desde una URL y pueda usarla desde navegador y celular.

Hacer lo siguiente:
1. Preparar proyecto para Vercel

Configurar lo necesario para despliegue:

Revisar estructura del proyecto.
Configurar build correctamente.
Configurar variables de entorno.
Corregir cualquier problema que impida deploy.

Si usa Next.js, React o Vite, ajustar configuración necesaria.

2. Desplegar en Vercel

Conectar proyecto a Vercel y hacer deployment.

Si el código está en GitHub:

Conectar repositorio.
Configurar deployment automático.
Hacer primer deploy.
3. Configurar backend y base de datos

Si hay backend o base de datos:

Configurar para producción:

Variables .env
Conexión a base de datos
URLs correctas
Endpoints de producción

Corregir cualquier problema de CORS o rutas.

4. Validar después del deploy

Verificar:

App carga correctamente.
Login funciona.
Hábitos funcionan.
Notificaciones funcionan si aplica.
Versión móvil funciona.
PWA sigue instalable.
5. Entregar

Generar:

Todo lo necesario para desplegar
Configuración requerida
Comandos usados
Ajustes hechos
Proyecto listo y publicado en Vercel

No crear proyecto nuevo.

_____________________________________________________________________

Actúa como ingeniero Android + release engineer senior y toma mi proyecto actual (ya funcional y desplegado) para prepararlo y publicarlo en Google Play Store.

Objetivo

Convertir mi aplicación actual en una app Android publicable y dejarla lista para subir a Play Store.

Hacer lo siguiente:
1. Generar versión Android

Si actualmente es PWA:

Convertir o empaquetar usando la mejor opción compatible:

Capacitor (preferido) o
Trusted Web Activity (TWA), si aplica.

Si ya requiere app nativa, usar React Native/Android según convenga.

Generar proyecto Android funcional.

2. Preparar app para release

Configurar:

Nombre de la app
Icono
Splash screen
Version code
Version name
Permisos necesarios (solo los mínimos)
Notificaciones push
Alarmas si aplican
3. Generar build de producción

Crear release firmada:

Generar keystore
Configurar signing
Generar Android App Bundle (.aab)

No APK para publicación, usar AAB.

4. Preparar Play Store listing

Generar lo necesario para publicar:

Descripción corta
Descripción larga
Categoría
Política de privacidad (si la app usa cuentas, datos, notificaciones o tracking)
Screenshots requeridos
Feature graphic
App icon
5. Validar cumplimiento

Revisar:

Requisitos de Google Play
Políticas de permisos
Requisitos de notificaciones
Compatibilidad Android
Que no haya blockers para publicación
6. Subir a Play Console

Preparar proceso para:

Subir .aab
Completar ficha
Configurar prueba interna (Internal Testing) primero
Luego dejar listo para producción
7. Entregar

Generar:

Cambios necesarios
Configuración Android
Build .aab
Pasos para publicar
Todo listo para subir a Play Store

No crear una app nueva.
___________________________________________
Actúa como arquitecto de software senior y mejora mi sistema actual agregando autenticación, gestión de cuentas y haciendo funcionales los modos “extremo” y “castigo”, además de implementar almacenamiento robusto (local y en la nube).

No crear un sistema nuevo. Modificar el existente.

1. Sistema de inicio de sesión y autenticación

Implementar:

Registro de usuarios (email + contraseña)
Login seguro
Logout
Recuperación de contraseña
Validación de sesión (JWT o similar)
Protección de rutas (solo usuarios autenticados)

Opcional:

Login con Google
2. Gestión de cuentas

Crear módulo de usuario:

Perfil de usuario
Editar datos
Configuración personal:
Horarios
Nivel de disciplina
Preferencias de notificaciones
Eliminación de cuenta
Multi-dispositivo sincronizado
3. Modo Extremo (hacerlo REAL)

Cuando el usuario lo activa:

Notificaciones mucho más frecuentes
No permitir ignorar fácilmente hábitos
Bloquear posponer
Repetición constante hasta completar
UI más agresiva (alertas visuales)
Activación automática de alarmas
4. Modo Castigo (hacerlo REAL)

Si el usuario incumple hábitos:

Activar automáticamente:

Alarmas insistentes
Penalizaciones reales:
Reducir discipline score
Generar tareas obligatorias
Incrementar dificultad:
Más recordatorios
Menos tolerancia a fallos
5. Base de datos (local + nube)

Implementar sistema híbrido:

Local:
IndexedDB o almacenamiento local
Soporte offline
Nube:
Base de datos remota (PostgreSQL, MongoDB o Firebase)
Sincronización:
Sync automático entre local y nube
Resolución de conflictos
Cache local
6. Seguridad

Agregar:

Hash de contraseñas (bcrypt)
Tokens seguros
Protección contra accesos no autorizados
Validación de inputs
7. Backend y base de datos

Actualizar:

Tablas:

users
sessions
habits
tasks
penalties
notifications
logs

Relaciones correctas y escalables.

8. Frontend

Agregar:

Pantallas:
Login
Registro
Perfil
Configuración
Estado global de usuario
Manejo de sesión
9. Tests

Agregar pruebas para:

Autenticación
Seguridad
Sincronización
Modos extremo y castigo
10. Entregar

Generar:

Código completo
Cambios aplicados al sistema existente
Configuración de base de datos
Lógica de autenticación
Integración frontend/backend
Sistema funcional listo para producción

No explicar teoría.
_____________________________________________-
Actúa como ingeniero backend + DevOps senior y agrega al sistema actual un módulo de notificaciones por correo electrónico automatizadas para usuarios que no han completado tareas o hábitos.

No crear sistema nuevo. Integrar en el existente.

Objetivo

Enviar correos automáticamente cuando el usuario:

No completa un hábito.
Tiene tareas pendientes vencidas.
Ignora notificaciones del sistema.
1. Sistema de envío de emails

Implementar servicio de correo usando:

Node.js + Nodemailer
o
Servicios como SendGrid / Resend / AWS SES

Configurar:

SMTP o API
Variables de entorno (.env)
2. Lógica de disparo

Crear motor que detecte:

Casos:
Hábito no completado a su hora límite
Tarea vencida
Múltiples recordatorios ignorados
3. Tipos de correos
Recordatorio suave:
“Tienes hábitos pendientes hoy”
Recordatorio insistente:
“Sigues sin completar tus hábitos”
Alerta crítica:
“Estás incumpliendo tus objetivos”
4. Frecuencia

Implementar:

Primer correo → aviso inicial
Segundo correo → si no responde
Tercero → más insistente

Evitar spam (control de frecuencia).

5. Personalización

Los correos deben incluir:

Nombre del usuario
Hábitos pendientes
Tareas vencidas
Enlace directo a la app
6. Scheduler / Jobs

Implementar sistema automático:

Cron jobs o queue system

Ejecutar cada cierto tiempo:

Revisar estado de usuarios
Disparar correos según reglas
7. Base de datos

Agregar:

email_logs
last_notification_sent
notification_preferences
8. Preferencias del usuario

Permitir:

Activar/desactivar correos
Elegir frecuencia
Tipo de alertas
9. Seguridad
No exponer credenciales
Validar emails
Manejo de errores SMTP
10. Tests

Crear tests para:

Envío de correos
Casos de disparo
Frecuencia correcta
Evitar duplicados
11. Entregar

Generar:

Código backend
Configuración SMTP/API
Plantillas de correos
Lógica de envío automático
Integración con sistema actual

Todo listo para funcionar en producción.

No explicar teoría.

Implementar directamente.