// ============================================
// CONFIGURACIÓN DE SUPABASE
// Sistema de Notificaciones Judiciales
// ============================================

// Reemplaza estos valores con los de tu proyecto en https://app.supabase.com
const SUPABASE_URL = 'https://ihndwzvvcugaaxsoshoj.supabase.co'; // Ej: https://tu-proyecto.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobmR3enZ2Y3VnYWF4c29zaG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTU5MzksImV4cCI6MjA3NzA3MTkzOX0.B2hIrHzM6AAQdz4xz-YOxjVMPyK12oSNRJGQuCQ4pk4'; // Tu clave pública (anon key)

// ============================================
// CONFIGURACIÓN DE SEGURIDAD (MEJORES PRÁCTICAS)
// ============================================

// Tiempo de inactividad antes de cerrar sesión (en milisegundos)
// 15 minutos = 900000ms (estándar bancario)
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos

// Tiempo para advertencia antes de cerrar sesión
const WARNING_BEFORE_LOGOUT = 2 * 60 * 1000; // 2 minutos antes

// Claves para localStorage
const LAST_ACTIVITY_KEY = 'sagj_last_activity';
const SESSION_START_KEY = 'sagj_session_start';

// ============================================
// INICIALIZAR CLIENTE DE SUPABASE
// ============================================

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Verificar si el usuario está autenticado
 * Incluye validación de timeout de sesión
 */
async function checkAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error al verificar sesión:', error);
      return null;
    }

    // Si hay sesión, verificar si ha expirado por inactividad
    if (session && !isSessionValid()) {
      console.log('Sesión expirada por inactividad');
      await signOut(true);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error en checkAuth:', error);
    return null;
  }
}

/**
 * Obtener el usuario actual
 */
async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    return null;
  }
}

/**
 * Cerrar sesión
 * @param {boolean} silent - Si es true, no pide confirmación
 */
async function signOut(silent = false) {
  try {
    clearSessionData();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error al cerrar sesión:', error);
      return { success: false, error };
    }

    window.location.href = '2.login.html';
    return { success: true };
    
  } catch (error) {
    console.error('Error en signOut:', error);
    return { success: false, error };
  }
}

// ============================================
// GESTIÓN DE TIMEOUT DE SESIÓN
// ============================================

/**
 * Inicializar seguimiento de actividad del usuario
 */
function initSessionTracking() {
  const now = Date.now();
  localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
  localStorage.setItem(SESSION_START_KEY, now.toString());
  
  // Eventos que indican actividad del usuario
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  
  activityEvents.forEach(event => {
    document.addEventListener(event, updateLastActivity, { passive: true });
  });

  // Iniciar monitoreo
  startSessionMonitoring();
}

/**
 * Actualizar timestamp de última actividad
 */
function updateLastActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

/**
 * Verificar si la sesión es válida (no expirada por inactividad)
 */
function isSessionValid() {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  
  if (!lastActivity) {
    return false;
  }

  const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
  return timeSinceLastActivity < SESSION_TIMEOUT;
}

/**
 * Obtener tiempo restante de sesión en milisegundos
 */
function getRemainingSessionTime() {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  
  if (!lastActivity) {
    return 0;
  }

  const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
  const remaining = SESSION_TIMEOUT - timeSinceLastActivity;
  
  return remaining > 0 ? remaining : 0;
}

/**
 * Limpiar datos de sesión
 */
function clearSessionData() {
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  localStorage.removeItem(SESSION_START_KEY);
  localStorage.removeItem('user_email');
}

/**
 * Monitorear sesión cada 30 segundos
 */
function startSessionMonitoring() {
  setInterval(async () => {
    const remaining = getRemainingSessionTime();
    
    // Advertencia 2 minutos antes
    if (remaining > 0 && remaining <= WARNING_BEFORE_LOGOUT && !window.sessionWarningShown) {
      showSessionWarning(remaining);
    }
    
    // Sesión expirada
    if (remaining <= 0) {
      console.log('⏱️ Sesión expirada por inactividad');
      await signOut(true);
    }
  }, 30000); // Cada 30 segundos
}

/**
 * Mostrar advertencia de sesión por expirar
 */
function showSessionWarning(remaining) {
  window.sessionWarningShown = true;
  
  const minutes = Math.ceil(remaining / 60000);
  
  const shouldContinue = confirm(
    `⚠️ ADVERTENCIA DE SEGURIDAD\n\n` +
    `Tu sesión expirará en ${minutes} minuto(s) por inactividad.\n\n` +
    `¿Deseas continuar con tu sesión?`
  );

  if (shouldContinue) {
    updateLastActivity();
    window.sessionWarningShown = false;
    console.log('✅ Sesión extendida por el usuario');
  } else {
    signOut(true);
  }
}

/**
 * Formatear tiempo restante
 */
function formatSessionTime() {
  const remaining = getRemainingSessionTime();
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// LISTENERS DE AUTENTICACIÓN
// ============================================

supabase.auth.onAuthStateChange((event, session) => {
  console.log(`🔐 Auth event: ${event}`);
  
  if (event === 'SIGNED_IN') {
    console.log('✅ Usuario inició sesión');
    initSessionTracking();
  } else if (event === 'SIGNED_OUT') {
    console.log('👋 Usuario cerró sesión');
    clearSessionData();
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token renovado');
  }
});

// ============================================
// UTILIDADES PÚBLICAS
// ============================================

window.sessionUtils = {
  getRemainingSessionTime,
  formatSessionTime,
  extendSession: updateLastActivity,
  isSessionValid
};

