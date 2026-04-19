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

___________________________________________________________________

Actúa como arquitecto de software senior, ingeniero de IA y full-stack principal.

Expande mi sistema actual e implementa todas las siguientes funcionalidades avanzadas sobre el proyecto existente.

No crear sistema nuevo. Modificar el actual.

Implementar todo lo siguiente:
1. IA Coach Personal

Crear un módulo de inteligencia que analice comportamiento del usuario y genere recomendaciones automáticas.

Debe detectar:

Patrones de incumplimiento.
Caída de disciplina.
Horarios malos.
Recomendaciones automáticas.

Ejemplo:

“Estás fallando estudiar los martes. Muévelo a 6 PM.”

2. Predicción de incumplimiento

Crear motor predictivo para estimar probabilidad de fallar hábitos o tareas.

Debe:

Detectar riesgo.
Generar alertas preventivas.
Mostrar probabilidades.

Ejemplo:

“Tienes 78% probabilidad de no cumplir ejercicio hoy.”

Implementar lógica, modelo y reglas necesarias.

3. Reconocimiento por voz

Permitir comandos por voz para:

Crear tareas.
Completar hábitos.
Consultar estado.
Activar modos.

Ejemplo:

“Marcar lectura completada.”

4. Modo Supervisor IA

Crear sistema que supervise:

Procrastinación.
Conductas de evasión.
Caídas de rendimiento.
Posibles falsos cumplimientos.

Debe generar alertas e intervenir.

5. Sistema Anti-trampa

Detectar:

Completar muchos hábitos falsamente en segundos.
Manipulación de rachas.
Completados sospechosos.
Patrones anómalos.

Crear reglas de validación y detección.

6. Evidencia para completar hábitos

No permitir marcar ciertos hábitos como cumplidos sin evidencia.

Implementar soporte para:

Foto
Check-in GPS
Integración con sensores
Tiempo mínimo requerido

Ejemplo:

No marcar ejercicio como completo sin evidencia válida.

7. Ranking y competencia

Crear:

Leaderboards
Ranking por discipline score
Comparativas
Competencia entre usuarios
8. Sistema de recompensas

Agregar:

Recompensas configurables
Desbloqueos
Beneficios por cumplimiento
Reglas automáticas
9. Modo mentor / coach humano

Permitir vincular mentor/supervisor para:

Ver progreso
Recibir alertas
Supervisar cumplimiento

Agregar permisos y roles.

10. Exportación de reportes

Generar reportes exportables:

PDF
Dashboard
Auditorías
Resúmenes mensuales
Requisitos técnicos

Actualizar todo lo necesario:

Frontend
Backend
Base de datos
APIs
Integraciones
Seguridad
UI/UX
Tests

Agregar nuevas tablas si hace falta.

Entregar

Generar:

Diseño técnico
Código completo
Integraciones
Tests
Implementación sobre el proyecto existente

No explicar teoría.

Implementar directamente todo.


___________________________________________________________________

Actúa como arquitecto de software senior y expande mi sistema actual agregando las siguientes capacidades avanzadas sobre el proyecto existente.

No crear un sistema nuevo. Modificar el actual.

Implementar todo lo siguiente:
1. Planificador automático de día

Crear sistema que construya automáticamente la agenda diaria del usuario usando:

Prioridad de tareas
Hábitos obligatorios
Tiempo disponible
Horarios definidos
Energía estimada si aplica

Generar planificación automática diaria.

2. Reprogramación inteligente

Si el usuario incumple una tarea o hábito:

Reprogramarla automáticamente.
Buscar nuevo espacio disponible.
Evitar que se pierda.

Agregar lógica de reasignación.

3. Time blocking automático

Implementar asignación automática de bloques de tiempo para:

Tareas
Hábitos
Sesiones de trabajo

Mostrarlo en calendario visual.

4. Integración con Google Calendar / Outlook

Sincronizar:

Eventos
Hábitos
Tareas
Time blocks

Agregar integración bidireccional si es posible.

5. Integración con WhatsApp o Telegram Bot

Agregar bot que pueda enviar mensajes automáticos como:

Recordatorios
Alertas de incumplimiento
Resúmenes diarios

Integrarlo con el sistema actual.

6. Motor de reglas tipo If This Then That

Crear sistema configurable para reglas automáticas.

Ejemplos:

Si fallo estudiar → crear tarea correctiva.
Si cumplo 7 días seguidos → activar recompensa.
Si discipline score baja → activar modo castigo.

Crear motor de automatización.

7. Dashboard analítico avanzado

Agregar métricas y paneles para:

Tendencia de disciplina
Índice de procrastinación
Productividad semanal
Horas efectivas
Consistencia

Crear visualizaciones y reportes.

8. Score de consistencia

Agregar sistema separado del discipline score para medir:

Regularidad
Estabilidad
Persistencia

Diseñar motor de cálculo.

9. Backups automáticos

Implementar:

Backup diario
Restauración
Exportación de datos

Agregar seguridad para evitar pérdida de información.

10. Historial / versionado

Crear auditoría y versionado para:

Cambios
Ediciones
Eventos importantes
Historial del usuario
11. Personalización / tema oscuro

Agregar:

Dark mode
Preferencias visuales
Configuración personalizable
12. Multiusuario / equipos

Agregar soporte para:

Equipos
Familias
Grupos
Espacios compartidos

Con roles y permisos.

Requisitos técnicos

Actualizar todo lo necesario:

Frontend
Backend
Base de datos
APIs
Integraciones
Seguridad
Tests

Modificar arquitectura si hace falta.

Entregar

Generar:

Diseño técnico
Código completo
Integraciones
Tests
Implementación sobre el proyecto existente

No explicar teoría.

Implementar directamente todo.

______________________________________________________________

Actúa como arquitecto principal de software, ingeniero de IA y diseñador de plataformas.

Expande mi proyecto actual y conviértelo en una plataforma mucho más grande agregando todos los siguientes módulos avanzados sobre el sistema existente.

No crear un sistema nuevo. Modificar el actual.

Implementar todo lo siguiente:
1. Convertirlo en un Personal OS (Life OS)

Expandir el sistema para convertirlo en un centro operativo personal que integre:

Hábitos
Tareas
Calendario
Metas
Proyectos
Finanzas
Notas
Decisiones

Diseñar navegación y arquitectura para operar como sistema unificado.

2. Agente autónomo de IA

Crear un agente inteligente que no solo recomiende, sino que pueda ejecutar acciones automáticamente como:

Reprogramar tareas.
Reordenar agenda.
Resolver conflictos.
Ajustar hábitos automáticamente.

Agregar motor de automatización y toma de decisiones.

3. Módulo de metas de largo plazo

Agregar soporte para:

Objetivos trimestrales
OKRs personales
Roadmaps
Seguimiento estratégico

Con vinculación entre metas, hábitos y tareas.

4. Sistema de toma de decisiones

Implementar módulo para decisiones complejas usando:

Matriz Eisenhower
Weighted scoring
Decision trees
Frameworks de priorización

Agregar interfaz y lógica.

5. Finanzas personales integradas

Agregar módulo financiero:

Presupuesto
Ahorro
Metas financieras
Seguimiento de gastos
Relación entre disciplina y finanzas
6. Knowledge System / Segundo Cerebro

Agregar:

Notas
Base de conocimiento
Ideas conectadas
Relación entre notas, tareas y proyectos

Diseñar sistema tipo second brain.

7. Marketplace / Plugins

Crear arquitectura extensible para:

Plugins
Extensiones
Integraciones de terceros

Diseñar sistema modular.

8. API pública

Diseñar y construir API pública para que otras aplicaciones puedan integrarse con la plataforma.

Agregar:

Endpoints
Autenticación
Documentación
Gestión de acceso
9. Módulo B2B / empresas

Agregar versión para organizaciones con:

Equipos
Roles
Supervisión
Productividad grupal
Accountability organizacional
10. Motor de simulación / escenarios

Crear sistema “What If” para simular escenarios.

Ejemplo:

Si cambio este hábito:
¿Qué impacto tendría en 90 días?

Implementar lógica de simulación.

Requisitos técnicos

Actualizar todo lo necesario:

Frontend
Backend
Base de datos
APIs
Arquitectura
Seguridad
Integraciones
Tests

Modificar arquitectura si hace falta.

Entregar

Generar:

Diseño técnico
Arquitectura de plataforma
Código completo
Integraciones
Tests
Implementación sobre el proyecto existente

No explicar teoría.

Implementar directamente todo.

_____________________________________________________________________

Actúa como arquitecto de software principal, ingeniero de IA avanzada y diseñador de plataformas complejas.

Expande mi sistema actual y conviértelo en una plataforma de inteligencia personal avanzada agregando todos los siguientes módulos de alto nivel sobre el sistema existente.

No crear un sistema nuevo. Modificar el actual.

Implementar todo lo siguiente:
1. Life Graph (Memoria Personal)

Diseñar e implementar un grafo de conocimiento que conecte:

Hábitos
Tareas
Decisiones
Proyectos
Notas
Personas
Eventos

Debe permitir:

Relaciones entre entidades
Navegación tipo grafo
Consultas complejas
Persistencia eficiente
2. Digital Twin (Gemelo Digital)

Crear un modelo del usuario que represente su comportamiento.

Debe:

Aprender patrones
Simular decisiones
Predecir acciones
Evaluar escenarios futuros

Ejemplo:

“Si sigues este patrón, fallarás en X hábito.”

3. Sistema multiagente

Implementar arquitectura con múltiples agentes especializados:

Agente de planificación
Agente de disciplina
Agente financiero
Agente de decisiones

Cada agente debe:

Tener responsabilidades claras
Comunicarse con otros agentes
Tomar decisiones autónomas
4. Laboratorio de experimentos personales

Permitir ejecutar experimentos sobre el usuario:

Definir variables (horarios, hábitos, etc.)
Comparar resultados
Medir impacto
Generar conclusiones
5. Motor causal

Implementar sistema que detecte relaciones causales:

Identificar causas reales de incumplimiento
Diferenciar correlación vs causalidad
Generar insights profundos

Ejemplo:

“Fallas estudiar porque duermes tarde.”

6. Sistema operativo organizacional (B2B avanzado)

Expandir módulo de empresas a un OS completo:

Gestión de equipos
Productividad organizacional
Supervisión
Métricas de rendimiento
Coordinación
7. Modelo de identidad / perfil cognitivo

Crear perfil del usuario basado en:

Comportamiento
Decisiones
Hábitos
Patrones mentales

Usarlo para adaptar el sistema automáticamente.

8. Sistema de entrenamiento adaptativo

Crear sistema que ajuste dificultad dinámicamente:

Hábitos más difíciles si mejoras
Más soporte si fallas
Progresión personalizada
9. Knowledge Graph + búsqueda semántica

Implementar:

Búsqueda inteligente
Consultas complejas
Relación entre datos

Ejemplo:

“Mostrar todas las veces que fallé por falta de sueño.”

10. Protocolos / Playbooks ejecutables

Permitir crear y ejecutar protocolos:

Rutinas
Estrategias
Planes estructurados

Ejemplo:

“Protocolo de estudio intensivo.”

Requisitos técnicos

Actualizar todo lo necesario:

Arquitectura (posiblemente microservicios o modular avanzada)
Backend
Frontend
Base de datos (incluyendo soporte para grafos si es necesario)
APIs
Integraciones
Seguridad
Escalabilidad
Tests
Entregar

Generar:

Diseño de arquitectura completa
Modelo de datos actualizado
Código completo
Implementación de todos los módulos
Integraciones
Tests

No explicar teoría.

Implementar directamente todo sobre el sistema existente.

________________________________________________________________

Actúa como ingeniero de software multiplataforma y release engineer senior.

Toma mi proyecto actual y haz que pueda descargarse e instalarse tanto en PC como en celular.

No crear un proyecto nuevo. Convertir el existente en aplicación distribuible multiplataforma.

Objetivo

Permitir que los usuarios puedan descargar e instalar la aplicación en:

Celular
Android
iPhone (si aplica)
PC
Windows
(Opcional: macOS y Linux si es viable)
1. Versión para celular

Generar versión instalable móvil usando la mejor opción compatible:

Capacitor (preferido), o
React Native si corresponde.

Generar builds instalables para móvil.

Android:

Generar:

APK para pruebas
AAB para distribución
2. Versión para PC (Desktop app)

Convertir el proyecto en aplicación de escritorio usando:

Electron (preferido), o
Tauri si es mejor opción

Generar instaladores descargables para Windows:

.exe installer
o .msi

Si es viable, agregar:

macOS package
Linux package
3. Mantener integración con sistema actual

La versión de escritorio y móvil debe conservar:

Login
Hábitos
Tareas
Notificaciones
Alarmas
Base de datos
Sincronización

No romper funcionalidades existentes.

4. Soporte offline + sincronización

Agregar:

Funcionar offline
Sincronizar cuando vuelva internet
Manejo de conflictos si hay cambios en múltiples dispositivos
5. Auto-updates (si aplica)

Agregar sistema de actualizaciones para desktop y móvil si es viable.

6. Distribución / Descargas

Preparar el proyecto para que los usuarios puedan descargarlo desde:

Página web (botón Descargar para Windows)
Play Store (Android)
PWA instalable si aplica

Agregar flujo de distribución.

7. Entregar

Generar:

Código necesario
Configuración multiplataforma
Builds instalables
Instalador para PC
APK/AAB para Android
Todo listo para descargar e instalar

No explicar teoría.

Implementar directamente sobre el proyecto actual.

_____________________________________________________________________

Actúa como software architect senior y refactoriza mi proyecto actual para eliminar código espagueti y reorganizarlo usando principios de Clean Code y arquitectura limpia.

No crear un proyecto nuevo.

Modificar y refactorizar el código existente.

Objetivo

Desenredar el código, reducir acoplamiento, mejorar mantenibilidad y dejar la base lista para escalar.

1. Detectar problemas actuales

Auditar el código y localizar:

Código espagueti
Lógica duplicada
Funciones gigantes
Dependencias acopladas
Archivos sobrecargados
Código muerto
Violaciones de separación de responsabilidades
2. Refactorizar usando Clean Code

Aplicar principios:

Single Responsibility Principle
DRY
KISS
Separation of Concerns
Dependency Injection donde corresponda
3. Reorganizar con Clean Architecture

Separar por capas:

Domain
Entities
Business Rules
Use Cases
Application
Services
Interfaces
Orchestration
Infrastructure
Database
APIs
Email
Notifications
External integrations
Presentation
UI
Components
Controllers / handlers
4. Desacoplar módulos

Separar correctamente módulos como:

Autenticación
Hábitos
Tareas
Notificaciones
Alarmas
IA
Reglas
Integraciones

Reducir dependencias cruzadas.

5. Mejorar estructura de carpetas

Reorganizar el proyecto con estructura coherente y escalable.

6. Refactorizar nombres

Mejorar:

Variables
Funciones
Clases
Interfaces

Usar nombres claros y consistentes.

7. Extraer lógica mezclada

Mover lógica de negocio fuera de:

Componentes UI
Controladores
Endpoints

Llevarla a servicios/use cases.

8. Manejo de errores

Implementar manejo de errores consistente.

9. Mantener funcionalidad existente

Muy importante:

No romper funcionalidades actuales.

Todo debe seguir funcionando:

Login
Hábitos
Tareas
Alarmas
Base de datos
Integraciones
10. Tests

Actualizar o crear tests para asegurar que el refactor no rompe nada.

11. Entregar

Generar:

Refactor completo
Nueva estructura del proyecto
Código reorganizado
Mejoras aplicadas
Tests actualizados

No explicar teoría.

Refactorizar directamente el proyecto existente y convertirlo en una base limpia y mantenible.

__________________________________________________________________

Actúa como software architect senior + data analytics engineer y rediseña por completo el apartado de estadísticas de mi sistema actual para convertirlo en un módulo profundamente enfocado en analítica.

No crear un sistema nuevo.

Modificar el módulo de estadísticas existente y convertirlo en un módulo avanzado de análisis.

Objetivo

Hacer que el apartado de estadísticas deje de ser básico y se convierta en un verdadero centro analítico del sistema.

Rediseñar completamente el módulo de estadísticas e implementar:
1. Dashboard analítico principal

Crear panel centrado en métricas reales.

Mostrar:

Tasa de cumplimiento
Discipline score
Consistencia
Índice de procrastinación
Tendencias
Rachas
Productividad
Horas efectivas
2. Análisis de hábitos

Agregar estadísticas específicas para hábitos:

Hábitos más cumplidos
Hábitos más fallados
Frecuencia de incumplimiento
Tendencia por hábito
Evolución en el tiempo
3. Análisis temporal

Agregar análisis por:

Día
Semana
Mes
Trimestre

Detectar:

Mejores días
Peores días
Horarios de mejor desempeño
Horarios de fallos
4. Análisis de patrones

Implementar detección de patrones como:

Dónde más procrastino
Cuándo incumplo más
Tendencias negativas
Tendencias positivas
5. Visualizaciones serias

Agregar gráficos profesionales para análisis:

Series temporales
Tendencias
Distribuciones
Comparativas
Heatmaps
Calendario tipo contribuciones
Cohortes si aplica
6. Insights automáticos

Generar hallazgos automáticos.

Ejemplo:

“Tu cumplimiento baja los lunes.”
“Fallas más cuando programas hábitos después de las 8 PM.”
7. Predicción y proyecciones

Agregar proyecciones:

Proyección de discipline score
Riesgo de abandono
Tendencia futura
8. Filtros avanzados

Permitir filtrar estadísticas por:

Hábito
Categoría
Fecha
Proyecto
Tipo de tarea
9. Exportación de reportes

Permitir exportar:

PDF
CSV
Reportes analíticos
10. Optimizar el módulo para que sea puramente analítico

Replantear el apartado completo con enfoque en data/analytics.

Si es necesario:

Rediseñar arquitectura del módulo
Crear nuevos modelos de datos
Rehacer consultas
Optimizar cálculos
Requisitos técnicos

Actualizar:

Frontend
Backend
Base de datos
Queries
Cálculos
Visualizaciones
Tests
Entregar

Generar:

Rediseño del módulo
Código completo
Nuevo dashboard analítico
Métricas avanzadas
Visualizaciones
Tests

No explicar teoría.

Implementar directamente sobre el proyecto existente.