# Acuerdos de trabajo – Staffy

## Gestión del trabajo
- Todo el trabajo se registra en Jira.
- Ninguna funcionalidad se desarrolla sin historia asignada.

## Control de versiones
- Cada integrante trabaja en su propia rama.
- La rama `main` se mantiene estable.
- Los cambios se integran mediante Pull Requests.

## Comunicación
- Cambios importantes se documentan en el repositorio.
- Las decisiones técnicas se registran en Jira o en /docs.

## Calidad
- Todo código debe ser revisado antes de integrarse.

### Ramas mínimas recomendadas:

main        → versión estable  
develop     → integración del trabajo  
feature/*   → nuevas funcionalidades  
fix/*       → correcciones

### Ejemplos:

- `feature/login-voluntario`
    
- `feature/publicacion-voluntariado`
    
- `fix/validacion-formulario`

## Reglas generales
- Usar nombres claros en commits
- Respetar la estructura del proyecto
- No subir código sin probar

## Commits
Formato recomendado:
feat: nueva funcionalidad
fix: corrección de error
docs: documentación

### Ejemplo:
feat: agregar formulario de registro