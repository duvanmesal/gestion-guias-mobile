# Auth Module (Mobile) – Documentación técnica

## 1. Objetivo

El módulo **Auth** en la app móvil es responsable de controlar el **ciclo de autenticación y sesión** del usuario de extremo a extremo.

Su función no se limita al login. Auth también gobierna:

* el arranque de sesión al abrir la app
* la recuperación de sesión usando refresh token
* la renovación automática del access token
* la verificación de email dentro del flujo mobile
* la resolución del estado funcional del usuario para navegación
* la protección de rutas según la etapa real de acceso
* el cierre de sesión local y global
* la expiración controlada de sesión
* la limpieza coherente del estado autenticado, storage y cache

En términos de negocio, Auth garantiza que el usuario:

* entre solo cuando realmente corresponde
* pase por verificación antes de acceder a módulos internos
* no quede “medio autenticado” con estado inconsistente
* no navegue manualmente a rutas que no le corresponden
* salga de forma limpia y controlada cuando la sesión termina o expira

---

## 2. Alcance del módulo

## 2.1 Qué sí pertenece a Auth

El módulo Auth Mobile cubre estas responsabilidades:

### Entrada a sesión

* login con email + contraseña
* identificación del cliente por `deviceId`
* envío de `X-Client-Platform: MOBILE`
* lectura y persistencia del refresh token
* guardado del access token solo en memoria
* carga del usuario autenticado para poblar el store global

### Continuidad de sesión

* bootstrap al abrir la app
* refresh automático del access token
* reintento de requests protegidas cuando ocurre `401`
* invalidación de sesión no recuperable

### Estado funcional del acceso

* usuario guest
* usuario autenticado pero no verificado
* usuario verificado con perfil aún incompleto
* usuario listo para módulos internos

### Control de acceso y navegación

* resolución de etapa de autenticación
* redirección al entry correcto
* guards por etapa
* restricción por rol una vez el usuario está “ready”

### Salida de sesión

* logout de la sesión actual
* logout de todas las sesiones
* expiración forzada de sesión
* limpieza de store, refresh token y React Query cache
* mensajes visibles para UX mediante `authNotice`

---

## 2.2 Qué no pertenece a Auth

Estos elementos **no forman parte del módulo Auth**, aunque se integren con él:

* edición del perfil del usuario
* onboarding de datos personales
* pantalla de cuenta / perfil
* catálogo de guías
* actualización de `documentType`, `documentNumber`, teléfono, etc.

Esos comportamientos pertenecen al **módulo Users**.

Auth solo consume el resultado de esos procesos para decidir si el usuario puede o no avanzar.

---

## 3. Límite funcional entre Auth y Users

La separación correcta queda así:

### Auth es dueño de:

* identidad
* sesión
* tokens
* refresh
* verify email
* guards
* routing por etapa
* logout / logout-all / session-expired

### Users es dueño de:

* `GET /users/me` como fuente de verdad del usuario operativo
* `PATCH /users/me/profile`
* onboarding
* cuenta / perfil
* datos personales y completitud de perfil

### Punto de integración clave

Auth depende de `GET /users/me` para:

* hidratar la sesión después del login
* restaurar la sesión después del bootstrap
* refrescar el usuario después de verificar email
* decidir si el usuario está en etapa `unverified`, `onboarding` o `ready`

---

## 4. Estructura de archivos del módulo Auth

## 4.1 Providers usados por Auth

* `src/app/providers/AppProviders.tsx`
* `src/app/providers/AuthProvider.tsx`
* `src/app/providers/QueryProvider.tsx`

---

## 4.2 Núcleo de sesión

* `src/core/auth/types.ts`
* `src/core/auth/sessionStore.ts`
* `src/core/auth/tokenService.ts`
* `src/core/auth/sessionLifecycle.ts`

---

## 4.3 Persistencia segura

* `src/core/storage/secureVault.ts`
* `src/core/storage/keys.ts`

---

## 4.4 HTTP core usado por Auth

* `src/core/http/apiClient.ts`
* `src/core/http/types.ts`
* `src/core/http/apiEnvelope.ts`
* `src/core/http/authInterceptor.ts`
* `src/core/http/refresh.ts`
* `src/core/http/errorNormalizer.ts`
* `src/core/http/getErrorMessage.ts`

---

## 4.5 Routing y control de acceso

* `src/app/routes/index.tsx`
* `src/app/routes/access.ts`
* `src/app/routes/guards/AppReadyGuard.tsx`
* `src/app/routes/guards/AuthGuard.tsx`
* `src/app/routes/guards/GuestOnlyGuard.tsx`
* `src/app/routes/guards/OnboardingGuard.tsx`
* `src/app/routes/guards/VerifyEmailGuard.tsx`
* `src/app/routes/guards/RoleGuard.tsx`

---

## 4.6 Feature Auth

* `src/features/auth/data/auth.api.ts`
* `src/features/auth/data/auth.keys.ts`
* `src/features/auth/data/auth.mappers.ts`
* `src/features/auth/hooks/useLogin.ts`
* `src/features/auth/hooks/useChangePassword.ts`
* `src/features/auth/pages/LoginPage.tsx`
* `src/features/auth/pages/VerifyEmailPage.tsx`
* `src/features/auth/components/LoginForm.tsx`
* `src/features/auth/types/auth.types.ts`

---

## 4.7 Integraciones externas consumidas por Auth

Aunque pertenecen a Users, Auth se integra con:

* `src/features/users/data/users.api.ts`
* `src/features/users/data/users.mappers.ts`

Concretamente para:

* `getMe()`
* `mapUserMeToSessionUser()`

---

## 4.8 UI base usada por Auth

* `src/ui/components/LoadingScreen.tsx`
* `src/ui/components/ErrorState.tsx`

---

## 5. Arquitectura general del módulo

La arquitectura sigue una separación clara por responsabilidad.

## 5.1 `pages`

Representan pantallas completas del flujo de acceso.

Ejemplos:

* `LoginPage.tsx`
* `VerifyEmailPage.tsx`

---

## 5.2 `components`

Encapsulan UI reutilizable y lógica visual local.

Ejemplo:

* `LoginForm.tsx`

---

## 5.3 `hooks`

Orquestan casos de uso del front.

Ejemplos:

* `useLogin()`
* `useChangePassword()`

---

## 5.4 `data/*.api.ts`

Define funciones HTTP del módulo Auth.

Ejemplos:

* `login()`
* `refresh()`
* `logout()`
* `logoutAll()`
* `requestEmailVerification()`
* `confirmEmailVerification()`
* `changePassword()`

---

## 5.5 `mappers`

Transforman DTOs del backend a estructuras internas del store.

Ejemplo:

* `mapMeToSessionUser()`

---

## 5.6 `core/auth`

Concentra:

* tipos de sesión
* store global
* token service
* lifecycle de sesión
* expiración controlada

---

## 5.7 `core/http`

Resuelve:

* request base
* envelope unwrap
* normalización de errores
* refresh
* retry protegido
* forced logout si la sesión ya no es recuperable

---

## 6. Modelo de estado de sesión

## 6.1 `SessionStatus`

En `src/core/auth/types.ts`:

```ts
export type SessionStatus = "loading" | "guest" | "authed";
```

### Significado

* `loading`: la app aún está resolviendo si existe o no una sesión restaurable
* `guest`: no hay sesión válida
* `authed`: existe sesión autenticada en memoria

---

## 6.2 `AuthNotice`

El módulo Auth ahora incluye una señal de UX global para comunicar eventos de sesión.

```ts
export type AuthNoticeKind = "info" | "success" | "warning" | "danger";

export interface AuthNotice {
  kind: AuthNoticeKind;
  message: string;
}
```

### Propósito

Permite mostrar mensajes consistentes al usuario desde el login o desde pantallas del flujo de acceso, por ejemplo:

* sesión cerrada correctamente
* sesión cerrada en todos los dispositivos
* sesión expirada

---

## 6.3 `SessionUser`

Actualmente el store conserva una versión resumida del usuario autenticado:

```ts
export interface SessionUser {
  id: string;
  nombre?: string;
  email?: string;
  role: Role;
  profileStatus: ProfileStatus;
  emailVerifiedAt?: string | null;
  activo?: boolean;
}
```

### Campos funcionales más importantes

* `emailVerifiedAt`

  * si es `null`, el usuario está autenticado pero no verificado
* `profileStatus`

  * si es `INCOMPLETE`, aún no puede entrar al módulo interno real
* `role`

  * permite restricciones por rol cuando el usuario ya está en etapa `ready`

---

## 6.4 `SessionState`

El store global contiene:

### Estado

* `status`
* `user`
* `accessToken`
* `authNotice`

### Acciones

* `setLoading()`
* `setGuest()`
* `setAuthedSession({ user, accessToken })`
* `setAccessToken(token)`
* `setAuthNotice(notice)`
* `clearAuthNotice()`
* `hardLogout()`

---

## 6.5 Reglas de diseño del estado

### Regla 1

El **accessToken** vive únicamente en memoria.

### Regla 2

El **refreshToken** vive persistido en storage seguro.

### Regla 3

El store representa la verdad actual de la sesión del cliente móvil.

### Regla 4

La navegación no depende solo de “hay token”, sino de la etapa funcional real del usuario.

### Regla 5

Los mensajes transitorios del ciclo de sesión viajan por `authNotice`.

---

## 7. Persistencia segura

## 7.1 `secureVault`

En `src/core/storage/secureVault.ts` se gestiona almacenamiento persistente del cliente.

### Datos persistidos

* `REFRESH_TOKEN`
* `DEVICE_ID`

---

## 7.2 Keys persistidas

En `src/core/storage/keys.ts`:

```ts
export const STORAGE_KEYS = {
  REFRESH_TOKEN: "refresh_token",
  DEVICE_ID: "device_id",
} as const;
```

---

## 7.3 `deviceId`

El `deviceId`:

* se crea si no existe
* se persiste localmente
* se reutiliza entre logins del mismo dispositivo
* identifica la sesión móvil ante el backend

### Regla importante

El `deviceId` **no se elimina al logout**.

No representa autenticación. Representa identidad del dispositivo.

---

## 7.4 `tokenService`

`src/core/auth/tokenService.ts` expone una fachada de uso simple:

* `getRefreshToken()`
* `setRefreshToken()`
* `clearRefreshToken()`
* `getDeviceId()`
* `setAccessToken()`

### Propósito

Evitar acceso directo del resto de la app a `secureVault` o al store.

---

## 8. Contrato HTTP y envelope del backend

El backend responde usando envelope uniforme.

```ts
type ApiEnvelope<T> = {
  data: T | null;
  meta: unknown | null;
  error: {
    code: string;
    message: string;
    details: unknown;
    stack?: string;
  } | null;
}
```

---

## 8.1 Detección del envelope

En `src/core/http/apiEnvelope.ts`:

* `ApiEnvelope<T>`
* `isApiEnvelope(v)`

---

## 8.2 `request<T>()` y unwrap

En `src/core/http/apiClient.ts`, el cliente HTTP:

* construye URL
* aplica headers
* serializa body JSON
* parsea respuesta
* detecta envelope
* desempaqueta `data`
* normaliza errores
* retorna `ApiResult<T>`

Esto evita trabajar con estructuras anidadas innecesarias en cada llamada.

---

## 8.3 `ApiResult<T>`

La capa HTTP trabaja con una unión discriminada segura:

* `ok: true` con `data`
* `ok: false` con `error`

Esto fuerza a tratar errores de manera explícita.

---

## 8.4 `normalizeError()`

`src/core/http/errorNormalizer.ts` convierte errores de red, backend y objetos arbitrarios a un formato homogéneo.

---

## 8.5 `getErrorMessage()`

`src/core/http/getErrorMessage.ts` extrae un mensaje usable desde distintos formatos de error.

Esto permite que hooks y pages muestren mensajes estables sin asumir shapes frágiles.

---

## 9. Header de plataforma

Todas las llamadas relevantes del módulo Auth usan:

```ts
{ "X-Client-Platform": "MOBILE" }
```

### Propósito

Permitir que el backend adapte comportamiento según cliente.

Esto es especialmente importante para:

* sesiones por dispositivo
* refresh mobile
* verificación de email para mobile
* logout contextual por plataforma

---

## 10. Tipos del módulo Auth

En `src/features/auth/types/auth.types.ts` se definen los contratos del módulo.

### Principales tipos

* `LoginRequest`
* `LoginResponse`
* `RefreshRequest`
* `RefreshResponse`
* `TokensDTO`
* `MeUserDTO`
* `MeResponse`
* `VerifyEmailRequest`
* `VerifyEmailConfirmRequest`
* `VerifyEmailConfirmResponse`

---

## 10.1 `TokensDTO`

```ts
export interface TokensDTO {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresAt?: string;
}
```

### Regla clave

Los tokens vienen dentro de:

* `data.tokens.accessToken`
* `data.tokens.refreshToken`

No vienen top-level.

---

## 10.2 `MeUserDTO`

El módulo Auth aún conserva un DTO resumido del usuario autenticado para `/auth/me`, aunque en el flujo móvil actual la fuente operativa real es `GET /users/me`.

---

## 11. API functions del módulo Auth

En `src/features/auth/data/auth.api.ts`:

* `login(payload)` → `POST /auth/login`
* `refresh(payload)` → `POST /auth/refresh`
* `logout()` → `POST /auth/logout`
* `logoutAll(payload)` → `POST /auth/logout-all`
* `me()` → `GET /auth/me`
* `requestEmailVerification(payload)` → `POST /auth/verify-email/request`
* `confirmEmailVerification(payload)` → `POST /auth/verify-email/confirm`
* `changePassword(payload)` → `POST /auth/change-password`

---

## 11.1 `request()` vs `authRequest()`

### `request()`

Se usa cuando no se requiere `Authorization`.

Ejemplos:

* login
* refresh
* request verify email
* confirm verify email

### `authRequest()`

Se usa cuando el endpoint requiere sesión autenticada.

Ejemplos:

* logout
* logout-all
* me
* change-password

---

## 12. Login

## 12.1 Objetivo funcional

El login debe:

* autenticar credenciales
* asociar la sesión al dispositivo
* obtener tokens
* persistir refresh token
* guardar access token en memoria
* cargar usuario real desde backend
* poblar el store global
* devolver estado suficiente para decidir navegación inmediata

---

## 12.2 `useLogin()`

`src/features/auth/hooks/useLogin.ts` implementa este flujo:

1. obtiene `deviceId`
2. llama `POST /auth/login`
3. si falla, lanza error normalizado
4. lee `accessToken` y `refreshToken` desde `loginRes.data.tokens`
5. persiste `refreshToken`
6. guarda `accessToken` en memoria
7. llama `GET /users/me`
8. mapea el usuario con `mapUserMeToSessionUser`
9. ejecuta `setAuthedSession({ user, accessToken })`
10. devuelve:

* `profileStatus`
* `emailVerified`

---

## 12.3 Por qué el login se hidrata con `GET /users/me`

Aunque el backend puede devolver un usuario en el login, el flujo actual usa `/users/me` como fuente real de hidratación para:

* usar el shape operativo del módulo Users
* tener consistencia con bootstrap y verify-email
* decidir navegación con la misma estructura de usuario en todos los casos

---

## 12.4 Navegación posterior al login

En `LoginPage.tsx`:

* si `emailVerified === false` → `/verify-email`
* si `profileStatus === "INCOMPLETE"` → `/onboarding`
* si todo está listo → `/`

Y luego el router resuelve la entrada final usando `resolveAppEntry()`.

---

## 12.5 `authNotice` en login

`LoginPage.tsx` consume:

* `authNotice`
* `clearAuthNotice()`

Esto permite que el login muestre mensajes generados por logout o expiración previa de sesión.

---

## 13. Bootstrap de sesión con `AuthProvider`

## 13.1 Objetivo

Resolver el estado inicial real al abrir la app.

---

## 13.2 Responsabilidad

`AuthProvider.tsx` decide si el usuario arranca como:

* `guest`
* `authed`

y mantiene `LoadingScreen` hasta resolverlo.

---

## 13.3 Flujo actual

1. `setLoading()`
2. leer refresh token
3. si no existe:

   * `setGuest()`
4. si existe:

   * intentar `refreshAccessToken()`
5. si refresh falla:

   * ejecutar `expireSessionAndRedirect()`
6. si refresh funciona:

   * llamar `GET /users/me`
7. si `getMe()` falla:

   * ejecutar `expireSessionAndRedirect()`
8. si `getMe()` funciona:

   * mapear usuario
   * `setAuthedSession({ user, accessToken })`

---

## 13.4 Comportamiento visual

Mientras `status === "loading"` se muestra:

* `LoadingScreen`

Esto evita render prematuro de rutas incorrectas o flickers de navegación.

---

## 14. Refresh de access token

## 14.1 Objetivo

Mantener la continuidad de sesión sin pedir login frecuente.

---

## 14.2 Implementación

En `src/core/http/refresh.ts`:

1. lee refresh token desde `tokenService`
2. si no existe, retorna `null`
3. llama `POST /auth/refresh`
4. si falla, retorna `null`
5. si funciona:

   * actualiza `accessToken` en store
   * persiste nuevo `refreshToken` si hubo rotación
6. retorna el nuevo access token

---

## 14.3 Mutex / `inFlight`

La implementación usa:

```ts
let inFlight: Promise<string | null> | null = null;
```

### Objetivo

Evitar múltiples refresh simultáneos cuando varias requests reciben `401` al mismo tiempo.

---

## 15. Interceptor de autenticación

## 15.1 Objetivo

`authRequest()` resuelve:

* inyección automática del `Authorization`
* ejecución de request protegida
* detección de `401`
* refresh automático
* retry una sola vez
* cierre controlado de sesión cuando el refresh ya no sirve

---

## 15.2 Flujo del interceptor

1. lee `accessToken` desde el store
2. ejecuta la request protegida
3. si responde bien, retorna
4. si el error no es `401`, retorna ese error
5. si es `401`, intenta `refreshAccessToken()`
6. si el refresh falla:

   * ejecuta `runForcedLogoutOnce()`
   * retorna error `SESSION_EXPIRED`
7. si el refresh funciona:

   * reintenta la request con el nuevo token
8. si el retry vuelve a responder `401`:

   * ejecuta `runForcedLogoutOnce()`
   * retorna error `SESSION_EXPIRED`

---

## 15.3 Forced logout una sola vez

`authInterceptor.ts` usa:

```ts
let forcedLogoutInFlight: Promise<void> | null = null;
```

### Propósito

Evitar que múltiples requests disparen expiraciones duplicadas y limpiezas repetidas de sesión.

---

## 16. Lifecycle de sesión centralizado

Uno de los cambios importantes del módulo es que el cierre de sesión ya no queda enterrado en un componente UI.

Ahora existe `src/core/auth/sessionLifecycle.ts`.

---

## 16.1 `finalizeClientLogout()`

Responsabilidades:

* limpiar refresh token
* limpiar cache de React Query
* ejecutar `hardLogout()`
* registrar `authNotice`

---

## 16.2 `logoutCurrentSession()`

Responsabilidades:

* llamar `POST /auth/logout`
* aunque falle backend, finalizar localmente
* dejar notice:

  * `Sesión cerrada correctamente.`

---

## 16.3 `logoutAllSessions()`

Responsabilidades:

* llamar `POST /auth/logout-all`
* enviar verificación explícita por contraseña

Payload actual:

```json
{
  "verification": {
    "method": "password",
    "password": "******"
  }
}
```

Luego siempre finaliza la sesión local y registra el notice:

* `Se cerró tu sesión en este y todos tus dispositivos.`

---

## 16.4 `expireSessionAndRedirect()`

Se usa cuando la sesión ya no es recuperable.

Responsabilidades:

* limpiar sesión local
* limpiar refresh token
* limpiar cache
* registrar notice:

  * `Tu sesión expiró. Inicia sesión nuevamente.`

---

## 16.5 Regla de diseño del lifecycle

La app ya no depende de que cada pantalla implemente su propia política de logout.

Eso reduce:

* duplicación
* inconsistencias
* olvidos de limpieza
* estados “fantasma” en cache

---

## 17. Verificación de email en mobile

## 17.1 Objetivo

Impedir que un usuario autenticado pero no verificado entre al módulo interno real.

---

## 17.2 Pantalla involucrada

* `src/features/auth/pages/VerifyEmailPage.tsx`

---

## 17.3 Flujo funcional del front

### Reenvío

* toma el email desde el store
* llama `POST /auth/verify-email/request`
* muestra mensaje de éxito o error

### Confirmación

* solicita código de 6 dígitos
* llama `POST /auth/verify-email/confirm`
* si confirma correctamente:

  * vuelve a llamar `GET /users/me`
  * actualiza la sesión global
  * redirige a:

    * `/onboarding` si el perfil sigue incompleto
    * `/profile` si ya está listo

---

## 17.4 Comportamiento esperado del backend para mobile

Cuando la llamada se hace con `X-Client-Platform: MOBILE`, el backend está preparado para un flujo mobile-first:

* envío de código de 6 dígitos por correo
* fallback por link/token para uso web si aplica

Desde la app móvil, el flujo consumido directamente es el del **código**.

---

## 17.5 Regla de consistencia

Después de verificar email, el front **no asume cambios locales manuales**.

Siempre refresca desde backend usando `GET /users/me`.

---

## 18. Etapas de acceso y navegación

## 18.1 `AuthStage`

En `src/app/routes/access.ts` existe una capa de resolución explícita:

```ts
export type AuthStage =
  | "loading"
  | "guest"
  | "unverified"
  | "onboarding"
  | "ready";
```

---

## 18.2 `getAuthStage()`

Resuelve la etapa real según:

* `status`
* `user`
* `emailVerifiedAt`
* `profileStatus`

### Resultado

* `loading`
* `guest`
* `unverified`
* `onboarding`
* `ready`

---

## 18.3 `resolveAppEntry()`

Define el destino natural del usuario según su etapa:

* `guest` → `/login`
* `unverified` → `/verify-email`
* `onboarding` → `/onboarding`
* `ready` → `/profile`

---

## 18.4 `getAccessRedirect()`

Centraliza la redirección correcta según la ruta objetivo y la etapa real del usuario.

Esto evita que cada pantalla tenga que reinventar la política de acceso.

---

## 18.5 `canAccessRole()`

Permite acceso solo si:

* el usuario está en etapa `ready`
* el rol del usuario está permitido

---

## 18.6 `filterNavigationItems()`

Filtra elementos de navegación internos según rol, pero solo si el usuario está realmente listo para acceder.

---

## 19. Guards del módulo

## 19.1 `GuestOnlyGuard`

Se usa para rutas que solo deben ver usuarios guest.

Ejemplo:

* `/login`

Si el usuario ya tiene sesión, lo redirige a su entry real.

---

## 19.2 `VerifyEmailGuard`

Protege la ruta `/verify-email`.

* guest → `/login`
* unverified → acceso permitido
* onboarding → `/onboarding`
* ready → `/profile`

---

## 19.3 `OnboardingGuard`

Protege la ruta `/onboarding`.

* guest → `/login`
* unverified → `/verify-email`
* onboarding → acceso permitido
* ready → `/profile`

---

## 19.4 `AppReadyGuard`

Protege rutas internas reales.

Permite acceso solo cuando el usuario ya está en etapa `ready`.

---

## 19.5 `RoleGuard`

Restringe por rol una vez que el usuario ya está apto para módulos internos.

---

## 19.6 `AuthGuard`

Sigue existiendo como guard genérico de autenticación, pero el control fino de etapa ya está mejor resuelto con `access.ts` y guards especializados.

---

## 20. Routing actual

En `src/app/routes/index.tsx`:

* `/login` → `GuestOnlyGuard`
* `/verify-email` → `VerifyEmailGuard`
* `/onboarding` → `OnboardingGuard`
* `/profile` → `AppReadyGuard`
* `/` → redirección a `resolveAppEntry()`
* fallback → redirección a `resolveAppEntry()`

### Observación importante

Aunque `/onboarding` y `/profile` pertenecen funcionalmente a Users, su acceso está gobernado por Auth porque dependen del estado de sesión y etapa.

---

## 21. Integración con Users

Aunque no pertenece a Auth, esta integración es estructural.

## 21.1 `GET /users/me`

Se usa en:

* login
* bootstrap
* verify-email confirm

### Propósito

Obtener la fuente de verdad del usuario operativo y decidir la etapa funcional real.

---

## 21.2 `mapUserMeToSessionUser()`

Permite convertir el DTO de Users al `SessionUser` que Auth guarda en el store.

---

## 21.3 `profileStatus`

Aunque el perfil se completa en Users, Auth consume ese dato para decidir navegación.

---

## 21.4 Onboarding

El onboarding es una pantalla del módulo Users, pero Auth lo trata como una etapa funcional obligatoria antes del acceso total.

---

## 22. Logout y fin del ciclo de sesión

## 22.1 Casos cubiertos

El módulo Auth ya cubre:

* logout manual
* logout-all
* sesión expirada
* refresh inválido
* bootstrap irrecuperable
* limpieza local completa
* cache invalidation
* aviso de UX vía `authNotice`

---

## 22.2 Limpieza mínima obligatoria

### Debe limpiarse

* `accessToken`
* `user`
* `status`
* `refreshToken`
* React Query cache

### No debe limpiarse

* `deviceId`

---

## 22.3 Por qué limpiar React Query cache

Porque de lo contrario pueden quedar datos autenticados antiguos aunque el usuario ya haya salido.

Eso incluye:

* perfil
* datos privados
* listas protegidas
* respuestas de queries previas

---

## 23. Manejo de sesión expirada

## 23.1 Caso recuperable

Si expira solo el access token:

1. request protegida responde `401`
2. interceptor intenta refresh
3. si refresh funciona:

   * actualiza token
   * reintenta request
4. el usuario sigue trabajando sin interrupción visible

---

## 23.2 Caso no recuperable

Si el refresh token ya no sirve:

* se considera sesión inválida
* se ejecuta `expireSessionAndRedirect()`
* se limpia todo
* se registra `authNotice`
* el usuario vuelve al login

---

## 23.3 Bootstrap irrecuperable

Si al abrir la app existe refresh token pero:

* no se logra refrescar
* o `GET /users/me` falla

la app invalida la sesión y vuelve a guest.

---

## 24. Mensajes de UX del módulo Auth

Mensajes actualmente modelados mediante `authNotice`:

### Logout manual

`Sesión cerrada correctamente.`

### Logout all

`Se cerró tu sesión en este y todos tus dispositivos.`

### Sesión expirada

`Tu sesión expiró. Inicia sesión nuevamente.`

### Reenvío de código

`Te enviamos un nuevo código al correo.`

---

## 25. Seguridad y decisiones de diseño

## 25.1 Access token en memoria

Reduce exposición persistente del token de acceso.

---

## 25.2 Refresh token persistido

Permite recuperar la sesión entre aperturas de app.

---

## 25.3 `deviceId`

Permite al backend distinguir sesiones por dispositivo y aplicar lógica de seguridad por cliente.

---

## 25.4 Navegación basada en etapa y no solo en autenticación

Estar autenticado no significa estar listo para entrar al sistema.

Aún puede faltar:

* verify email
* onboarding

---

## 25.5 Logout defensivo

Aunque el backend falle en `/auth/logout` o `/auth/logout-all`, el cliente debe quedar limpio igual.

Eso hace al módulo más robusto ante fallas parciales de red o backend.

---

## 26. Bugs resueltos y cambios clave

## 26.1 401 en endpoints protegidos + refresh inconsistente

### Causa

Desalineación previa entre el shape real del backend y la lectura de tokens en frontend.

### Solución

* unwrap correcto del envelope
* lectura correcta desde `data.tokens`
* refresh centralizado y seguro

---

## 26.2 Errores frágiles al leer `message`

### Causa

Se asumía que cualquier error tenía `message`.

### Solución

* uso de `ApiResult<T>`
* `getErrorMessage()`
* manejo explícito por rama `ok / !ok`

---

## 26.3 Refresh duplicado

### Causa

Múltiples requests con `401` podían disparar varios refresh.

### Solución

* mutex con `inFlight` en `refreshAccessToken()`

---

## 26.4 Logout disperso en UI

### Causa

El cierre de sesión estaba acoplado a componentes visuales.

### Solución

* `sessionLifecycle.ts`
* `finalizeClientLogout()`
* `logoutCurrentSession()`
* `logoutAllSessions()`
* `expireSessionAndRedirect()`

---

## 26.5 Falta de aviso visible al usuario

### Solución

Se introdujo `authNotice` para comunicar eventos importantes de sesión desde el flujo de acceso.

---

## 27. Checklist de verificación manual

## 27.1 Login

Verificar:

* `POST /auth/login`
* incluye `X-Client-Platform: MOBILE`
* retorna `data.tokens.accessToken`
* retorna `data.tokens.refreshToken`

---

## 27.2 Hidratación de usuario

Verificar:

* `GET /users/me`
* incluye `Authorization: Bearer <jwt>`
* retorna datos suficientes para decidir etapa

---

## 27.3 Refresh

Cuando expire el access token:

* request protegida responde `401`
* se dispara `POST /auth/refresh`
* body:

  ```json
  {
    "refreshToken": "..."
  }
  ```
* retorna nuevo access token
* si hay rotación, retorna nuevo refresh token

---

## 27.4 Verify email

### Reenvío

* `POST /auth/verify-email/request`

### Confirmación

* `POST /auth/verify-email/confirm`
* body con:

  * `email`
  * `code`

Luego debe volver a ejecutarse `GET /users/me`.

---

## 27.5 Logout manual

* `POST /auth/logout`
* limpiar refresh token
* limpiar cache
* `status` pasa a `guest`
* aparece `authNotice`
* usuario vuelve a `/login`

---

## 27.6 Logout all

* `POST /auth/logout-all`
* body con verificación por contraseña
* limpiar refresh token
* limpiar cache
* `status` pasa a `guest`
* aparece `authNotice`

---

## 27.7 Sesión expirada

Simular refresh token inválido:

* la sesión no se puede recuperar
* se ejecuta forced logout
* el usuario vuelve a login
* aparece notice de expiración

---

## 28. Estado actual del módulo Auth

## 28.1 Ya implementado

* login con `deviceId`
* refresh token persistido
* access token en memoria
* bootstrap de sesión
* refresh automático
* retry protegido por `401`
* forced logout centralizado
* verify email por código
* header mobile consistente
* guards por etapa
* resolver central de acceso
* logout manual centralizado
* logout-all centralizado
* limpieza de React Query cache
* `authNotice` para UX de sesión

---

## 28.2 Qué queda fuera porque pertenece a Users

* onboarding documentado en detalle
* `updateProfile`
* pantalla de cuenta
* perfil ampliado
* datos personales operativos

Eso debe vivir en el documento del **módulo Users**.

---

## 29. Conclusión

El módulo Auth Mobile ya no es solo un login funcional. Ahora es el sistema que gobierna de forma coherente:

* autenticación
* continuidad de sesión
* protección de acceso
* verify email
* expiración controlada
* salida limpia del sistema

La separación correcta con Users deja la arquitectura mucho más sana:

* **Auth** controla quién puede entrar y en qué etapa está
* **Users** controla qué datos personales tiene el usuario y qué tan completo está su perfil

Con esa frontera clara, el proyecto deja de mezclar “sesión” con “perfil”, y cada módulo queda responsable de su propio territorio.

---
