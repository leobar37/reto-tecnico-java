-- Default data for the claims management system
-- This file will be executed automatically by Spring Boot on startup

-- Insert sample claims
INSERT INTO reclamos (codigo, titulo, descripcion, cliente_id, fecha_creacion, fecha_actualizacion) VALUES
('CLM-00000001', 'Problema con el servicio de internet', 'Mi conexión a internet se corta constantemente desde hace una semana. He reiniciado el módem múltiples veces pero el problema persiste.', 12345, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CLM-00000002', 'Facturación incorrecta', 'Me han cobrado servicios que no contraté. Solicito revisión de mi factura del mes pasado.', 12346, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CLM-00000003', 'Demora en instalación', 'Han pasado dos semanas desde que contraté el servicio y aún no han venido a hacer la instalación.', 12347, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CLM-00000004', 'Calidad de señal TV', 'Los canales de televisión se ven con interferencias y algunos no cargan correctamente.', 12348, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CLM-00000005', 'Atención al cliente deficiente', 'He llamado múltiples veces al servicio de atención al cliente y no me han resuelto mi consulta.', 12349, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert status history for each claim
-- Claim 1: INGRESADO -> EN_PROCESO -> RESUELTO
INSERT INTO estado_reclamos (reclamo_id, estado, notas, asesor_email, fecha_creacion) VALUES
(1, 'INGRESADO', 'Reclamo recibido y registrado en el sistema', 'recepcion@empresa.com', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(1, 'EN_PROCESO', 'Técnico asignado. Se programó visita para el día de mañana', 'tecnico1@empresa.com', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 'RESUELTO', 'Problema resuelto. Se reemplazó el módem defectuoso', 'tecnico1@empresa.com', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Claim 2: INGRESADO -> EN_PROCESO
INSERT INTO estado_reclamos (reclamo_id, estado, notas, asesor_email, fecha_creacion) VALUES
(2, 'INGRESADO', 'Reclamo de facturación recibido', 'facturacion@empresa.com', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 'EN_PROCESO', 'Revisando historial de facturación del cliente', 'analista.facturacion@empresa.com', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Claim 3: INGRESADO -> ESCALADO
INSERT INTO estado_reclamos (reclamo_id, estado, notas, asesor_email, fecha_creacion) VALUES
(3, 'INGRESADO', 'Reclamo por demora en instalación', 'instalaciones@empresa.com', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(3, 'ESCALADO', 'Escalado a supervisión por demora excesiva', 'supervisor.instalaciones@empresa.com', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Claim 4: INGRESADO -> EN_PROCESO
INSERT INTO estado_reclamos (reclamo_id, estado, notas, asesor_email, fecha_creacion) VALUES
(4, 'INGRESADO', 'Reclamo por calidad de señal TV registrado', 'soporte.tv@empresa.com', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(4, 'EN_PROCESO', 'Verificando nivel de señal desde central', 'tecnico.tv@empresa.com', CURRENT_TIMESTAMP - INTERVAL '12 hours');

-- Claim 5: INGRESADO -> PENDIENTE_INFORMACION
INSERT INTO estado_reclamos (reclamo_id, estado, notas, asesor_email, fecha_creacion) VALUES
(5, 'INGRESADO', 'Reclamo por atención al cliente', 'calidad@empresa.com', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(5, 'PENDIENTE_INFORMACION', 'Se requiere más información específica sobre las llamadas realizadas', 'analista.calidad@empresa.com', CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- Insert attachments using the sample PDF file
INSERT INTO adjunto_reclamos (reclamo_id, nombre_archivo, tipo_contenido, tamano_bytes, url_archivo, fecha_subida) VALUES
(1, 'evidencia_problema_internet.pdf', 'application/pdf', 245760, 'uploads/sample-local-pdf.pdf', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(1, 'captura_velocidad.pdf', 'application/pdf', 245760, 'uploads/sample-local-pdf.pdf', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 'factura_cuestionada.pdf', 'application/pdf', 245760, 'uploads/sample-local-pdf.pdf', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(3, 'contrato_instalacion.pdf', 'application/pdf', 245760, 'uploads/sample-local-pdf.pdf', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 'fotos_problema_tv.pdf', 'application/pdf', 245760, 'uploads/sample-local-pdf.pdf', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(5, 'registro_llamadas.pdf', 'application/pdf', 245760, 'uploads/sample-local-pdf.pdf', CURRENT_TIMESTAMP - INTERVAL '6 hours');