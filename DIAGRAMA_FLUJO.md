# 🔄 Flujo de Autenticación - Diagrama

## 📊 Cómo Funciona el Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE AUTENTICACIÓN                      │
│                        CON SUPABASE                              │
└─────────────────────────────────────────────────────────────────┘

1️⃣ USUARIO NO AUTENTICADO
┌────────────────┐
│ Usuario abre   │
│ 2.login.html   │
└───────┬────────┘
        │
        ▼
┌────────────────────────────┐
│  Ingresa email y password  │
└───────┬────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│  JavaScript envía credenciales         │
│  a Supabase usando:                    │
│  supabase.auth.signInWithPassword()    │
└───────┬────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│  Supabase verifica:                    │
│  ✓ ¿Existe el usuario?                 │
│  ✓ ¿La contraseña es correcta?         │
│  ✓ ¿Está confirmado el email?          │
└───────┬────────────────────────────────┘
        │
        ├──────────── ✅ CORRECTO ───────────┐
        │                                     │
        │                                     ▼
        │                        ┌────────────────────────┐
        │                        │ Supabase crea sesión   │
        │                        │ y devuelve JWT token   │
        │                        └────────┬───────────────┘
        │                                 │
        │                                 ▼
        │                        ┌────────────────────────┐
        │                        │ Redirige al usuario a  │
        │                        │ 5.notificador-         │
        │                        │ dashboard.html         │
        │                        └────────────────────────┘
        │
        └──────────── ❌ INCORRECTO ────────┐
                                             │
                                             ▼
                                ┌────────────────────────┐
                                │ Muestra mensaje error  │
                                │ "Credenciales          │
                                │  incorrectas"          │
                                └────────────────────────┘


2️⃣ ACCESO A PÁGINA PROTEGIDA
┌────────────────┐
│ Usuario intenta│
│ abrir dashboard│
└───────┬────────┘
        │
        ▼
┌────────────────────────────────────────┐
│  auth-guard.js se ejecuta              │
│  automáticamente en el <head>          │
└───────┬────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│  Verifica sesión:                      │
│  supabase.auth.getSession()            │
└───────┬────────────────────────────────┘
        │
        ├──────────── ✅ HAY SESIÓN ────────┐
        │                                    │
        │                                    ▼
        │                        ┌───────────────────────┐
        │                        │ Permite ver la página │
        │                        │ Usuario autenticado   │
        │                        └───────────────────────┘
        │
        └──────────── ❌ NO HAY SESIÓN ────┐
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │ Redirige a            │
                                │ 2.login.html          │
                                └───────────────────────┘


3️⃣ CERRAR SESIÓN
┌────────────────┐
│ Usuario hace   │
│ clic en botón  │
│ [data-logout]  │
└───────┬────────┘
        │
        ▼
┌────────────────────────────────────────┐
│  auth-guard.js detecta el clic         │
└───────┬────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│  Muestra confirmación:                 │
│  "¿Estás seguro que deseas cerrar      │
│   sesión?"                             │
└───────┬────────────────────────────────┘
        │
        ├──────────── ✅ SÍ ──────────────┐
        │                                  │
        │                                  ▼
        │                     ┌────────────────────────┐
        │                     │ supabase.auth.signOut()│
        │                     └────────┬───────────────┘
        │                              │
        │                              ▼
        │                     ┌────────────────────────┐
        │                     │ Redirige a             │
        │                     │ 2.login.html           │
        │                     └────────────────────────┘
        │
        └──────────── ❌ NO ───────────────┐
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │ Permanece en la página│
                                └───────────────────────┘
```

## 🔐 Componentes del Sistema

### Frontend (Tu Proyecto)
```
┌─────────────────────────────────────────┐
│         ARCHIVOS HTML                   │
├─────────────────────────────────────────┤
│  2.login.html           (Público)       │
│  5.dashboard.html       (Protegido)     │
│  ...otras páginas...    (Protegido)     │
└──────────────┬──────────────────────────┘
               │ usa
               ▼
┌─────────────────────────────────────────┐
│       ARCHIVOS JAVASCRIPT               │
├─────────────────────────────────────────┤
│  supabase-config.js    (Configuración)  │
│  auth-guard.js         (Protección)     │
│  ejemplos-supabase.js  (Utilidades)     │
└──────────────┬──────────────────────────┘
               │ conecta con
               ▼
┌─────────────────────────────────────────┐
│      SUPABASE JS CLIENT                 │
│  (@supabase/supabase-js)                │
│  Cargado desde CDN                      │
└──────────────┬──────────────────────────┘
               │ API calls
               ▼
```

### Backend (Supabase)
```
┌─────────────────────────────────────────┐
│           SUPABASE CLOUD                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   AUTHENTICATION                 │  │
│  │   ✓ Gestión de usuarios          │  │
│  │   ✓ Manejo de sesiones (JWT)     │  │
│  │   ✓ Encriptación de passwords    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   POSTGRESQL DATABASE            │  │
│  │   ✓ auth.users (tabla de Supabase)│ │
│  │   ✓ public.perfiles              │  │
│  │   ✓ public.notificaciones        │  │
│  │   ✓ public.historial             │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   ROW LEVEL SECURITY (RLS)       │  │
│  │   ✓ Políticas de acceso          │  │
│  │   ✓ Filtros automáticos          │  │
│  │   ✓ Seguridad por usuario        │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## 🛡️ Seguridad del Sistema

```
┌─────────────────────────────────────────┐
│        CAPAS DE SEGURIDAD               │
└─────────────────────────────────────────┘

Capa 1: Frontend Protection
├─ auth-guard.js verifica sesión
├─ Redirige si no hay token
└─ Solo check del lado del cliente

Capa 2: JWT Token
├─ Token firmado por Supabase
├─ Expira automáticamente
├─ Se envía en cada petición
└─ Verificado por Supabase

Capa 3: Row Level Security (RLS)
├─ Filtros a nivel de base de datos
├─ Los usuarios solo ven sus datos
├─ Políticas definidas en SQL
└─ No se puede saltear desde el frontend

Capa 4: Supabase Auth
├─ Passwords hasheados (bcrypt)
├─ Sesiones con refresh tokens
├─ Límite de intentos de login
└─ Confirmación de email (opcional)
```

## 📈 Flujo de Datos

```
CONSULTAR NOTIFICACIONES
═══════════════════════════════════════

Frontend                     Supabase
────────                     ────────
   │
   │  1. Obtener mis notificaciones
   ├──────────────────────────────────►
   │     supabase                      │
   │       .from('notificaciones')     │
   │       .select('*')                │
   │       .eq('notificador_id',       │
   │            user.id)               │
   │                                   │
   │                     2. Verificar JWT token
   │                              │
   │                              ▼
   │                     3. Aplicar RLS
   │                        (filtros automáticos)
   │                              │
   │                              ▼
   │                     4. Ejecutar query
   │                        en PostgreSQL
   │                              │
   │  5. Devolver solo           │
   ◄───────────────────────────────
      datos permitidos
   │
   ▼
Mostrar en la UI
```

## 🎯 Archivos y Su Función

```
PÁGINA DE LOGIN (2.login.html)
═══════════════════════════════════════
┌────────────────────────────────────┐
│ <head>                             │
│   <script src="cdn../supabase">   │──┐
│   <script src="supabase-config">  │  │ Cargan en orden
│ </head>                            │  │
└────────────────────────────────────┘  │
                                        │
┌────────────────────────────────────┐  │
│ <script>                           │◄─┘
│   form.submit → async              │
│     supabase.auth                  │
│       .signInWithPassword()        │
│ </script>                          │
└────────────────────────────────────┘


PÁGINA PROTEGIDA (5.dashboard.html)
═══════════════════════════════════════
┌────────────────────────────────────┐
│ <head>                             │
│   <script src="cdn../supabase">   │──┐
│   <script src="supabase-config">  │  │ Cargan en orden
│   <script src="auth-guard" defer> │  │
│ </head>                            │  │
└────────────────────────────────────┘  │
                                        │
┌────────────────────────────────────┐  │
│ auth-guard.js                      │◄─┘
│   → checkAuth()                    │
│   → si no hay sesión:              │
│       window.location = login      │
│   → si hay sesión:                 │
│       permitir ver página          │
└────────────────────────────────────┘
```

## 🔄 Estados de Sesión

```
Estados Posibles:
─────────────────

1. NO AUTENTICADO
   ├─ No hay JWT token
   ├─ session = null
   └─ → Redirige a login

2. AUTENTICADO ACTIVO
   ├─ JWT token válido
   ├─ session.expires_at > now
   └─ → Permite acceso

3. TOKEN EXPIRADO
   ├─ JWT token expirado
   ├─ Intenta refresh automático
   ├─ Si falla → session = null
   └─ → Redirige a login

4. SESIÓN CERRADA
   ├─ Usuario hizo logout
   ├─ Token invalidado
   └─ → Redirige a login
```

## 💾 Almacenamiento

```
¿Dónde se guarda la sesión?
───────────────────────────

Browser Storage (automático por Supabase)
├─ localStorage
│  └─ supabase.auth.token
│     ├─ access_token (JWT)
│     ├─ refresh_token
│     └─ expires_at
│
└─ Cookies (opcional)
   └─ Para configuraciones avanzadas

⚠️ IMPORTANTE:
- NO guardes passwords en localStorage
- NO guardes service_role key en el frontend
- Supabase maneja el storage automáticamente
```

## 🎓 Ejemplo Completo de Flujo

```
USUARIO QUIERE VER SUS NOTIFICACIONES
═══════════════════════════════════════

1. Usuario abre navegador
   └─ localStorage vacío

2. Abre 2.login.html
   ├─ Ingresa email y password
   └─ Click en "Ingresar"

3. JavaScript envía a Supabase
   ├─ Supabase verifica credenciales
   ├─ Crea sesión
   └─ Devuelve JWT token

4. Token se guarda automáticamente
   └─ localStorage['supabase.auth.token']

5. Redirige a dashboard
   └─ window.location = '5.dashboard.html'

6. Dashboard carga
   ├─ auth-guard.js se ejecuta
   ├─ Lee token de localStorage
   ├─ Verifica con Supabase
   └─ ✅ Sesión válida → muestra página

7. JavaScript obtiene notificaciones
   ├─ supabase.from('notificaciones').select()
   ├─ Envía JWT en headers (automático)
   ├─ Supabase aplica RLS
   └─ Devuelve solo notificaciones del usuario

8. UI se actualiza
   └─ Muestra notificaciones en la página

9. Usuario hace clic en [Cerrar Sesión]
   ├─ supabase.auth.signOut()
   ├─ Borra token de localStorage
   └─ Redirige a 2.login.html
```

---

¡Este es el flujo completo de autenticación de tu sistema! 🎉
