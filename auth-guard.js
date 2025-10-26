// ============================================
// AUTH GUARD - PROTECCIÓN DE RUTAS
// Implementación con mejores prácticas de seguridad
// ============================================

(async function() {
  console.log('🛡️ Auth Guard: Verificando autenticación...');
  
  try {
    // Verificar si el usuario está autenticado
    const session = await checkAuth();
    
    if (!session) {
      // No hay sesión válida, redirigir al login
      console.log('❌ No hay sesión activa - Redirigiendo a login');
      
      // Limpiar cualquier dato residual
      localStorage.removeItem('user_email');
      
      // Redirigir al login
      window.location.href = '2.login.html';
      return;
    }

    // Sesión válida
    console.log('✅ Sesión activa verificada');
    
    // Obtener información del usuario
    const user = await getCurrentUser();
    if (user) {
      console.log(`👤 Usuario: ${user.email}`);
      
      // Mostrar email en elementos con data-user-email
      const userEmailElements = document.querySelectorAll('[data-user-email]');
      userEmailElements.forEach(el => {
        el.textContent = user.email;
      });
      
      // Mostrar tiempo de sesión restante (opcional)
      const sessionTimeElements = document.querySelectorAll('[data-session-time]');
      if (sessionTimeElements.length > 0) {
        updateSessionTimeDisplay();
        // Actualizar cada minuto
        setInterval(updateSessionTimeDisplay, 60000);
      }
    }

  } catch (error) {
    console.error('❌ Error verificando autenticación:', error);
    // En caso de error, redirigir al login por seguridad
    window.location.href = '2.login.html';
  }
})();

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Actualizar displays de tiempo de sesión
 */
function updateSessionTimeDisplay() {
  const sessionTimeElements = document.querySelectorAll('[data-session-time]');
  sessionTimeElements.forEach(el => {
    const timeRemaining = window.sessionUtils?.formatSessionTime() || '--:--';
    el.textContent = timeRemaining;
  });
}

/**
 * Manejar cierre de sesión con confirmación
 */
function handleLogout() {
  const shouldLogout = confirm(
    '¿Estás seguro que deseas cerrar sesión?\n\n' +
    'Deberás volver a iniciar sesión para acceder al sistema.'
  );
  
  if (shouldLogout) {
    console.log('👋 Usuario solicitó cerrar sesión');
    signOut(false).then(({ error }) => {
      if (error) {
        console.error('❌ Error al cerrar sesión:', error);
        alert('Error al cerrar sesión. Por favor intenta nuevamente.');
      }
    });
  } else {
    console.log('ℹ️ Cierre de sesión cancelado por el usuario');
  }
}

/**
 * Extender sesión (renovar timeout)
 */
function handleExtendSession() {
  if (window.sessionUtils?.extendSession) {
    window.sessionUtils.extendSession();
    
    // Feedback visual
    const btn = event?.target;
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✓ Sesión extendida';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }
    
    console.log('⏱️ Sesión extendida manualmente');
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Botones de logout
  const logoutButtons = document.querySelectorAll('[data-logout]');
  logoutButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });
  
  // Botones para extender sesión (opcional)
  const extendButtons = document.querySelectorAll('[data-extend-session]');
  extendButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      handleExtendSession();
    });
  });
  
  console.log(`🔘 ${logoutButtons.length} botón(es) de logout configurados`);
});

// ============================================
// PREVENCIÓN DE NAVEGACIÓN HACIA ATRÁS
// ============================================

// Evitar que el usuario regrese con el botón "atrás" del navegador
// después de cerrar sesión
window.addEventListener('pageshow', function(event) {
  // Si la página se carga desde caché (botón atrás)
  if (event.persisted) {
    console.log('⚠️ Página cargada desde caché - Verificando sesión...');
    // Verificar sesión nuevamente
    checkAuth().then(session => {
      if (!session) {
        window.location.href = '2.login.html';
      }
    });
  }
});

