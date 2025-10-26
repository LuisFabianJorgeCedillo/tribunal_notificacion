// ============================================
// EJEMPLOS DE USO DE SUPABASE
// Sistema de Notificaciones Judiciales
// ============================================

// Este archivo contiene ejemplos de cómo interactuar con Supabase
// Copia y adapta estos ejemplos según tus necesidades

// ============================================
// 1. AUTENTICACIÓN
// ============================================

// Registrar un nuevo usuario
async function registrarUsuario(email, password, nombre, apellido) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        nombre: nombre,
        apellido: apellido,
        rol: 'notificador'
      }
    }
  });

  if (error) {
    console.error('Error al registrar:', error);
    return { success: false, error };
  }

  return { success: true, user: data.user };
}

// Iniciar sesión
async function iniciarSesion(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error('Error al iniciar sesión:', error);
    return { success: false, error };
  }

  return { success: true, session: data.session, user: data.user };
}

// Cerrar sesión
async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error al cerrar sesión:', error);
    return { success: false, error };
  }

  return { success: true };
}

// Obtener usuario actual
async function obtenerUsuarioActual() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Verificar si hay sesión activa
async function verificarSesion() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Cambiar contraseña
async function cambiarPassword(nuevaPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: nuevaPassword
  });

  if (error) {
    console.error('Error al cambiar contraseña:', error);
    return { success: false, error };
  }

  return { success: true };
}

// Recuperar contraseña (enviar email)
async function recuperarPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/1.cambiar-password.html'
  });

  if (error) {
    console.error('Error al recuperar contraseña:', error);
    return { success: false, error };
  }

  return { success: true };
}

// ============================================
// 2. PERFILES DE USUARIO
// ============================================

// Obtener el perfil del usuario actual
async function obtenerMiPerfil() {
  const user = await obtenerUsuarioActual();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error al obtener perfil:', error);
    return null;
  }

  return data;
}

// Actualizar mi perfil
async function actualizarMiPerfil(datosActualizados) {
  const user = await obtenerUsuarioActual();
  
  if (!user) return { success: false, error: 'No hay usuario autenticado' };

  const { data, error } = await supabase
    .from('perfiles')
    .update(datosActualizados)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar perfil:', error);
    return { success: false, error };
  }

  return { success: true, perfil: data };
}

// Ejemplo de uso:
// actualizarMiPerfil({ nombre: 'Juan', apellido: 'Pérez', telefono: '1234567890' });

// ============================================
// 3. NOTIFICACIONES
// ============================================

// Obtener mis notificaciones
async function obtenerMisNotificaciones() {
  const user = await obtenerUsuarioActual();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('notificador_id', user.id)
    .order('fecha_programada', { ascending: false });

  if (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }

  return data;
}

// Obtener notificaciones pendientes
async function obtenerNotificacionesPendientes() {
  const user = await obtenerUsuarioActual();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('notificador_id', user.id)
    .eq('estado', 'pendiente')
    .order('fecha_programada', { ascending: true });

  if (error) {
    console.error('Error al obtener pendientes:', error);
    return [];
  }

  return data;
}

// Obtener notificaciones de hoy
async function obtenerNotificacionesHoy() {
  const user = await obtenerUsuarioActual();
  
  if (!user) return [];

  const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('notificador_id', user.id)
    .eq('fecha_programada', hoy)
    .order('prioridad', { ascending: false });

  if (error) {
    console.error('Error al obtener notificaciones de hoy:', error);
    return [];
  }

  return data;
}

// Obtener una notificación específica
async function obtenerNotificacion(id) {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener notificación:', error);
    return null;
  }

  return data;
}

// Crear nueva notificación (solo admins)
async function crearNotificacion(datosNotificacion) {
  const { data, error } = await supabase
    .from('notificaciones')
    .insert([datosNotificacion])
    .select()
    .single();

  if (error) {
    console.error('Error al crear notificación:', error);
    return { success: false, error };
  }

  return { success: true, notificacion: data };
}

// Ejemplo de uso:
/*
crearNotificacion({
  notificador_id: 'uuid-del-notificador',
  numero_caso: 'CASO-2025-001',
  destinatario_nombre: 'Juan Pérez',
  destinatario_direccion: 'Calle Principal 123',
  tipo_notificacion: 'Citatorio',
  prioridad: 'alta',
  fecha_programada: '2025-10-27'
});
*/

// Actualizar estado de notificación
async function actualizarEstadoNotificacion(id, nuevoEstado, observaciones = null) {
  const datosActualizar = {
    estado: nuevoEstado,
    updated_at: new Date().toISOString()
  };

  if (nuevoEstado === 'entregada' || nuevoEstado === 'no_entregada') {
    datosActualizar.fecha_entrega = new Date().toISOString();
  }

  if (observaciones) {
    datosActualizar.observaciones = observaciones;
  }

  const { data, error } = await supabase
    .from('notificaciones')
    .update(datosActualizar)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar estado:', error);
    return { success: false, error };
  }

  return { success: true, notificacion: data };
}

// Actualizar ubicación de entrega
async function actualizarUbicacion(id, latitud, longitud) {
  const { data, error } = await supabase
    .from('notificaciones')
    .update({
      latitud: latitud,
      longitud: longitud,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar ubicación:', error);
    return { success: false, error };
  }

  return { success: true, notificacion: data };
}

// Subir foto de evidencia
async function subirFotoEvidencia(notificacionId, archivoFoto) {
  const nombreArchivo = `${notificacionId}_${Date.now()}.jpg`;
  
  // Subir archivo a Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('evidencias')
    .upload(nombreArchivo, archivoFoto);

  if (uploadError) {
    console.error('Error al subir foto:', uploadError);
    return { success: false, error: uploadError };
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('evidencias')
    .getPublicUrl(nombreArchivo);

  // Actualizar notificación con URL de la foto
  const { data, error } = await supabase
    .from('notificaciones')
    .update({ foto_evidencia_url: urlData.publicUrl })
    .eq('id', notificacionId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar URL de foto:', error);
    return { success: false, error };
  }

  return { success: true, url: urlData.publicUrl };
}

// ============================================
// 4. ESTADÍSTICAS
// ============================================

// Obtener estadísticas del notificador
async function obtenerEstadisticas() {
  const user = await obtenerUsuarioActual();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('estadisticas_notificador')
    .select('*')
    .eq('notificador_id', user.id)
    .single();

  if (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }

  return data;
}

// Contar notificaciones por estado
async function contarPorEstado() {
  const user = await obtenerUsuarioActual();
  
  if (!user) return null;

  const notificaciones = await obtenerMisNotificaciones();
  
  const estadisticas = {
    total: notificaciones.length,
    pendientes: notificaciones.filter(n => n.estado === 'pendiente').length,
    en_proceso: notificaciones.filter(n => n.estado === 'en_proceso').length,
    entregadas: notificaciones.filter(n => n.estado === 'entregada').length,
    no_entregadas: notificaciones.filter(n => n.estado === 'no_entregada').length
  };

  return estadisticas;
}

// ============================================
// 5. HISTORIAL
// ============================================

// Obtener historial de una notificación
async function obtenerHistorialNotificacion(notificacionId) {
  const { data, error } = await supabase
    .from('historial_notificaciones')
    .select(`
      *,
      perfiles:usuario_id (nombre, apellido)
    `)
    .eq('notificacion_id', notificacionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener historial:', error);
    return [];
  }

  return data;
}

// ============================================
// 6. BÚSQUEDA Y FILTROS
// ============================================

// Buscar notificaciones por texto
async function buscarNotificaciones(textoBusqueda) {
  const user = await obtenerUsuarioActual();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('notificador_id', user.id)
    .or(`numero_caso.ilike.%${textoBusqueda}%,destinatario_nombre.ilike.%${textoBusqueda}%`)
    .order('fecha_programada', { ascending: false });

  if (error) {
    console.error('Error al buscar:', error);
    return [];
  }

  return data;
}

// Filtrar por rango de fechas
async function filtrarPorFechas(fechaInicio, fechaFin) {
  const user = await obtenerUsuarioActual();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('notificador_id', user.id)
    .gte('fecha_programada', fechaInicio)
    .lte('fecha_programada', fechaFin)
    .order('fecha_programada', { ascending: true });

  if (error) {
    console.error('Error al filtrar:', error);
    return [];
  }

  return data;
}

// ============================================
// 7. TIEMPO REAL (SUSCRIPCIONES)
// ============================================

// Escuchar cambios en notificaciones en tiempo real
function suscribirNotificaciones(callback) {
  const user = obtenerUsuarioActual();
  
  const subscription = supabase
    .channel('notificaciones_changes')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'notificaciones',
        filter: `notificador_id=eq.${user.id}`
      },
      (payload) => {
        console.log('Cambio detectado:', payload);
        callback(payload);
      }
    )
    .subscribe();

  // Devolver función para cancelar suscripción
  return () => {
    subscription.unsubscribe();
  };
}

// Ejemplo de uso:
/*
const cancelarSuscripcion = suscribirNotificaciones((cambio) => {
  console.log('Nueva notificación o actualización:', cambio);
  // Actualizar la UI aquí
});

// Cuando ya no necesites la suscripción:
// cancelarSuscripcion();
*/

// ============================================
// 8. UTILIDADES
// ============================================

// Formatear fecha
function formatearFecha(fecha) {
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

// Formatear hora
function formatearHora(fecha) {
  const opciones = { hour: '2-digit', minute: '2-digit' };
  return new Date(fecha).toLocaleTimeString('es-ES', opciones);
}

// Obtener color según prioridad
function colorPrioridad(prioridad) {
  const colores = {
    'baja': '#4CAF50',
    'media': '#FF9800',
    'alta': '#F44336',
    'urgente': '#9C27B0'
  };
  return colores[prioridad] || '#999';
}

// Obtener color según estado
function colorEstado(estado) {
  const colores = {
    'pendiente': '#2196F3',
    'en_proceso': '#FF9800',
    'entregada': '#4CAF50',
    'no_entregada': '#F44336'
  };
  return colores[estado] || '#999';
}

// ============================================
// EXPORTAR FUNCIONES (si usas módulos)
// ============================================

// Si estás usando módulos ES6, puedes exportar así:
/*
export {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerUsuarioActual,
  verificarSesion,
  obtenerMiPerfil,
  actualizarMiPerfil,
  obtenerMisNotificaciones,
  obtenerNotificacionesPendientes,
  obtenerNotificacionesHoy,
  actualizarEstadoNotificacion,
  obtenerEstadisticas
};
*/
