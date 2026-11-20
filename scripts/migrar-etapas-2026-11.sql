-- Migración a las 6 etapas reales (nov. 2026). Correr UNA vez en cada base (local y servidor), después de desplegar.
-- Solo quedan 2 estados guardados: en_proceso y entregado («atrasado» se calcula por la fecha).
UPDATE projects SET status = 'en_proceso' WHERE status IN ('en_revision', 'atrasado');

-- Entregados: última etapa y 100 %.
UPDATE projects SET stage = 'Facturación final', progress = 100 WHERE status = 'entregado';

-- En proceso con una etapa vieja: se ubica en la etapa nueva más cercana a su avance actual.
UPDATE projects SET stage = CASE
    WHEN progress < 20 THEN 'Oferta de servicios'
    WHEN progress < 40 THEN 'Elaboración de documentación'
    WHEN progress < 60 THEN 'Cobro de anticipo'
    WHEN progress < 80 THEN 'Cobro de estimaciones por avances'
    ELSE 'Revisión y documentación final'
  END
WHERE status = 'en_proceso'
  AND stage NOT IN ('Oferta de servicios', 'Elaboración de documentación', 'Cobro de anticipo', 'Cobro de estimaciones por avances', 'Revisión y documentación final');
