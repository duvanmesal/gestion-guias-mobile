# Auth Module (Mobile) – Documentación técnica

## Objetivo

El módulo **Auth** gestiona:

* Login (credenciales + `deviceId`)
* Persistencia segura del **refreshToken**
* Manejo del **accessToken** en memoria (store Zustand)
* Recuperación de sesión al iniciar la app (bootstrap)
* Renovación automática del access token (refresh)
* Endpoints protegidos usando interceptor

---

## Estructura de archivos (paths reales)

### Provider (bootstrap)

* `src/app/providers/AuthProvider.tsx`

### Estado de sesión (Zustand)

* `src/core/auth/sessionStore.ts`
* `src/core/auth/types.ts`

### Persistencia de tokens / deviceId

* `src/core/auth/tokenService.ts`
* `src/core/storage/secureVault.ts`
* `src/core/storage/keys.ts`

### HTTP Core

* `src/core/http/apiClient.ts`
* `src/core/http/types.ts`
* `src/core/http/apiEnvelope.ts`
* `src/core/http/authInterceptor.ts`
* `src/core/http/refresh.ts`

### Feature Auth

* `src/features/auth/data/auth.api.ts`
* `src/features/auth/data/auth.mappers.ts`
* `src/features/auth/hooks/useLogin.ts`
* `src/features/auth/pages/LoginPage.tsx`
* `src/features/auth/components/LoginForm.tsx`
* `src/features/auth/types/auth.types.ts`

---

## Modelo de estado de sesión (Zustand)

### `SessionState`

En `src/core/auth/sessionStore.ts`:

* `status`: `"loading" | "guest" | "authed"`
* `user`: datos del usuario autenticado o `null`
* `accessToken`: string o `null`

Acciones:

* `setLoading()`: pone la app en estado cargando sesión
* `setGuest()`: estado no autenticado
* `setAuthedSession({ user, accessToken })`: estado autenticado
* `setAccessToken(accessToken)`
* `hardLogout()`: reset total a guest

**Regla:** el `accessToken` vive en memoria en Zustand; el refresh token vive persistido.

---

## Persistencia segura (refreshToken + deviceId)

### `secureVault` (Capacitor Preferences)

En `src/core/storage/secureVault.ts` se usa:

* `Preferences.get/set/remove` (fallback-safe con try/catch)
* `DEVICE_ID` se genera si no existe (UUID simple)
* `REFRESH_TOKEN` se guarda/lee/borra

### `tokenService`

En `src/core/auth/tokenService.ts`, expone:

* `getRefreshToken() / setRefreshToken() / clearRefreshToken()`
* `getDeviceId()`
* `setAccessToken()` (es un helper que setea en store)

---

## Contrato del Backend (Envelope)

El backend responde con un envelope estándar:

```ts
type ApiEnvelope<T> = {
  data: T | null;
  meta: unknown | null;
  error: { code: string; message: string; details: unknown; stack?: string } | null;
}
```

### Unwrap automático en `apiClient`

`src/core/http/apiClient.ts` detecta el envelope usando `isApiEnvelope()` y si viene envuelto devuelve **solo `data`** en `ApiResult<T>`.

Esto evita que el front tenga que estar escribiendo `res.data.data...`.

---

## Tipos del módulo Auth

En `src/features/auth/types/auth.types.ts`:

* `LoginRequest { email, password, deviceId? }`
* `LoginResponse { user, tokens, session? }`
* `TokensDTO { accessToken, refreshToken?, ... }`
* `MeResponse = MeUserDTO`
* `RefreshResponse { tokens, session? }`

**Clave:** los tokens vienen en `tokens.accessToken` / `tokens.refreshToken` (no top-level).

---

## API functions del módulo Auth

En `src/features/auth/data/auth.api.ts`:

* `login(payload)` → `POST /auth/login`
* `refresh(payload)` → `POST /auth/refresh`
* `me()` → `GET /auth/me`
* `logout()` → `POST /auth/logout`
* `logoutAll()` → `POST /auth/logout-all`

### Header de plataforma

Siempre se envía:

```ts
{ "X-Client-Platform": "MOBILE" }
```

Esto se usa para que el backend aplique reglas específicas (ej: refresh token por body, device sessions, etc.)

---

## Interceptor de autenticación

### Objetivo

* Adjuntar `Authorization: Bearer <accessToken>` en requests protegidas
* Si el backend devuelve 401, intentar refresh
* Reintentar una sola vez con token renovado

### Puntos clave del interceptor

1. El accessToken se lee SIEMPRE desde `useSessionStore.getState()` al momento del request
   (evita closures viejos).
2. El refresh se hace con `refreshAccessToken()`.
3. Si refresh falla, se devuelve error y el caller decide setGuest/hardLogout.

> Importante: este interceptor debe ser consistente con el tipo que retorna tu capa HTTP (`ApiResult<T>`).
> Recomendación: `authRequest<T>()` debería retornar `Promise<ApiResult<T>>` para que el resto de `auth.api.ts` sea coherente.

---

## Refresh de accessToken

En `src/core/http/refresh.ts`:

* Lee refresh token desde `tokenService.getRefreshToken()`
* Llama `POST /auth/refresh` con `{ refreshToken }`
* Si ok:

  * actualiza `accessToken` en store
  * si backend rota refresh token y devuelve uno nuevo, se persiste el nuevo `refreshToken`
* Retorna `string | null` (nuevo access token o null si falla)

---

## Bootstrap de sesión (AuthProvider)

En `src/app/providers/AuthProvider.tsx`:

### Responsabilidad

* Recuperar sesión en frío (reload/app start)
* Decidir si el usuario inicia en:

  * `guest` → muestra login
  * `authed` → entra a la app

### Flujo recomendado (paso a paso)

1. `setLoading()`
2. leer `refreshToken`

   * si no existe: `setGuest()`
3. refresh access token

   * si falla: `clearRefreshToken()` + `hardLogout()` + `setGuest()`
4. llamar `/auth/me`

   * si falla: limpiar y `setGuest()`
5. mapear user + setAuthedSession({ user, accessToken })

### UI behavior

* si `status === "loading"` se muestra `LoadingScreen`
* si `guest`, el router te lleva a login
* si `authed`, entras al app shell

---

## Hook de Login (useLogin)

En `src/features/auth/hooks/useLogin.ts`:

### Responsabilidad

* llamar `login`
* persistir refresh token
* setear access token
* pedir `/me`
* setear la sesión en store (`setAuthedSession`)
* retornar `profileStatus` para decidir navegación (ej: si completar perfil)

### Flujo correcto esperado

1. `deviceId = await tokenService.getDeviceId()`
2. `res = await authApi.login({ email, password, deviceId })`
3. Guardar tokens:

   * `await tokenService.setRefreshToken(res.data.tokens.refreshToken)`
   * `useSessionStore.getState().setAccessToken(res.data.tokens.accessToken)`
4. `meRes = await authApi.me()`
5. `setAuthedSession({ user, accessToken })`

---

## Bugs resueltos y causa raíz

### 1) 401 en `/auth/me` + 400 en `/auth/refresh`

**Causa:** el front estaba leyendo tokens en el lugar incorrecto (top-level) por no hacer unwrap del envelope y/o por tipos desalineados.
Resultado: `Bearer undefined` y refreshToken vacío.

**Solución:**

* `apiClient` hace unwrap de envelope
* `useLogin`/`AuthProvider` leen tokens desde `res.data.tokens.*`

---

### 2) “Cannot read properties of undefined (reading 'message')”

**Causa:** se intentaba leer `error.message` cuando `error` era `undefined` o de forma distinta.

**Solución recomendada:**

* usar `ApiResult` como discriminated union (`ok: true|false`)
* solo acceder a `res.error` dentro de `if (!res.ok)`

---

### 3) Refresh falla al recargar (401/rotación) y StrictMode

En dev, React 18 puede ejecutar efectos dos veces, y si el backend rota refresh tokens, un doble refresh puede invalidar el token.

**Mitigación recomendada:**

* implementar mutex/inFlight en `refreshAccessToken()` o manejar idempotencia en bootstrap

---

## Checklist de verificación (manual)

En DevTools → Network, validar:

### Login

* `POST /auth/login` → 200
* response `data.tokens.accessToken` existe
* response `data.tokens.refreshToken` existe

### Me

* `GET /auth/me` → 200
* request headers: `Authorization: Bearer <jwt real>`

### Refresh (cuando accessToken expira)

* `POST /auth/refresh` body:

  ```json
  { "refreshToken": "..." }
  ```
* response 200 con `data.tokens.accessToken`
* si rota: llega `data.tokens.refreshToken` y se persiste

---

## Recomendación final de consistencia (para que no vuelvan bugs)

Para que todo el módulo sea consistente:

* `request<T>()` retorna `ApiResult<T>`
* `authRequest<T>()` debería retornar **también** `ApiResult<T>`
* `auth.api.ts` siempre retorna `ApiResult<T>`
* hooks/providers solo dependen de `ApiResult`

Esto vuelve el módulo “a prueba de balas” y reduce bugs por tipado mezclado.
