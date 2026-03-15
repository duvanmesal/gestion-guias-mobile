# Dashboard Module (Mobile) - Technical Documentation

## 1. Objective

The **Dashboard module** introduces the first real post-authentication operational home for the mobile application.

Its purpose is to replace the temporary idea of using the profile as the first useful screen and instead provide a **role-aware landing page** that acts as the real entry point of the system once the authentication flow is fully completed.

This module is designed to:

- provide a meaningful first screen after login
- consume a single backend summary endpoint instead of multiple fragmented calls
- display different operational views depending on the authenticated user role
- surface contextual information immediately
- expose quick actions to core internal modules
- show current status, next task, next shift, or upcoming milestones
- prepare the navigation shell for future modules such as `turnos`, `atenciones`, and `recaladas`

In practical terms, this module transforms the app from "authentication-first" into "operation-first".

---

## 2. Functional scope implemented

The work completed in this iteration includes:

1. **Creation of a new dashboard feature module in mobile**
2. **Creation of typed contracts for backend dashboard response**
3. **Creation of API layer for `GET /dashboard/overview`**
4. **Creation of React Query hook for dashboard data**
5. **Creation of dashboard formatting helpers**
6. **Creation of a real `HomePage` as internal entry point**
7. **Creation of reusable placeholder pages for future internal modules**
8. **Update of access resolution logic so the app enters through `/home`**
9. **Update of route tree to include dashboard and seeded internal modules**
10. **Role-aware rendering for `GUIA`, `SUPERVISOR`, and `SUPER_ADMIN`**

---

## 3. Business intention behind the change

Before this implementation, once the user completed authentication, verification, and onboarding, the application redirected the user to `/profile`.

That worked as a temporary stable page, but from an operational perspective it was not the best "first useful screen".

After this change:

- authenticated and fully ready users enter through **`/home`**
- `/home` becomes the real internal dashboard
- the first thing the user sees is no longer static profile information
- the first thing the user sees is an operational summary related to their role

This improves:

- perceived usefulness
- task orientation
- product maturity
- navigation clarity
- readiness for future operational modules

---

## 4. Architecture overview

The module follows the existing project architecture already present in the mobile app:

- **types** for response contracts
- **data layer** for API communication
- **hooks** for query orchestration
- **utils** for formatting/presentation helpers
- **pages** for visual entry points
- **routes** for access control and navigation resolution

### New module structure

src/features/dashboard/
├─ data/
│  └─ dashboard.api.ts
├─ hooks/
│  └─ useDashboardOverview.ts
├─ pages/
│  ├─ HomePage.tsx
│  └─ ModulePlaceholderPage.tsx
├─ types/
│  └─ dashboard.types.ts
└─ utils/
   └─ dashboardFormatters.ts

---

## 5. Files created and modified

## 5.1 New files created

### `src/features/dashboard/types/dashboard.types.ts`

Defines the TypeScript contracts used by the mobile app to consume the backend dashboard overview.

Includes:

* widget types
* milestone types
* lite shapes for `Turno`
* lite shapes for available `Atencion`
* role-specific overview sections
* root `DashboardOverviewResponse`

This file ensures the mobile layer consumes the backend payload with strict typing and minimal ambiguity.

---

### `src/features/dashboard/data/dashboard.api.ts`

Provides the API function:

* `getDashboardOverview()`

Responsibilities:

* calls `GET /dashboard/overview`
* sends `X-Client-Platform: MOBILE`
* sends query params for:

  * `tzOffsetMinutes`
  * `upcomingLimit`
  * `availableAtencionesLimit`
* delegates authenticated request handling to `authRequest`

This file is the bridge between UI and backend dashboard overview.

---

### `src/features/dashboard/hooks/useDashboardOverview.ts`

Provides the React Query hook:

* `useDashboardOverview()`

Responsibilities:

* executes the dashboard API request
* handles loading/error/data states
* throws normalized user-readable error messages
* caches dashboard data using a query key based on timezone offset
* avoids noisy refetch on window focus
* defines a moderate `staleTime`

This hook gives the UI a clean and reactive way to consume dashboard information.

---

### `src/features/dashboard/utils/dashboardFormatters.ts`

Contains formatting helpers used by the dashboard UI.

Responsibilities:

* contextual greeting by current hour
* user display name normalization
* role label formatting
* short date formatting
* time formatting
* date-time formatting
* turno status labeling
* milestone kind labeling
* pluralization helpers

This file keeps the page component cleaner and centralizes UI language rules.

---

### `src/features/dashboard/pages/ModulePlaceholderPage.tsx`

Reusable placeholder page for internal routes that are not yet fully implemented.

Used for:

* `/turnos`
* `/atenciones`
* `/recaladas`

Responsibilities:

* avoid dead routes
* keep navigation coherent
* provide a stable visual shell
* allow dashboard quick actions to navigate somewhere meaningful

This is a temporary but intentional scaffold.

---

### `src/features/dashboard/pages/HomePage.tsx`

This is the core of the implementation.

Responsibilities:

* render the new internal dashboard
* consume dashboard overview from backend
* render different blocks depending on user role
* show contextual greeting
* show quick actions
* show summary cards
* show upcoming tasks or active shifts
* handle dashboard refresh
* allow logout
* route user into other internal areas

This page is the new operational home of the app.

---

## 5.2 Existing files modified

### `src/app/routes/access.ts`

Updated to change the resolved entry path for a fully ready user.

### Before

```ts
case "ready":
  return "/profile";
```

### After

```ts
case "ready":
  return "/home";
```

This is one of the most important routing changes in this iteration.

Additional updates were also applied so access redirects for verified/onboarded users now target `/home` instead of `/profile` where appropriate.

---

### `src/app/routes/index.tsx`

Updated to:

* register `/home`
* register seeded internal module routes
* protect them with `AppReadyGuard`
* keep login/verify/onboarding flow intact
* update root fallback redirect to the new resolved entry

New internal routes added:

* `/home`
* `/turnos`
* `/atenciones`
* `/recaladas`

Existing routes preserved:

* `/login`
* `/verify-email`
* `/onboarding`
* `/profile`
* `/profile/edit`

---

## 6. Integration with existing auth flow

The Dashboard module does not replace the authentication flow. It is mounted **after** the auth flow is already stable.

The current access pipeline remains:

1. app bootstrap via `AuthProvider`
2. refresh token recovery
3. access token refresh
4. `/me` retrieval
5. session hydration in Zustand
6. route resolution based on auth stage
7. once the user is fully ready, redirect to `/home`

### Current access stages

Defined in `src/app/routes/access.ts`:

* `loading`
* `guest`
* `unverified`
* `onboarding`
* `ready`

### Behavior after this implementation

| Auth stage | Destination     |
| ---------- | --------------- |
| loading    | `/`             |
| guest      | `/login`        |
| unverified | `/verify-email` |
| onboarding | `/onboarding`   |
| ready      | `/home`         |

This means the dashboard is only accessible after:

* the user is authenticated
* email is verified
* onboarding/profile completion is finished

That makes dashboard data safer and keeps the navigation story coherent.

---

## 7. Backend dependency

The mobile dashboard is powered by the backend endpoint:

* `GET /dashboard/overview`

Backend route already exists in the API:

* `src/routes/dashboard.routes.ts`

The route is authenticated via:

* `requireAuth`

And returns a **role-aware summary**.

This is critical because the mobile dashboard does **not** compute operational meaning on its own.
Instead, it consumes a pre-aggregated response tailored for the authenticated role.

That reduces:

* duplicated front-end logic
* dangerous cross-role requests
* unnecessary request fan-out
* UI complexity

---

## 8. Request contract used by mobile

The mobile implementation calls:

```http
GET /dashboard/overview?tzOffsetMinutes=...&upcomingLimit=...&availableAtencionesLimit=...
X-Client-Platform: MOBILE
Authorization: Bearer <accessToken>
```

### Query params sent

#### `tzOffsetMinutes`

Used to align dashboard day resolution with the device timezone.

Default used in mobile:

```ts
-new Date().getTimezoneOffset()
```

This allows the backend to resolve the correct operational day according to the user/device timezone, instead of blindly assuming server timezone.

---

#### `upcomingLimit`

Used to limit the number of upcoming milestones for supervisor view.

Default mobile value in current implementation:

* `6`

---

#### `availableAtencionesLimit`

Used to limit the number of available attentions for guide view.

Default mobile value in current implementation:

* `6`

---

## 9. Response contract consumed by mobile

The root response shape used by mobile is:

```ts
interface DashboardOverviewResponse {
  role: Role;
  date: string;
  tzOffsetMinutes: number;
  generatedAt: string;
  serverTime: string;
  dateContext: {
    date: string;
    timezoneHint: string;
  };
  widgets: DashboardWidget[];
  supervisor?: SupervisorOverview;
  guia?: GuiaOverview;
}
```

The mobile dashboard mainly consumes:

* `role`
* `dateContext`
* `supervisor`
* `guia`

The `widgets` property is also typed, leaving room for more server-driven UI in future iterations.

---

## 10. Role-aware rendering logic

The `HomePage` determines the effective role using:

* backend response role
* fallback to session user role if necessary

Then it branches the UI into two main experiences:

### Supervisor view

For:

* `SUPERVISOR`
* `SUPER_ADMIN`

### Guide view

For:

* `GUIA`

This split is intentional because both roles have different operational priorities.

---

## 11. Dashboard behavior for Supervisor / Super Admin

When the authenticated user is `SUPERVISOR` or `SUPER_ADMIN`, the dashboard emphasizes operational oversight.

### Sections rendered

#### 11.1 Header

Shows:

* contextual greeting
* user name
* role label
* date metadata
* timezone hint
* sync state

#### 11.2 Quick actions

Current quick actions include:

* Turnero
* Recaladas
* Mi cuenta
* Editar perfil
* Actualizar
* Salir

#### 11.3 Resumen de estado

Renders KPIs such as:

* recaladas
* atenciones
* turnos
* turnos en curso

These values come from:

```ts
overview?.counts
```

#### 11.4 Alertas operativas

Displays fast operational signals based on counts such as:

* unassigned shifts
* canceled shifts

This section gives a light operational warning layer without requiring the user to navigate deeper immediately.

#### 11.5 Guías hoy

Displays small metrics for:

* activos
* asignados
* libres

This helps supervisor-level users understand human availability for the day.

#### 11.6 Próximas tareas

Displays ordered upcoming milestones from the backend, such as:

* arrival of a cruise/ship
* departure
* start of an attention window
* end of an attention window

These are rendered from the `upcoming` array.

---

## 12. Dashboard behavior for Guide

When the authenticated user is `GUIA`, the dashboard emphasizes personal operational execution.

### Sections rendered

#### 12.1 Header

Shows:

* contextual greeting
* user name
* role label
* date metadata
* timezone hint
* sync state

#### 12.2 Quick actions

Current quick actions include:

* Mis turnos
* Atenciones
* Mi cuenta
* Editar perfil
* Actualizar
* Salir

#### 12.3 Turno en curso

If the backend returns an `activeTurno`, the dashboard shows:

* turno number
* ship name
* recalada code
* time window
* turno state badge

If there is no active turno, the UI shows an empty-state card instead of breaking.

#### 12.4 Próximo turno

If the backend returns `nextTurno`, the dashboard shows:

* next assignment
* related recalada
* start and end times
* status badge

If there is no next turno, the UI shows a fallback explanatory block.

#### 12.5 Atenciones disponibles

Displays current open opportunities with actual available spots.

Each row shows:

* ship name
* recalada code
* start/end time
* available spots badge
* button to open `/atenciones`

If there are no available attentions, an empty-state card is rendered.

---

## 13. Quick actions design and purpose

Quick actions are intentionally small, high-value entry points.

The implementation uses a `QuickAction[]` array built with `useMemo`.

This makes the list role-aware while avoiding unnecessary re-creation on every render.

### Common actions

* Mi cuenta
* Editar perfil
* Actualizar
* Salir

### Supervisor-specific actions

* Turnero
* Recaladas

### Guide-specific actions

* Mis turnos
* Atenciones

### Intent

These actions are not decorative shortcuts. They are the dashboard's operational launchpad.

---

## 14. Loading and error handling

The dashboard includes explicit handling for the three main data states.

### 14.1 Initial loading

If the page is loading and there is no data yet:

```tsx
return <LoadingScreen message="Cargando tu centro de operaciones..." />;
```

This ensures the page does not flash incomplete cards.

---

### 14.2 Background refetch

If the dashboard is already rendered and a refetch occurs, the UI remains visible while showing status metadata like:

* `Actualizando`
* `Sincronizado`

This improves UX by avoiding unnecessary full-screen blocking.

---

### 14.3 Error state

If the dashboard request fails:

* an error card is shown
* a readable message is displayed
* a retry button is provided

This makes the page resilient instead of silent-failing.

---

## 15. Logout behavior from dashboard

The dashboard includes direct logout action.

It uses:

```ts
logoutCurrentSession()
```

from:

* `src/core/auth/sessionLifecycle.ts`

This preserves the already established session shutdown pipeline:

* backend logout request attempt
* local token cleanup
* query cache cleanup
* Zustand auth reset
* auth notice setting

This means the dashboard does not invent a new logout flow.
It plugs into the existing one cleanly.

---

## 16. UI structure and visual language

The dashboard intentionally follows the visual language already explored in the app:

* dark base background
* floating blurred orbs
* glass-like surfaces
* rounded cards
* subtle gradients
* compact operational blocks
* premium but not overloaded visual hierarchy

### Core visual goals

* feel like a real product, not a raw admin panel
* preserve readability
* make primary actions obvious
* support quick scanning
* keep room for future module expansion

The design tries to balance "magical" and "operational" without becoming noisy.

---

## 17. Reusable view primitives inside `HomePage`

To keep the page organized, the implementation uses internal UI helpers/components such as:

* `SectionTitle`
* `CardBox`
* `EmptyCard`
* `StatCard`
* `MiniMetric`
* `MiniInfo`
* `AlertRow`
* `MetaPill`
* `StatusBadge`
* `StatusDot`
* `BackgroundOrbs`
* `ActionIcon`

These are currently local to `HomePage.tsx`.

### Reason for keeping them local

At this stage they are tightly coupled to dashboard rendering only.

If the dashboard grows more in future iterations, these can later be extracted into:

* `components/`
* or shared dashboard UI primitives

---

## 18. Placeholder routes and why they matter

The implementation introduces seeded placeholder pages for:

* `/turnos`
* `/atenciones`
* `/recaladas`

These are intentionally not full modules yet.

### Why this matters

Without them:

* quick actions would point nowhere
* the dashboard would feel fake
* internal navigation would be incomplete
* future modules would require route rewiring later

With placeholders in place:

* navigation is already coherent
* internal shell is future-ready
* user flow feels continuous
* future replacement becomes easier

This is a scaffolding move, not wasted work.

---

## 19. Access control implications

This dashboard is guarded by:

* `AppReadyGuard`

That means any user trying to access `/home` or the seeded internal routes must already be:

* authenticated
* verified
* profile-complete

If not, the access layer redirects them appropriately.

### Security / flow benefit

This keeps the dashboard out of partial-auth states such as:

* logged in but not verified
* verified but not onboarded
* session still bootstrapping
* guest state

So `/home` is not just another route.
It is the first **trusted internal route**.

---

## 20. Current navigation map after the change

### Public or pre-internal routes

* `/login`
* `/verify-email`
* `/onboarding`

### Internal ready-only routes

* `/home`
* `/profile`
* `/profile/edit`
* `/turnos`
* `/atenciones`
* `/recaladas`

### Root behavior

`/` now redirects according to auth stage.

For ready users, `/` resolves to:

* `/home`

---

## 21. Why this implementation is technically important

This dashboard iteration is important because it changes the app from a collection of auth screens plus profile to a product with an actual operational entrance.

### Technical value delivered

* central internal entry point
* typed backend-driven summary
* role-aware rendering
* preserved existing auth architecture
* modular feature structure
* future navigation shell prepared
* reduced need for multi-endpoint dashboard assembly in mobile
* stable place to connect future modules

This is the kind of change that turns the app from "it works" into "it starts to feel like a system".

---

## 22. Known limitations of the current iteration

Although the dashboard is real and useful, this iteration still has intentional limitations:

1. `turnos`, `atenciones`, and `recaladas` are placeholder pages only
2. dashboard cards are implemented inline in `HomePage.tsx`
3. no pull-to-refresh has been added yet
4. no pagination or drill-down has been added to upcoming milestones
5. no optimistic interactions exist yet
6. no widgets from backend are rendered dynamically yet
7. no dedicated dashboard test suite has been added yet

These are normal boundaries for a first real dashboard shell.

---
