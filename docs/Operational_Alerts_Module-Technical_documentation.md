# Operational Alerts Module (Mobile) - Technical Documentation

Última revisión contra código: 2026-06-08.

Espejo mobile de las alertas operativas accionables implementadas en web
(`gestion-guias-front/docs/operatividad-web.md`). Comparte el contrato realtime
y los cambios de API (ver `gestionguias-api/docs/realtime.md` y
`gestionguias-api/docs/atenciones.md`).

## 1. Objetivo

Convertir cada evento realtime `notif:*` en una **alerta accionable** dentro de
la app: un toast con botón **Ver** que navega al contexto y una **bandeja**
(campana global) que conserva las alertas de la sesión aunque el toast ya se
haya cerrado o silenciado por cooldown.

## 2. Piezas

| Pieza | Archivo |
| --- | --- |
| Store de bandeja (Zustand, sesión) | `src/app/stores/alertStore.ts` |
| Wiring realtime + toasts accionables | `src/core/socket/useGlobalRealtime.ts` |
| Campana global + hoja de alertas | `src/app/navigation/AlertCenter.tsx` (montada en `AppTabsShell`) |
| Menos ruido | `src/features/turnos/hooks/useTurnoSocket.ts` (`notify`) |
| Deep-link de filtros | `src/features/atenciones/pages/AtencionesListPage.tsx`, `src/features/turnos/pages/TurnosListPage.tsx` |

## 3. Comportamiento

### Toast accionable

`useGlobalRealtime` presenta un `toastController` con `header` (título), `message`
(cuerpo) y botones `Ver` (navega con `useHistory().push(route)`) + `Cerrar`.
El toast se silencia por `notificationId` dentro de una ventana de cooldown
(job-driven: 5 min; dirigidas al usuario: 15 s). La bandeja sí registra cada
recepción.

### Bandeja (campana)

`AlertCenter` es un botón flotante (esquina superior derecha, respeta
`safe-area-inset-top`) con contador de no leídas que abre un `IonModal` tipo hoja
con las últimas 50 alertas de la **sesión** (en memoria, no persiste entre
recargas). Acciones: **Ver**, marcar leída, marcar todas, eliminar, limpiar.
Si el mismo `notificationId` vuelve a llegar, sube al tope con contador `×N`.

### Normalización de rutas (evita rutas inexistentes)

Rutas de detalle válidas (`/recaladas/:id`, `/atenciones/:id`, `/turnos/:id`)
pasan tal cual. `GUIDE_PENALIZED` (y cualquier `route` `/perfil*`) se normaliza a
`/profile`. Como respaldo se reconstruye desde los ids del payload. Esto reutiliza
la misma intención que `PushNotificationsProvider.routeFromData` para taps de push.

### Deep-link de filtros desde alertas

- **Atenciones** (`/atenciones`): lee `operationalStatus`, `recaladaId`,
  `pendingEval=1` desde el query string. Con `pendingEval`/`recaladaId` activos se
  muestra un banner con opción "Quitar". `pendingEval=true` → atenciones cerradas
  sin evaluación (filtro server-side, ver API).
- **Turnos** (`/turnos`): `status` inicializa el filtro; `checkInPending=1` hace
  scroll y resalta la sección de check-ins pendientes (supervisor).

### Menos ruido

- `useTurnoSocket(atencionId?, { notify: false })` mantiene la invalidación de
  cache pero no dispara toasts, para evitar duplicados cuando los `notif:*` ya
  cubren el aviso accionable.
- Las alertas automáticas de job (recalada vencida, atención próxima con turnos
  libres) llegan por socket como máximo cada 30 min por `notificationId`
  (cooldown server-side compartido con web).

## 4. QA manual

| Escenario | Resultado esperado |
| --- | --- |
| Llega `notif:recalada:overdue` | Toast con botón **Ver**; navega a `/recaladas/{id}`. |
| Misma alerta dentro del cooldown | No se repite el toast; la campana sube la entrada con `×N`. |
| Tocar la campana | Hoja con alertas de la sesión; marcar leída/eliminar/limpiar funciona. |
| Abrir `/turnos?checkInPending=1` | Scroll y resalta la sección de check-ins pendientes. |
| Abrir `/atenciones?pendingEval=1` | Atenciones cerradas sin evaluación + banner para quitar el filtro. |
| Alerta `GUIDE_PENALIZED` | El botón **Ver** navega a `/profile`. |
