# ⚡ Instrucciones Rápidas - Configurar Login con Supabase

## 🎯 ¿Qué se ha configurado?

✅ Sistema de login completo con Supabase
✅ Protección de páginas privadas
✅ Archivos de configuración listos
✅ Scripts SQL para base de datos

## 📝 Pasos para Activar el Login

### Paso 1️⃣: Crear Proyecto en Supabase (5 minutos)

1. Ve a **https://supabase.com**
2. Haz clic en **"Start your project"** o **"Sign In"**
3. Crea una cuenta con tu email o GitHub
4. Haz clic en **"New Project"**
5. Completa:
   - **Name**: `tribunal-notificacion`
   - **Database Password**: Crea una contraseña segura y **guárdala**
   - **Region**: Selecciona tu región (ej: South America)
   - **Pricing Plan**: Free (gratis)
6. Haz clic en **"Create new project"**
7. Espera 1-2 minutos mientras se crea el proyecto

### Paso 2️⃣: Obtener Credenciales (1 minuto)

1. En tu proyecto de Supabase, ve al menú lateral izquierdo
2. Haz clic en el ícono de **⚙️ Settings** (Configuración)
3. Haz clic en **"API"**
4. Copia estos dos valores:

   📋 **Project URL**
   ```
   https://xxxxxxxxx.supabase.co
   ```
   
   📋 **anon public** (la clave que dice "anon" "public")
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
   ```

### Paso 3️⃣: Configurar tu Proyecto (2 minutos)

1. Abre el archivo **`supabase-config.js`** en tu editor
2. Reemplaza los valores:

```javascript
// ANTES:
const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';

// DESPUÉS (con tus valores reales):
const SUPABASE_URL = 'https://tuproyecto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

3. Guarda el archivo

### Paso 4️⃣: Crear la Base de Datos (2 minutos)

1. En Supabase, haz clic en **🔨 SQL Editor** en el menú lateral
2. Haz clic en **"New query"**
3. Abre el archivo **`supabase-database-setup.sql`** de tu proyecto
4. **Copia TODO el contenido** del archivo
5. **Pega** el contenido en el editor SQL de Supabase
6. Haz clic en **"Run"** (botón verde abajo a la derecha)
7. Espera a que aparezca **"Success. No rows returned"**

### Paso 5️⃣: Crear tu Usuario (1 minuto)

**Opción Fácil - Desde Supabase:**

1. En Supabase, haz clic en **👤 Authentication** en el menú lateral
2. Haz clic en **"Add user"** (botón verde)
3. Selecciona **"Create new user"**
4. Completa:
   - **Email**: tu-email@ejemplo.com
   - **Password**: tu-contraseña-segura
   - **Auto Confirm User**: ✅ Activar (para no requerir confirmación por email)
5. Haz clic en **"Create user"**

### Paso 6️⃣: ¡Probar el Login! (1 minuto)

1. Abre el archivo **`2.login.html`** en tu navegador
2. Ingresa el email y contraseña que creaste
3. Haz clic en **"Ingresar"**
4. Si todo está bien, serás redirigido al dashboard 🎉

## ✅ Verificación Rápida

Si el login funciona correctamente:
- ✅ Aparece "¡Inicio de sesión exitoso!"
- ✅ Eres redirigido a `5.notificador-dashboard.html`
- ✅ No puedes acceder al dashboard sin iniciar sesión

## ❌ Problemas Comunes

### "Error de conexión"
- ❌ No configuraste `supabase-config.js` correctamente
- ✅ Verifica que copiaste bien la URL y la clave

### "Correo o contraseña incorrectos"
- ❌ El usuario no existe en Supabase
- ✅ Ve a Authentication > Users y verifica que el usuario exista

### "Invalid API key"
- ❌ La clave copiada tiene espacios o está incompleta
- ✅ Vuelve a copiar la clave `anon public` completa

### La página se queda en blanco
- ❌ No tienes los scripts de Supabase cargados
- ✅ Verifica que `supabase-config.js` exista y esté bien configurado

## 🎓 Próximos Pasos

Después de configurar el login, puedes:

1. **Proteger otras páginas**: Agrega las mismas líneas que están en `5.notificador-dashboard.html`
2. **Crear más usuarios**: Usa la opción de Authentication en Supabase
3. **Personalizar perfiles**: Modifica la tabla `perfiles` en SQL Editor
4. **Agregar notificaciones**: Inserta datos en la tabla `notificaciones`

## 📚 Archivos Importantes

| Archivo | ¿Para qué sirve? |
|---------|------------------|
| `supabase-config.js` | 🔑 Configuración de credenciales (DEBES EDITAR) |
| `2.login.html` | 🚪 Página de inicio de sesión |
| `auth-guard.js` | 🛡️ Protege páginas privadas |
| `supabase-database-setup.sql` | 🗄️ Crea todas las tablas |
| `SUPABASE_SETUP.md` | 📖 Guía detallada completa |

## 💡 Consejos

- 🔐 **NUNCA** compartas tu `service_role` key (solo usa la `anon` key)
- 📧 Guarda tus credenciales de Supabase en un lugar seguro
- 🔄 Si cambias algo en la base de datos, ejecuta de nuevo el script SQL
- 🧪 Prueba crear varios usuarios para probar el sistema

## 🆘 ¿Necesitas Ayuda?

1. Revisa la consola del navegador (F12) para ver errores
2. Lee el archivo `SUPABASE_SETUP.md` para más detalles
3. Consulta la documentación de Supabase: https://supabase.com/docs

---

**¡Listo! Tu sistema de login con Supabase está configurado 🎉**
