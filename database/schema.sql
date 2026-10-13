-- =====================================================================
-- BUFETE JURÍDICO MARTÍNEZ MUÑOZ
-- Esquema de Base de Datos para Gestión de Consultas y Expedientes Iniciales
-- Diseñado para PostgreSQL / Supabase (compatible con MySQL 8+ con adaptaciones mínimas)
-- =====================================================================

-- Extensión para generación de identificadores únicos UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: Catálogo de Áreas de Práctica Jurídica
CREATE TABLE IF NOT EXISTS areas_practica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserción de las 10 disciplinas jurídicas del despacho
INSERT INTO areas_practica (slug, nombre, descripcion) VALUES
('civil', 'Derecho Civil', 'Contratos, obligaciones, propiedades, arrendamientos y derechos patrimoniales.'),
('familia', 'Derecho de Familia', 'Pensiones de alimentos, acuerdos mutuos, filiación y procesos familiares.'),
('laboral', 'Derecho Laboral', 'Relaciones de trabajo, cálculo de prestaciones, conciliación y despidos.'),
('penal', 'Derecho Penal', 'Orientación y defensa técnica en procedimientos y garantías penales.'),
('mercantil', 'Derecho Mercantil', 'Constitución de sociedades, títulos valores y contratos comerciales.'),
('administrativo', 'Derecho Administrativo', 'Peticiones, recursos y trámites ante instituciones estatales.'),
('notarial', 'Asuntos Notariales', 'Escrituras públicas, actas notariales, protocolizaciones y autenticaciones.'),
('tramites', 'Trámites Jurídicos', 'Gestiones registrales, catastrales y permisos legales.'),
('litigios', 'Litigios y Representación', 'Representación letrada ante juzgados y tribunales de la República.'),
('empresarial', 'Asesoría Empresarial', 'Cumplimiento legal corporativo, prevención de riesgos y contratos de negocios.')
ON CONFLICT (slug) DO NOTHING;

-- 2. TABLA: Consultas de Contacto y Solicitudes de Asesoría Legal
CREATE TABLE IF NOT EXISTS consultas_contacto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(120) NOT NULL,
    area_slug VARCHAR(50) REFERENCES areas_practica(slug) ON UPDATE CASCADE ON DELETE SET NULL,
    mensaje TEXT NOT NULL,
    
    -- Cumplimiento de privacidad y términos
    aviso_privacidad_aceptado BOOLEAN NOT NULL DEFAULT FALSE,
    ip_registro VARCHAR(45),
    user_agent TEXT,
    
    -- Estado interno de seguimiento por el equipo legal
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'en_revision', 'contactado', 'cita_agendada', 'archivado')),
    notas_internas TEXT,
    atendido_por VARCHAR(100),
    
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices estratégicos para búsquedas y filtros rápidos
CREATE INDEX IF NOT EXISTS idx_consultas_estado ON consultas_contacto(estado);
CREATE INDEX IF NOT EXISTS idx_consultas_creado_en ON consultas_contacto(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_consultas_email ON consultas_contacto(email);
CREATE INDEX IF NOT EXISTS idx_consultas_area ON consultas_contacto(area_slug);

-- 3. POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS) - Supabase / PostgreSQL
ALTER TABLE consultas_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas_practica ENABLE ROW LEVEL SECURITY;

-- Los visitantes públicos solo pueden leer el catálogo de áreas
CREATE POLICY "Permitir lectura publica de areas" 
    ON areas_practica FOR SELECT 
    USING (activo = true);

-- Los visitantes públicos solo pueden insertar su consulta (sin leer las de terceros)
CREATE POLICY "Permitir envio publico de consultas" 
    ON consultas_contacto FOR INSERT 
    WITH CHECK (aviso_privacidad_aceptado = true);

-- Solo personal autenticado del bufete puede consultar y actualizar las solicitudes recibidas
CREATE POLICY "Solo personal autenticado lee consultas" 
    ON consultas_contacto FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Solo personal autenticado actualiza estado" 
    ON consultas_contacto FOR UPDATE 
    TO authenticated 
    USING (true);

-- 4. FUNCIÓN Y TRIGGER: Actualización automática de timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp_consulta()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_timestamp ON consultas_contacto;
CREATE TRIGGER trigger_actualizar_timestamp
    BEFORE UPDATE ON consultas_contacto
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_consulta();

-- Comentarios de documentación técnica
COMMENT ON TABLE consultas_contacto IS 'Almacena solicitudes iniciales de consulta legal remitidas a través de la web del Bufete Martínez Muñoz.';
COMMENT ON COLUMN consultas_contacto.aviso_privacidad_aceptado IS 'Registro fehaciente de consentimiento del usuario con las políticas de tratamiento de datos.';
COMMENT ON COLUMN consultas_contacto.estado IS 'Ciclo de vida de la solicitud: pendiente -> en_revision -> contactado -> cita_agendada -> archivado.';
