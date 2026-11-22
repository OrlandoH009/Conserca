-- Oculta al cliente los movimientos anotados antes de las 6 etapas reales (nov. 2026).
-- No borra nada: el equipo los sigue viendo en Actividad. Se puede correr más de una vez.
-- Para revertir: UPDATE project_events SET visible_to_client = 1 WHERE type IN ('estado', 'etapa');

-- «Estado: …» es interno (hoy ya se anota oculto al cliente).
UPDATE project_events SET visible_to_client = 0 WHERE type = 'estado';

-- «Etapa: X · avance N %» con una X que ya no es de las 6 etapas (eran áreas de diseño: Cargas térmicas, Distribución de aire…).
UPDATE project_events SET visible_to_client = 0
WHERE type = 'etapa'
  AND SUBSTRING_INDEX(SUBSTRING(message, 8), ' · ', 1) NOT IN (
    'Oferta de servicios', 'Elaboración de documentación', 'Cobro de anticipo',
    'Cobro de estimaciones por avances', 'Revisión y documentación final', 'Facturación final'
  );
