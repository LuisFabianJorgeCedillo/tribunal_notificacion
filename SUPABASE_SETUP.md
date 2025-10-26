# 🚀 Guía de Configuración de Supabase

## Paso 1: Crear tu proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa los datos:
   - **Name**: tribunal-notificacion
   - **Database Password**: (Guarda esta contraseña en un lugar seguro)
   - **Region**: Selecciona la más cercana a tu ubicación
5. Haz clic en "Create new project" y espera unos 2 minutos

## Paso 2: Obtener las credenciales

1. En el panel de tu proyecto, ve a **Settings** (⚙️) > **API**
2. Copia estos valores:
   - **Project URL**: Tu URL de Supabase (ej: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public**: Tu clave pública (un string largo que empieza con `eyJ...`)

## Paso 3: Configurar las credenciales en tu proyecto

1. Abre el archivo `supabase-config.js`
2. Reemplaza `TU_SUPABASE_URL` con tu Project URL
3. Reemplaza `TU_SUPABASE_ANON_KEY` con tu anon public key

Ejemplo:
```javascript
const SUPABASE_URL = 'https://abcdefghijk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Paso 4: Crear la tabla de usuarios (OPCIONAL)

Supabase ya tiene un sistema de autenticación incorporado que usa la tabla `auth.users`.
No necesitas crear tablas adicionales para el login básico.

### Si quieres agregar información adicional de usuarios:

1. Ve a **Table Editor** en el panel de Supabase
2. Crea una nueva tabla llamada `perfiles` o `notificadores`:

```sql
create table public.perfiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text,
  apellido text,
  telefono text,
  rol text default 'notificador',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.perfiles enable row level security;

-- Política: Los usuarios pueden ver y editar su propio perfil
create policy "Los usuarios pueden ver su propio perfil"
  on public.perfiles for select
  using ( auth.uid() = id );

create policy "Los usuarios pueden actualizar su propio perfil"
  on public.perfiles for update
  using ( auth.uid() = id );

-- Función para crear perfil automáticamente al registrar usuario
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre, apellido)
  values (new.id, '', '');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para crear perfil automáticamente
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Paso 5: Crear tu primer usuario

### Opción A: Desde el código (Registro)
Usa la función de registro en tu aplicación.

### Opción B: Desde el panel de Supabase
1. Ve a **Authentication** > **Users**
2. Haz clic en "Add user" > "Create new user"
3. Ingresa:
   - **Email**: tu-email@ejemplo.com
   - **Password**: tu-contraseña-segura
4. Haz clic en "Create user"

## Paso 6: Configurar políticas de seguridad (RLS)

Por defecto, Supabase tiene Row Level Security (RLS) habilitado en las tablas nuevas.
Para `auth.users`, la autenticación ya está manejada por Supabase.

## Paso 7: Probar el login

1. Abre el archivo `2.login.html` en tu navegador
2. Ingresa el email y contraseña del usuario que creaste
3. Haz clic en "Ingresar"
4. Si todo está correcto, serás redirigido al dashboard

## 🔒 Seguridad

- **NUNCA** compartas tu `service_role` key públicamente
- Usa solo la `anon` key en tu código del frontend
- Mantén las políticas RLS habilitadas
- Usa contraseñas seguras para la base de datos

## 📚 Recursos adicionales

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentación de JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## ❓ Solución de problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente la `anon` key
- Asegúrate de no tener espacios al inicio o final

### Error: "Failed to fetch"
- Verifica que la URL de Supabase sea correcta
- Revisa la consola del navegador para más detalles

### El login no funciona
- Ve a **Authentication** > **Users** en Supabase
- Verifica que el usuario exista y esté confirmado
- Revisa los logs en **Authentication** > **Logs**
