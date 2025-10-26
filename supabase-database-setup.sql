-- ============================================
-- CONFIGURACIÓN DE BASE DE DATOS SUPABASE
-- Sistema de Notificaciones Judiciales (SAGJ)
-- ============================================

-- Nota: Ejecuta estos comandos en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query

-- ============================================
-- 1. TABLA DE PERFILES DE USUARIO
-- ============================================
-- Esta tabla almacena información adicional de los usuarios
-- Se relaciona con auth.users mediante el UUID

CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT,
  apellido TEXT,
  telefono TEXT,
  rol TEXT DEFAULT 'notificador' CHECK (rol IN ('notificador', 'admin', 'supervisor')),
  avatar_url TEXT,
  direccion TEXT,
  ciudad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Comentarios para documentación
COMMENT ON TABLE public.perfiles IS 'Perfiles de usuarios del sistema de notificaciones';
COMMENT ON COLUMN public.perfiles.id IS 'UUID del usuario (referencia a auth.users)';
COMMENT ON COLUMN public.perfiles.rol IS 'Rol del usuario: notificador, admin o supervisor';

-- ============================================
-- 2. TABLA DE NOTIFICACIONES
-- ============================================
-- Almacena las notificaciones que deben entregar los notificadores

CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notificador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  numero_caso TEXT NOT NULL,
  destinatario_nombre TEXT NOT NULL,
  destinatario_direccion TEXT NOT NULL,
  destinatario_telefono TEXT,
  tipo_notificacion TEXT NOT NULL,
  prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'entregada', 'no_entregada')),
  fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  fecha_programada DATE,
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  observaciones TEXT,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  foto_evidencia_url TEXT,
  firma_digital_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS notificaciones_notificador_id_idx ON public.notificaciones(notificador_id);
CREATE INDEX IF NOT EXISTS notificaciones_estado_idx ON public.notificaciones(estado);
CREATE INDEX IF NOT EXISTS notificaciones_fecha_programada_idx ON public.notificaciones(fecha_programada);

-- Comentarios
COMMENT ON TABLE public.notificaciones IS 'Notificaciones judiciales asignadas a notificadores';
COMMENT ON COLUMN public.notificaciones.estado IS 'Estado: pendiente, en_proceso, entregada, no_entregada';
COMMENT ON COLUMN public.notificaciones.prioridad IS 'Prioridad: baja, media, alta, urgente';

-- ============================================
-- 3. TABLA DE HISTORIAL DE CAMBIOS
-- ============================================
-- Registra cambios de estado en las notificaciones

CREATE TABLE IF NOT EXISTS public.historial_notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notificacion_id UUID REFERENCES public.notificaciones(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  estado_anterior TEXT,
  estado_nuevo TEXT NOT NULL,
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice
CREATE INDEX IF NOT EXISTS historial_notificacion_id_idx ON public.historial_notificaciones(notificacion_id);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS en todas las tablas

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_notificaciones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLÍTICAS DE SEGURIDAD - PERFILES
-- ============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.perfiles
  FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.perfiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Los administradores pueden ver todos los perfiles
CREATE POLICY "Los admins pueden ver todos los perfiles"
  ON public.perfiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ============================================
-- 6. POLÍTICAS DE SEGURIDAD - NOTIFICACIONES
-- ============================================

-- Los notificadores pueden ver sus propias notificaciones
CREATE POLICY "Los notificadores pueden ver sus notificaciones"
  ON public.notificaciones
  FOR SELECT
  USING (notificador_id = auth.uid());

-- Los notificadores pueden actualizar sus propias notificaciones
CREATE POLICY "Los notificadores pueden actualizar sus notificaciones"
  ON public.notificaciones
  FOR UPDATE
  USING (notificador_id = auth.uid());

-- Los administradores pueden ver todas las notificaciones
CREATE POLICY "Los admins pueden ver todas las notificaciones"
  ON public.notificaciones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Los administradores pueden insertar notificaciones
CREATE POLICY "Los admins pueden crear notificaciones"
  ON public.notificaciones
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ============================================
-- 7. POLÍTICAS DE SEGURIDAD - HISTORIAL
-- ============================================

-- Los usuarios pueden ver el historial de sus notificaciones
CREATE POLICY "Ver historial de mis notificaciones"
  ON public.historial_notificaciones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notificaciones
      WHERE id = notificacion_id AND notificador_id = auth.uid()
    )
  );

-- Cualquier usuario autenticado puede insertar en el historial
CREATE POLICY "Insertar en historial"
  ON public.historial_notificaciones
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 8. FUNCIONES Y TRIGGERS
-- ============================================

-- Función para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, apellido, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'notificador')
  );
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS on_perfiles_updated ON public.perfiles;
CREATE TRIGGER on_perfiles_updated
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_notificaciones_updated ON public.notificaciones;
CREATE TRIGGER on_notificaciones_updated
  BEFORE UPDATE ON public.notificaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Función para registrar cambios de estado en el historial
CREATE OR REPLACE FUNCTION public.log_notificacion_estado_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO public.historial_notificaciones (
      notificacion_id,
      usuario_id,
      estado_anterior,
      estado_nuevo,
      comentario
    ) VALUES (
      NEW.id,
      auth.uid(),
      OLD.estado,
      NEW.estado,
      'Cambio automático de estado'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para registrar cambios de estado
DROP TRIGGER IF EXISTS on_notificacion_estado_changed ON public.notificaciones;
CREATE TRIGGER on_notificacion_estado_changed
  AFTER UPDATE ON public.notificaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.log_notificacion_estado_change();

-- ============================================
-- 9. DATOS DE EJEMPLO (OPCIONAL)
-- ============================================
-- Descomenta y modifica según necesites

/*
-- Insertar notificaciones de ejemplo
-- Nota: Reemplaza 'TU-UUID-DE-USUARIO' con un UUID real de auth.users

INSERT INTO public.notificaciones (
  notificador_id,
  numero_caso,
  destinatario_nombre,
  destinatario_direccion,
  tipo_notificacion,
  prioridad,
  estado,
  fecha_programada
) VALUES
  (
    'TU-UUID-DE-USUARIO',
    'CASO-2025-001',
    'Juan Pérez García',
    'Av. Principal 123, Col. Centro',
    'Citatorio',
    'alta',
    'pendiente',
    CURRENT_DATE
  ),
  (
    'TU-UUID-DE-USUARIO',
    'CASO-2025-002',
    'María López Hernández',
    'Calle Secundaria 456, Col. Norte',
    'Emplazamiento',
    'urgente',
    'pendiente',
    CURRENT_DATE
  ),
  (
    'TU-UUID-DE-USUARIO',
    'CASO-2025-003',
    'Carlos Ramírez Soto',
    'Boulevard Central 789, Col. Sur',
    'Notificación de sentencia',
    'media',
    'pendiente',
    CURRENT_DATE + 1
  );
*/

-- ============================================
-- 10. VISTAS ÚTILES (OPCIONAL)
-- ============================================

-- Vista de notificaciones con información del notificador
CREATE OR REPLACE VIEW public.notificaciones_detalle AS
SELECT 
  n.*,
  p.nombre || ' ' || p.apellido AS notificador_nombre,
  p.telefono AS notificador_telefono
FROM public.notificaciones n
LEFT JOIN public.perfiles p ON n.notificador_id = p.id;

-- Estadísticas por notificador
CREATE OR REPLACE VIEW public.estadisticas_notificador AS
SELECT 
  notificador_id,
  COUNT(*) AS total_notificaciones,
  COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
  COUNT(*) FILTER (WHERE estado = 'entregada') AS entregadas,
  COUNT(*) FILTER (WHERE estado = 'no_entregada') AS no_entregadas,
  COUNT(*) FILTER (WHERE fecha_programada = CURRENT_DATE) AS hoy
FROM public.notificaciones
GROUP BY notificador_id;

-- ============================================
-- 11. VERIFICACIÓN
-- ============================================
-- Verifica que todo se haya creado correctamente

SELECT 
  'Tablas creadas' AS paso,
  COUNT(*) AS cantidad
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('perfiles', 'notificaciones', 'historial_notificaciones');

-- ============================================
-- FIN DE LA CONFIGURACIÓN
-- ============================================
-- ¡Tu base de datos está lista para usar!
