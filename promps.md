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
git push -u origin main_