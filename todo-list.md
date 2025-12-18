# Todo List: Panel de Admin con Login y Acceso a Errores

Basándome en la estructura actual del proyecto (backend en Node.js/TypeScript con Express, Pug para vistas, repositorios Postgres y JSON), aquí tienes un todo list detallado para factorizar el código y crear el panel de admin. El panel permitirá que un usuario se loguee y acceda a los errores cargados, todo en Pug. He dividido las tareas en fases lógicas, priorizando la autenticación y la refactorización.

## Fase 1: Preparación y Dependencias
- **Instalar dependencias necesarias**: Agregar `express-session` para manejar sesiones, `bcrypt` para hashear contraseñas, y `connect-session-sequelize` o similar si usas Sequelize (verifica si ya lo tienes). Ejecuta `pnpm add express-session bcrypt`.
- **Configurar sesiones en server.ts**: Agregar middleware de sesiones para manejar login/logout.
- **Crear archivo de configuración de auth**: Un archivo como `authConfig.ts` para centralizar configuración de sesiones y JWT si es necesario.

## Fase 2: Modelos y Repositorios
- **Completar modelo Usuario.ts**: Implementar la clase `Usuario` basada en la interfaz `IUsuario`, con métodos para validar credenciales.
- **Crear repositorio para usuarios**: Un nuevo archivo `RepoPostgresUsuario.ts` en `repo/`, implementando `IRepoBase` para operaciones CRUD de usuarios (crear, obtener por username, etc.).
- **Actualizar db_config.ts**: Asegurar que la conexión a Postgres incluya tabla para usuarios (si no existe, agregar migración o script de creación).

## Fase 3: Autenticación y Middleware
- **Implementar LoginController.ts**: Crear métodos `login(req, res)`, `logout(req, res)`, y `isAuthenticated(req, res)`. Usar bcrypt para verificar passwords.
- **Crear middleware de autenticación**: Un archivo `authMiddleware.ts` con función `requireAuth` para proteger rutas (ej. redirigir a login si no autenticado).
- **Actualizar router.ts**: Agregar rutas para `/login` (GET/POST), `/logout`, y `/admin` (protegida). Mover lógica de rutas existentes a controladores si es necesario.

## Fase 4: Controladores y Lógica de Negocio
- **Implementar ErroresController.ts**: Crear métodos `getAllErrors(req, res)` para obtener y mostrar errores en el panel de admin.
- **Refactorizar ErroresRouter.ts**: Mover la lógica de rutas a los controladores correspondientes (ej. `registrar-error` a ErroresController). Usar controladores en lugar de lógica inline.
- **Agregar validación en controladores**: Usar middleware para validar inputs (ej. Joi o express-validator).

## Fase 5: Vistas en Pug
- **Crear login.pug**: Vista para formulario de login (campos username/password, botón submit). Ubicarla en `views/`.
- **Crear admin.pug**: Vista del panel de admin, mostrando lista de errores (usar datos de ErroresController). Incluir navegación, tabla de errores con columnas como refDocumento, responsable, fecha, etc. Agregar logout.
- **Actualizar index.pug**: Si es necesario, agregar enlace al login o redirigir si no autenticado.

## Fase 6: Rutas y Integración
- **Actualizar router.ts**: Integrar rutas de auth y admin, aplicando middleware `requireAuth` a `/admin`. Asegurar que `/api/*` siga funcionando para APIs existentes.
- **Agregar rutas estáticas**: En server.ts, servir archivos CSS/JS del panel si es necesario (ya tienes `public/`).

## Fase 7: Pruebas y Seguridad
- **Agregar seed de usuarios**: Crear un script o migración para insertar usuarios de prueba en la DB.
- **Implementar logout seguro**: Limpiar sesiones correctamente.
- **Validar y probar**: Ejecutar build/tests para asegurar que no rompa APIs existentes. Probar login, acceso a admin, y logout.
- **Seguridad adicional**: Agregar rate limiting, CSRF protection si es web app completa.

## Fase 8: Refactorización General
- **Separar responsabilidades**: Mover lógica de negocio de router a controladores. Usar inyección de dependencias para repositorios.
- **Manejo de errores**: Centralizar notificaciones y errores en un servicio común.
- **Documentación**: Agregar comentarios JSDoc en nuevos archivos.