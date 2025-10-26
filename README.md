"# 🏛️ Sistema de Notificaciones Judiciales (SAGJ)

Sistema Automatizado de Gestión Judicial - Módulo de Notificaciones con Supabase

## 📋 Descripción

Sistema web para gestionar notificaciones judiciales con autenticación mediante Supabase. Permite a los notificadores gestionar sus asignaciones diarias, registrar entregas y mantener un historial completo de sus actividades.

## ✨ Características

- ✅ **Autenticación segura** con Supabase
- 📱 **Sistema de login** completo
- 🔐 **Protección de rutas** para páginas privadas
- 👤 **Gestión de perfiles** de usuario
- 📊 **Dashboard** con resumen diario
- 🗺️ **Geolocalización** de entregas
- 📸 **Captura de evidencias** (fotos, firmas)
- 📜 **Historial** completo de notificaciones

## 🚀 Configuración Rápida

### 1. Configurar Supabase

Sigue las instrucciones detalladas en el archivo [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)

**Pasos resumidos:**
1. Crea una cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Obtén tu `Project URL` y `anon key`
4. Configura las credenciales en `supabase-config.js`

### 2. Configurar la Base de Datos

1. Abre el SQL Editor en tu proyecto de Supabase
2. Copia el contenido de `supabase-database-setup.sql`
3. Ejecuta el script SQL
4. Esto creará todas las tablas, políticas de seguridad y funciones necesarias

### 3. Crear tu Primer Usuario

**Opción A: Desde Supabase Dashboard**
1. Ve a Authentication > Users
2. Click en "Add user" > "Create new user"
3. Ingresa email y contraseña
4. Click en "Create user"

**Opción B: Usar la página de registro**
- Abre `ejemplo-registro.html` en tu navegador
- Completa el formulario
- El usuario se creará automáticamente

### 4. Abrir la Aplicación

1. Abre `2.login.html` en tu navegador
2. Ingresa las credenciales del usuario creado
3. ¡Listo! Serás redirigido al dashboard

## 📁 Estructura del Proyecto

```
tribunal_notificacion/
├── 2.login.html                    # Página de inicio de sesión ⭐
├── ejemplo-registro.html           # Página de registro de usuarios
├── 5.notificador-dashboard.html   # Dashboard principal (protegido)
├── supabase-config.js             # Configuración de Supabase ⭐
├── auth-guard.js                  # Protección de rutas
├── supabase-database-setup.sql    # Script SQL para crear BD ⭐
├── SUPABASE_SETUP.md              # Guía detallada de configuración ⭐
├── styles.css                     # Estilos globales
└── img/                           # Recursos de imágenes
```

**⭐ = Archivos importantes para la configuración de Supabase**

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Políticas de acceso** configuradas por rol
- **Autenticación JWT** mediante Supabase
- **Solo la clave pública** (`anon key`) se usa en el frontend
- **Contraseñas hasheadas** automáticamente por Supabase

## 🛠️ Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos
- **JavaScript (Vanilla)** - Lógica del frontend
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Row Level Security
  - Real-time subscriptions (opcional)

## 📱 Páginas del Sistema

### Públicas (sin autenticación)
- `2.login.html` - Inicio de sesión
- `3.recuperar-password.html` - Recuperación de contraseña
- `4.verificar-codigo.html` - Verificación de código
- `ejemplo-registro.html` - Registro de usuarios

### Privadas (requieren autenticación)
- `5.notificador-dashboard.html` - Dashboard principal
- `6.notificador-hoy.html` - Notificaciones de hoy
- `7.notificador-pendientes.html` - Pendientes
- `8.notificador-enviadas.html` - Historial de enviadas
- `9.notificador-nueva.html` - Nueva notificación
- `10.notificador-historial.html` - Historial completo
- `11.notificador-ubicacion.html` - Mapa de ubicaciones
- `12.notificador-confirmacion.html` - Confirmación de entrega
- `notificador-detalle.html` - Detalle de notificación
- `notificador-perfil.html` - Perfil de usuario

## 🎯 Uso

### Iniciar Sesión
```javascript
// El login se maneja automáticamente en 2.login.html
// Solo ingresa email y contraseña en el formulario
```

### Proteger Páginas Adicionales
Para proteger otras páginas, agrega en el `<head>`:
```html
<!-- Supabase JS Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<!-- Configuración de Supabase -->
<script src="supabase-config.js"></script>
<!-- Protección de autenticación -->
<script src="auth-guard.js" defer></script>
```

### Cerrar Sesión
Agrega un botón con el atributo `data-logout`:
```html
<button data-logout>Cerrar Sesión</button>
```

## 🗃️ Base de Datos

### Tablas Principales

**perfiles**
- Información adicional de usuarios
- Nombre, apellido, teléfono, rol, etc.

**notificaciones**
- Notificaciones judiciales asignadas
- Estado, prioridad, fechas, ubicación

**historial_notificaciones**
- Registro de cambios de estado
- Auditoría completa

### Roles de Usuario
- `notificador` - Usuario estándar
- `supervisor` - Supervisor de notificadores
- `admin` - Administrador del sistema

## 🔧 Personalización

### Cambiar Colores o Estilos
Edita `styles.css`

### Agregar Campos al Perfil
1. Agrega columnas en `supabase-database-setup.sql`
2. Ejecuta las migraciones en Supabase
3. Actualiza los formularios correspondientes

### Modificar Roles de Usuario
Edita el CHECK constraint en la tabla `perfiles`:
```sql
rol TEXT DEFAULT 'notificador' CHECK (rol IN ('notificador', 'admin', 'supervisor', 'tu_nuevo_rol'))
```

## 📞 Soporte

Para problemas con:
- **Supabase**: Revisa [docs.supabase.com](https://docs.supabase.com)
- **Autenticación**: Lee `SUPABASE_SETUP.md`
- **Base de datos**: Revisa `supabase-database-setup.sql`

## 📝 Licencia

Este proyecto es de uso interno para el Sistema Automatizado de Gestión Judicial.

## 🤝 Contribuir

1. Realiza un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Desarrollado con ❤️ para el Sistema Judicial**
" 
