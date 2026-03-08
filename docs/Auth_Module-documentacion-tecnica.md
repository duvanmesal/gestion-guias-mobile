# Auth Module (Mobile) – Documentación técnica

## 1. Objetivo

El módulo **Auth** en la app móvil tiene como responsabilidad gestionar el ciclo completo de autenticación, autorización básica de acceso y continuidad de sesión del usuario.

Este módulo no solo cubre el **inicio de sesión**, sino también todo el recorrido posterior:

* Login con credenciales + `deviceId`
* Persistencia segura del **refreshToken**
* Manejo del **accessToken** en memoria usando Zustand
* Recuperación de sesión al iniciar la app
* Renovación automática del access token
* Consumo de endpoints protegidos mediante interceptor
* Verificación de email por código
* Redirección a onboarding si el perfil está incompleto
* Protección de rutas según estado real de sesión
* Logout manual
* Logout global en todos los dispositivos
* Manejo de sesión expirada o no recuperable
* Limpieza coherente de estado local, storage seguro y cache

En términos funcionales, el módulo asegura que el usuario:

* entre solo cuando corresponde,
* vea la pantalla correcta según su estado,
* no acceda manualmente a rutas inválidas,
* y salga de forma limpia cuando su sesión termina.

---

## 2. Alcance del módulo

El módulo Auth Mobile cubre estas decisiones de negocio y técnicas:

### 2.1 Entrada a sesión

* autenticación con email + contraseña
* identificación del dispositivo mediante `deviceId`
* almacenamiento del refresh token
* resolución de estado inicial del usuario autenticado

### 2.2 Continuidad de sesión

* lectura del refresh token al iniciar la app
* obtención de nuevo access token vía `/auth/refresh`
* consulta de `/users/me` para hidratar el store de sesión
* reintento automático si un endpoint protegido responde `401`

### 2.3 Estado funcional del usuario

* usuario deslogueado
* usuario autenticado pero no verificado
* usuario verificado pero con perfil incompleto
* usuario listo para entrar al módulo interno real

### 2.4 Salida de sesión

* logout de la sesión actual
* logout de todas las sesiones
* cierre forzado por expiración o invalidez del refresh token
* limpieza de memoria, storage y cache

---

## 3. Estructura de archivos (paths reales)

## 3.1 Providers

* `src/app/providers/AppProviders.tsx`
* `src/app/providers/AuthProvider.tsx`
* `src/app/providers/QueryProvider.tsx`

## 3.2 Estado de sesión

* `src/core/auth/sessionStore.ts`
* `src/core/auth/types.ts`
* `src/core/auth/tokenService.ts`

## 3.3 Persistencia segura

* `src/core/storage/secureVault.ts`
* `src/core/storage/keys.ts`

## 3.4 HTTP Core

* `src/core/http/apiClient.ts`
* `src/core/http/types.ts`
* `src/core/http/apiEnvelope.ts`
* `src/core/http/authInterceptor.ts`
* `src/core/http/refresh.ts`
* `src/core/http/errorNormalizer.ts`
* `src/core/http/getErrorMessage.ts`

## 3.5 Routing y guards

* `src/app/routes/index.tsx`
* `src/app/routes/guards/AuthGuard.tsx`
* `src/app/routes/guards/OnboardingGuard.tsx`
* `src/app/routes/guards/RoleGuard.tsx`

## 3.6 Feature Auth

* `src/features/auth/data/auth.api.ts`
* `src/features/auth/data/auth.keys.ts`
* `src/features/auth/data/auth.mappers.ts`
* `src/features/auth/hooks/useLogin.ts`
* `src/features/auth/hooks/useChangePassword.ts`
* `src/features/auth/pages/LoginPage.tsx`
* `src/features/auth/pages/VerifyEmailPage.tsx`
* `src/features/auth/components/LoginForm.tsx`
* `src/features/auth/types/auth.types.ts`

## 3.7 Feature Users relacionada con el flujo Auth

* `src/features/users/data/users.api.ts`
* `src/features/users/data/users.keys.ts`
* `src/features/users/data/users.mappers.ts`
* `src/features/users/hooks/useMe.ts`
* `src/features/users/hooks/useUpdateProfile.ts`
* `src/features/users/pages/OnboardingPage.tsx`
* `src/features/users/pages/ProfilePage.tsx`
* `src/features/users/components/OnboardingForm.tsx`
* `src/features/users/components/ProfileCard.tsx`
* `src/features/users/types/users.types.ts`

## 3.8 UI base usada por Auth

* `src/ui/components/LoadingScreen.tsx`
* `src/ui/components/ErrorState.tsx`

---

## 4. Arquitectura general del módulo

La arquitectura del módulo sigue una separación por responsabilidades:

### 4.1 `pages`

Representan pantallas completas y resuelven navegación.

Ejemplos:

* `LoginPage.tsx`
* `VerifyEmailPage.tsx`
* `OnboardingPage.tsx`
* `ProfilePage.tsx`

### 4.2 `components`

Encapsulan UI reutilizable y lógica visual local.

Ejemplos:

* `LoginForm.tsx`
* `ProfileCard.tsx`
* `OnboardingForm.tsx`

### 4.3 `hooks`

Orquestan casos de uso del front usando React Query o lógica de integración.

Ejemplos:

* `useLogin()`
* `useChangePassword()`
* `useUpdateProfile()`
* `useMe()`

### 4.4 `data/*.api.ts`

Define las funciones de acceso HTTP al backend.

Ejemplos:

* `auth.api.ts`
* `users.api.ts`

### 4.5 `mappers`

Transforman DTOs del backend a estructuras internas del front.

Ejemplos:

* `mapMeToSessionUser`
* `mapUserMeToSessionUser`

### 4.6 `core/auth`

Concentra el modelo global de sesión, token management y store.

### 4.7 `core/http`

Resuelve cliente HTTP, normalización de errores, envelope, interceptor y refresh.

---

## 5. Modelo de estado de sesión

## 5.1 `SessionStatus`

En `src/core/auth/types.ts`:

```ts
export type SessionStatus = "loading" | "guest" | "authed";
```

### Significado

* `loading`: la app aún está resolviendo si existe una sesión recuperable
* `guest`: no hay sesión válida
* `authed`: hay sesión autenticada en memoria

---

## 5.2 `SessionUser`

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

### Propiedades relevantes para navegación

* `emailVerifiedAt`

  * si existe, el usuario se considera verificado
  * si es `null`, debe pasar por verificación de email

* `profileStatus`

  * `INCOMPLETE`: debe completar onboarding
  * `COMPLETE`: ya puede entrar al módulo interno real

* `role`

  * habilita protecciones por rol usando `RoleGuard`

---

## 5.3 `SessionState`

En `src/core/auth/types.ts` y `src/core/auth/sessionStore.ts`:

### Estado

* `status`
* `user`
* `accessToken`

### Acciones

* `setLoading()`
* `setGuest()`
* `setAuthedSession({ user, accessToken })`
* `setAccessToken(token)`
* `hardLogout()`

---

## 5.4 Reglas de diseño del estado

### Regla 1

El **accessToken** vive únicamente en memoria.

### Regla 2

El **refreshToken** vive persistido en storage seguro.

### Regla 3

El store global representa la verdad actual de la sesión activa del cliente.

### Regla 4

La navegación nunca debe depender solo de “si hay token”, sino del binomio:

* autenticación válida
* estado funcional del usuario (`emailVerifiedAt`, `profileStatus`)

---

## 6. Persistencia segura

## 6.1 `secureVault`

En `src/core/storage/secureVault.ts` se usa `@capacitor/preferences`.

Expone almacenamiento seguro y tolerante a fallo mediante `try/catch`.

### Operaciones internas

* `get(key)`
* `set(key, value)`
* `remove(key)`

### Datos persistidos

* `REFRESH_TOKEN`
* `DEVICE_ID`

---

## 6.2 Keys persistidas

En `src/core/storage/keys.ts`:

```ts
export const STORAGE_KEYS = {
  REFRESH_TOKEN: "refresh_token",
  DEVICE_ID: "device_id",
} as const;
```

---

## 6.3 `deviceId`

El `deviceId`:

* se genera si no existe
* se persiste localmente
* se reutiliza entre logins del mismo dispositivo
* sirve para que el backend identifique la sesión por dispositivo y plataforma

### Regla importante

El `deviceId` **no se elimina al logout**.
No representa autenticación, representa identidad del dispositivo.

---

## 6.4 `tokenService`

En `src/core/auth/tokenService.ts` se expone una fachada simple:

* `getRefreshToken()`
* `setRefreshToken()`
* `clearRefreshToken()`
* `getDeviceId()`
* `setAccessToken()`

### Propósito

Evitar que el resto de la app acceda directamente a `secureVault` o al store.

---

## 7. Contrato del backend y envelope HTTP

El backend responde con un envelope uniforme:

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

## 7.1 Detección del envelope

En `src/core/http/apiEnvelope.ts`:

* `ApiEnvelope<T>`
* `isApiEnvelope(v)`

Esto permite que la capa HTTP detecte si la respuesta vino envuelta en la estructura estándar del backend.

---

## 7.2 Unwrap en `apiClient`

En `src/core/http/apiClient.ts`:

* si la respuesta viene envuelta, el cliente retorna solo `data`
* si hay error envuelto, usa `json.error`
* si la respuesta es vacía, maneja `204` o `content-length: 0`

### Beneficio

El front trabaja con:

```ts
ApiResult<T>
```

en lugar de tener que escribir:

```ts
res.data.data.tokens.accessToken
```

---

## 8. Capa HTTP y normalización de errores

## 8.1 `request<T>()`

En `src/core/http/apiClient.ts`, `request<T>()`:

* construye URL usando `ENV.apiUrl`
* aplica `Content-Type: application/json`
* serializa body
* parsea JSON
* hace unwrap de envelope
* normaliza errores de red y backend
* retorna `ApiResult<T>`

---

## 8.2 `ApiResult<T>`

La capa HTTP usa un resultado discriminado de forma segura:

* `ok: true` con `data`
* `ok: false` con `error`

Esto evita acceder a propiedades inexistentes y permite control de flujo seguro.

---

## 8.3 `normalizeError()`

En `src/core/http/errorNormalizer.ts`:

* convierte errores de red y objetos arbitrarios en un `ApiErrorNormalized`
* asigna `status`, `code`, `message`, `details`

---

## 8.4 `getErrorMessage()`

En `src/core/http/getErrorMessage.ts`:

* extrae mensajes de `string`
* `Error`
* objetos con `message`
* o usa un fallback

### Beneficio

La UI y los hooks pueden mostrar errores sin asumir una forma rígida del objeto.

---

## 9. Tipos del módulo Auth

En `src/features/auth/types/auth.types.ts` se modelan las respuestas y requests del módulo.

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

## 9.1 `TokensDTO`

```ts
export interface TokensDTO {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresAt?: string;
}
```

### Regla clave

Los tokens vienen en:

* `tokens.accessToken`
* `tokens.refreshToken`

No vienen top-level.

Ese detalle fue crítico para resolver errores previos de autenticación.

---

## 10. API functions del módulo Auth

En `src/features/auth/data/auth.api.ts`:

* `login(payload)` → `POST /auth/login`
* `refresh(payload)` → `POST /auth/refresh`
* `logout()` → `POST /auth/logout`
* `logoutAll()` → `POST /auth/logout-all`
* `me()` → `GET /auth/me`
* `requestEmailVerification(payload)` → `POST /auth/verify-email/request`
* `confirmEmailVerification(payload)` → `POST /auth/verify-email/confirm`
* `changePassword(payload)` → `POST /auth/change-password`

---

## 10.1 Header de plataforma

Todas las llamadas relevantes incluyen:

```ts
{ "X-Client-Platform": "MOBILE" }
```

### Propósito

Permite al backend adaptar comportamiento por cliente.

Ejemplos:

* refresh token por body en mobile
* sesiones por dispositivo
* verificación de email específica para mobile
* reglas distintas a web

---

## 10.2 Diferencia entre `request()` y `authRequest()`

### `request()`

Se usa cuando no se necesita `Authorization`.

Ejemplos:

* login
* refresh
* request email verification
* confirm email verification

### `authRequest()`

Se usa cuando el endpoint requiere usuario autenticado.

Ejemplos:

* logout
* logout-all
* me
* update profile
* change password
* get guides

---

## 11. Login

## 11.1 Objetivo funcional

El login debe:

* autenticar credenciales
* obtener tokens
* persistir refresh token
* cargar usuario real desde backend
* poblar el store global
* devolver información mínima para decidir la navegación inmediata

---

## 11.2 `useLogin()`

En `src/features/auth/hooks/useLogin.ts`.

### Flujo actual

1. Obtiene `deviceId` desde `tokenService.getDeviceId()`
2. Llama `/auth/login`
3. Si falla, lanza error normalizado
4. Lee `accessToken` y `refreshToken` desde `loginRes.data.tokens`
5. Persiste `refreshToken`
6. Guarda `accessToken` en memoria
7. Llama `/users/me`
8. Mapea respuesta a `SessionUser`
9. Ejecuta `setAuthedSession({ user, accessToken })`
10. Devuelve:

* `profileStatus`
* `emailVerified`

---

## 11.3 ¿Por qué se llama luego `/users/me`?

Aunque el login ya retorna un `user`, el flujo actual usa `/users/me` para:

* obtener la versión más consistente del usuario autenticado
* asegurar que el front trabaja con el shape real usado por el módulo Users
* homogeneizar mapeo y navegación

---

## 11.4 Navegación después del login

En `LoginPage.tsx`:

* si `emailVerified === false` → `/verify-email`
* si `profileStatus === "INCOMPLETE"` → `/onboarding`
* si todo está completo → `/`

Y luego el router decide el destino final protegido.

---

## 12. Refresh de access token

## 12.1 Objetivo

Permitir que el usuario continúe usando la app sin volver a loguearse cada vez que expire el access token.

---

## 12.2 Implementación

En `src/core/http/refresh.ts`:

1. Lee refresh token desde `tokenService.getRefreshToken()`
2. Si no existe, retorna `null`
3. Llama `POST /auth/refresh` con body:

```json
{
  "refreshToken": "..."
}
```

4. Si falla, retorna `null`
5. Si funciona:

   * actualiza `accessToken` en store
   * si el backend rotó refresh token, persiste el nuevo
6. retorna el nuevo `accessToken`

---

## 12.3 Mutex / in-flight

La función usa:

```ts
let inFlight: Promise<string | null> | null = null;
```

### Objetivo

Evitar múltiples refresh simultáneos.

### Beneficio

Si varias requests fallan al mismo tiempo con `401`, no se disparan varios refresh en paralelo como fuegos artificiales en una oficina, sino un solo refresh compartido.

---

## 13. Interceptor de autenticación

## 13.1 Objetivo

`authRequest()` en `src/core/http/authInterceptor.ts` resuelve:

* lectura del access token desde Zustand
* inyección del header `Authorization`
* detección de `401`
* refresh automático una sola vez
* retry de la request original

---

## 13.2 Flujo del interceptor

1. Lee `accessToken` desde `useSessionStore.getState()`
2. Construye headers
3. Ejecuta `request<T>()`
4. Si `ok`, retorna el resultado
5. Si el error no es `401`, retorna el error tal cual
6. Si es `401`, intenta `refreshAccessToken()`
7. Si el refresh devuelve token, reintenta la misma request una vez
8. Si el refresh falla, retorna el error

---

## 13.3 Regla importante

El interceptor actual **no fuerza logout por sí mismo**.
Solo intenta recuperar la sesión.

Esto es correcto como base, pero el cierre de sesión por expiración debe quedar centralizado para que:

* limpie store
* limpie refresh token
* limpie React Query cache
* notifique al usuario
* redirija a login

Ese bloque forma parte de la evolución natural del módulo.

---

## 14. Bootstrap de sesión (`AuthProvider`)

## 14.1 Objetivo

Resolver el estado inicial de la app cuando esta se abre en frío o recarga.

---

## 14.2 Responsabilidad

`AuthProvider.tsx` decide si el usuario arranca como:

* `guest`
* `authed`

y bloquea la UI con `LoadingScreen` mientras se determina.

---

## 14.3 Flujo actual

1. `setLoading()`
2. leer refresh token desde storage
3. si no existe:

   * `setGuest()`
4. si existe:

   * intentar `refreshAccessToken()`
5. si refresh falla:

   * limpiar refresh token
   * `hardLogout()`
   * `setGuest()`
6. si refresh funciona:

   * llamar `/users/me`
7. si `/users/me` falla:

   * limpiar refresh token
   * `hardLogout()`
   * `setGuest()`
8. si `/users/me` funciona:

   * mapear usuario
   * `setAuthedSession({ user, accessToken })`

---

## 14.4 Comportamiento visual

Mientras `status === "loading"` se muestra:

* `LoadingScreen`

Esto evita flickers de navegación y evita que la app renderice pantallas protegidas antes de conocer el estado real.

---

## 15. Verificación de email

## 15.1 Objetivo

Impedir que un usuario autenticado sin email verificado acceda al módulo interno real.

---

## 15.2 Pantalla involucrada

* `src/features/auth/pages/VerifyEmailPage.tsx`

---

## 15.3 Flujo funcional

### Reenvío de código

* usa el email del usuario en store
* llama `/auth/verify-email/request`
* muestra mensaje de éxito o error

### Confirmación de código

* llama `/auth/verify-email/confirm`
* si confirma correctamente:

  * vuelve a pedir `/users/me`
  * actualiza la sesión global
  * redirige a:

    * `/onboarding` si el perfil sigue incompleto
    * `/` si ya puede entrar al flujo interno

---

## 15.4 Regla de consistencia

Después de verificar email, la app no debería asumir cambios locales a mano.
Debe refrescar el usuario desde backend para mantener sincronía real.

---

## 16. Onboarding y perfil incompleto

## 16.1 Objetivo

Impedir que un usuario ya autenticado y verificado entre a módulos internos si aún no ha completado su perfil mínimo.

---

## 16.2 Pantalla involucrada

* `src/features/users/pages/OnboardingPage.tsx`

---

## 16.3 Flujo

En el onboarding actual se ejecutan dos pasos encadenados:

1. `updateProfile`
2. `changePassword`

Si ambos salen bien:

* redirige a `/`

---

## 16.4 Actualización de sesión tras onboarding

`useUpdateProfile()`:

* llama `/users/me/profile`
* luego vuelve a llamar `/users/me`
* actualiza el store con el usuario más reciente
* invalida `usersKeys.me()`

Esto asegura que `profileStatus` quede actualizado en el store y el routing ya no lo trate como incompleto.

---

## 17. Routing y guards

## 17.1 Objetivo

Cerrar todos los huecos de navegación manual.

El routing debe impedir estos escenarios:

* usuario no verificado entrando a módulos internos
* usuario con perfil incompleto entrando al home real
* usuario completo regresando a verify/onboarding
* usuario guest entrando a rutas protegidas
* acceso manual por URL directa

---

## 17.2 Implementación actual en `src/app/routes/index.tsx`

La app usa un `ProtectedRoute` local que:

* bloquea mientras `status === "loading"`
* manda a `/login` si `status !== "authed"`

Encima de eso, cada ruta decide con redirecciones condicionales según:

* `emailVerified`
* `profileStatus`

---

## 17.3 Flujo por rutas

### `/login`

* si `status === "authed"` redirige a `/`
* si no, muestra login

### `/verify-email`

* requiere sesión autenticada
* si el email ya está verificado:

  * si perfil incompleto → `/onboarding`
  * si perfil completo → `/`
* si aún no está verificado:

  * muestra `VerifyEmailPage`

### `/onboarding`

* requiere sesión autenticada
* si el email no está verificado → `/verify-email`
* si perfil completo → `/`
* si perfil incompleto → muestra onboarding

### `/profile`

* requiere sesión autenticada
* si email no verificado → `/verify-email`
* si perfil incompleto → `/onboarding`
* si todo está bien → muestra perfil

### `/`

* requiere sesión autenticada
* si email no verificado → `/verify-email`
* si perfil incompleto → `/onboarding`
* si todo está bien → redirige a `/profile`

---

## 17.4 Guards reutilizables presentes

Existen además estos guards:

* `AuthGuard.tsx`
* `OnboardingGuard.tsx`
* `RoleGuard.tsx`

### Observación técnica

Actualmente el `index.tsx` resuelve la mayor parte del control con lógica interna y no reutiliza completamente esos guards.
La evolución recomendada es centralizar la política de acceso en guards especializados o en una capa de resolución única de navegación.

---

## 17.5 `RoleGuard`

Permite restringir vistas por rol:

* si no está autenticado → `/login`
* si el rol no está permitido → `/`

Debe usarse solo para vistas que ya requieren usuario “ready”, no como reemplazo del flujo de verificación/onboarding.

---

## 18. Estado funcional del usuario y navegación resultante

A nivel de negocio, el usuario pasa por cuatro estados reales:

### 18.1 Guest

* no autenticado
* entra a `/login`

### 18.2 Authed no verificado

* autenticado
* `emailVerifiedAt = null`
* entra a `/verify-email`

### 18.3 Authed verificado con perfil incompleto

* `emailVerifiedAt` existe
* `profileStatus = "INCOMPLETE"`
* entra a `/onboarding`

### 18.4 Authed listo

* email verificado
* perfil completo
* puede entrar a `/profile` y módulos internos

---

## 19. Logout y cierre del ciclo de sesión

## 19.1 Objetivo

El módulo Auth no termina en el login.
También debe definir con precisión cómo sale el usuario y qué ocurre cuando la sesión deja de ser válida.

---

## 19.2 Casos que deben quedar cubiertos

* logout manual
* logout all
* expiración del access token
* refresh token inválido, expirado o revocado
* fallo irrecuperable al recuperar la sesión
* limpieza total del estado local
* mensaje visible para el usuario
* redirección segura a login

---

## 19.3 Estado actual del repo

Hoy el logout está resuelto desde `ProfileCard.tsx`:

* `handleLogout()`

  * llama `authApi.logout()`
  * ejecuta `hardLogout()`
  * limpia refresh token
  * redirige a `/login`

* `handleLogoutAll()`

  * llama `authApi.logoutAll()`
  * ejecuta `hardLogout()`
  * limpia refresh token
  * redirige a `/login`

### Limitaciones actuales

1. la lógica está acoplada al componente de UI
2. no se limpia React Query cache
3. no existe un mensaje global de sesión expirada o logout exitoso
4. `logoutAll()` no documenta todavía una verificación explícita del usuario
5. si el refresh falla dentro del interceptor, no hay aún un cierre centralizado y controlado de sesión

---

## 19.4 Diseño recomendado para un cierre de sesión robusto

La política recomendada del módulo es:

### Logout manual

* llamar `/auth/logout`
* aunque falle backend, limpiar localmente
* borrar refresh token
* limpiar access token en store
* limpiar cache de React Query
* redirigir a `/login`
* mostrar mensaje: `Sesión cerrada correctamente.`

### Logout all

* llamar `/auth/logout-all`
* invalidar todas las sesiones del usuario
* limpiar localmente igual que logout manual
* redirigir a `/login`
* mostrar mensaje: `Se cerró tu sesión en este y todos tus dispositivos.`

### Access token expirado

* request protegida responde `401`
* interceptor intenta refresh una vez
* si refresh funciona, la app sigue silenciosamente

### Refresh token inválido o expirado

* se considera sesión no recuperable
* se limpia estado completo
* se redirige a `/login`
* se muestra mensaje: `Tu sesión expiró. Inicia sesión nuevamente.`

---

## 19.5 Limpieza mínima obligatoria al cerrar sesión

### Debe limpiarse

* `accessToken` en memoria
* `user` en store
* `status` hacia `guest`
* `refreshToken` en storage
* cache React Query asociada a usuario autenticado

### No debe limpiarse

* `deviceId`

---

## 19.6 ¿Por qué limpiar React Query cache?

Porque aunque el usuario salga, el cache puede seguir reteniendo:

* datos del perfil
* consultas protegidas previas
* listas de guías u otros recursos privados

Si no se limpia, el logout parece bonito por fuera pero deja migas técnicas por dentro.

---

## 20. Manejo de sesión expirada

## 20.1 Caso 1: expira solo el access token

Esto es el caso esperado y recuperable.

### Flujo

1. una request protegida responde `401`
2. `authRequest()` detecta `401`
3. intenta `refreshAccessToken()`
4. si refresh funciona:

   * actualiza token en store
   * reintenta la request
5. el usuario no ve interrupción

---

## 20.2 Caso 2: el refresh token ya no sirve

Esto ya no es recuperable.

Puede ocurrir por:

* expiración real
* revocación
* rotación invalidada
* logout desde otro dispositivo
* logout all
* inconsistencia de sesión

### Respuesta esperada del front

* finalizar sesión local
* limpiar storage
* limpiar cache
* volver a `/login`
* informar al usuario

---

## 20.3 Caso 3: bootstrap falla al restaurar la sesión

Si al iniciar la app:

* existe refresh token
* pero no se logra refrescar
* o `/users/me` falla

entonces la app debe asumir que la sesión ya no es válida y volver a `guest`.

Ese comportamiento ya existe en `AuthProvider`, aunque puede enriquecerse con aviso visible al usuario si se quiere una UX más explícita.

---

## 21. Mensajes de UX recomendados

Para evitar una experiencia muda o confusa, el módulo debe manejar mensajes de sesión de forma coherente.

### Logout manual

`Sesión cerrada correctamente.`

### Logout all

`Se cerró tu sesión en este y todos tus dispositivos.`

### Sesión expirada

`Tu sesión expiró. Inicia sesión nuevamente.`

### Reenvío de código

`Te enviamos un nuevo código al correo.`

### Verificación exitosa

Puede usarse implícitamente con redirección, o mostrar:
`Correo verificado correctamente.`

---

## 22. Integración con React Query

## 22.1 Uso actual

Se usa React Query en hooks como:

* `useLogin`
* `useChangePassword`
* `useUpdateProfile`

y existe un `QueryClient` global en `QueryProvider.tsx`.

---

## 22.2 Reglas recomendadas

### En login

No es obligatorio limpiar cache, pero sí dejar el store completamente consistente.

### En logout

Sí debe limpiarse el `queryClient`.

### En update profile

Se invalida `usersKeys.me()` para reflejar datos actualizados.

---

## 23. Seguridad y decisiones de diseño

## 23.1 Por qué access token en memoria

Porque reduce persistencia accidental de credenciales de acceso y obliga a que la continuidad de sesión se resuelva mediante refresh token.

---

## 23.2 Por qué refresh token persistido

Porque permite restaurar sesión después de cerrar y abrir la app sin pedir login cada vez.

---

## 23.3 Por qué `deviceId`

Porque el backend puede distinguir sesiones por dispositivo y aplicar lógica de seguridad, auditoría o logout selectivo.

---

## 23.4 Por qué no navegar solo por `status === "authed"`

Porque `authed` no implica que el usuario ya esté listo para entrar al sistema real.
Aún puede faltar:

* verificación de email
* onboarding de perfil

---

## 24. Bugs resueltos y causa raíz

## 24.1 401 en `/auth/me` + 400 en `/auth/refresh`

### Causa

El front estaba leyendo tokens en la ubicación equivocada por desalineación entre:

* envelope backend
* tipos del front
* unwrap HTTP

### Resultado

* `Authorization: Bearer undefined`
* refresh token vacío o incorrecto

### Solución

* unwrap de envelope en `apiClient`
* lectura correcta de `res.data.tokens.accessToken`
* lectura correcta de `res.data.tokens.refreshToken`

---

## 24.2 `Cannot read properties of undefined (reading 'message')`

### Causa

Se accedía a `error.message` sin garantizar que existiera.

### Solución

* usar `ApiResult<T>` como unión discriminada
* acceder a `res.error` solo dentro de `if (!res.ok)`
* usar `getErrorMessage()` como capa de protección

---

## 24.3 Refresh duplicado en dev / StrictMode

### Causa

React 18 en desarrollo puede ejecutar efectos dos veces y disparar doble refresh si el flujo no está protegido.

### Solución

* mutex con `inFlight` en `refreshAccessToken()`

---

## 24.4 Logout acoplado a UI

### Causa

La lógica de logout vive hoy dentro de `ProfileCard.tsx`.

### Riesgo

* duplicación futura
* limpieza incompleta
* difícil manejo de sesión expirada global

### Solución recomendada

mover la política de cierre de sesión a una capa central de lifecycle de sesión.

---

## 25. Checklist de verificación manual

## 25.1 Login

Verificar en Network:

* `POST /auth/login` → 200
* response contiene `data.tokens.accessToken`
* response contiene `data.tokens.refreshToken`
* request incluye `X-Client-Platform: MOBILE`

---

## 25.2 Carga de usuario

* `GET /users/me` → 200
* request incluye `Authorization: Bearer <jwt real>`

---

## 25.3 Refresh

Cuando expire el access token:

* request protegida responde `401`
* se dispara `POST /auth/refresh`
* body enviado:

```json
{
  "refreshToken": "..."
}
```

* response contiene `data.tokens.accessToken`
* si hubo rotación, contiene también `data.tokens.refreshToken`

---

## 25.4 Verify email

### Reenvío

* `POST /auth/verify-email/request`
* body con `email`

### Confirmación

* `POST /auth/verify-email/confirm`
* body con:

  * `email`
  * `code`

Después debe llamarse nuevamente `/users/me`.

---

## 25.5 Onboarding

* `PATCH /users/me/profile`
* luego `POST /auth/change-password`
* luego navegación a `/`

---

## 25.6 Logout manual

* `POST /auth/logout`
* limpiar refresh token
* `status` pasa a `guest`
* redirige a `/login`

---

## 25.7 Logout all

* `POST /auth/logout-all`
* limpiar refresh token local
* `status` pasa a `guest`
* redirige a `/login`

---

## 25.8 Expiración no recuperable

Simular refresh token inválido:

* la request protegida termina en error no recuperable
* la sesión se invalida
* la app vuelve a login
* el usuario ve mensaje claro

---

## 26. Recomendaciones de consistencia para dejar el módulo blindado

## 26.1 Mantener una única forma de resultado HTTP

* `request<T>()` → `ApiResult<T>`
* `authRequest<T>()` → `ApiResult<T>`
* hooks y pages consumen `ApiResult<T>`

---

## 26.2 Centralizar el cierre de sesión

Mover logout manual, logout all y sesión expirada a una política común.

---

## 26.3 Centralizar la política de navegación

Evitar que cada pantalla tome decisiones distintas sobre quién entra y quién no.

---

## 26.4 Separar “sesión autenticada” de “usuario listo”

Un usuario puede estar autenticado y aun así no estar listo para entrar al core de la app.

---

## 27. Flujo resumido de extremo a extremo

## 27.1 Login exitoso

1. usuario ingresa credenciales
2. backend autentica
3. front guarda refresh token
4. front guarda access token en memoria
5. front consulta `/users/me`
6. store queda autenticado
7. router decide:

   * verify-email
   * onboarding
   * profile

---

## 27.2 App abierta de nuevo

1. `AuthProvider` arranca en `loading`
2. lee refresh token
3. intenta refresh
4. si funciona, consulta `/users/me`
5. repuebla store
6. router decide destino

---

## 27.3 Request protegida con token expirado

1. backend devuelve `401`
2. interceptor intenta refresh
3. si funciona, reintenta request
4. usuario sigue trabajando

---

## 27.4 Sesión no recuperable

1. refresh falla
2. limpiar estado
3. volver a login
4. pedir autenticación nuevamente

---

## 28. Estado actual vs evolución inmediata recomendada

## 28.1 Ya implementado en el repo

* login con `deviceId`
* refresh token persistido
* access token en memoria
* bootstrap de sesión
* interceptor con retry por refresh
* verify email por código
* onboarding
* guards/rutas protegidas básicas
* logout manual y logout all desde perfil

## 28.2 Siguiente bloque recomendado

* centralizar logout y sesión expirada
* limpiar React Query cache al cerrar sesión
* mostrar aviso global de logout/sesión expirada
* unificar guards y routing fino en una política de acceso reutilizable
* robustecer `logout-all` según el contrato exacto del backend

---

## 29. Conclusión

El módulo Auth Mobile ya tiene una base sólida:

* separa access token y refresh token correctamente
* recupera sesión al iniciar
* renueva access token automáticamente
* controla verify email y onboarding
* protege rutas internas principales

El siguiente paso para dejarlo verdaderamente robusto es cerrar el ciclo completo de sesión con una política centralizada de:

* logout
* sesión expirada
* limpieza local
* cache invalidation
* mensajes de UX
* redirección uniforme

Ahí es donde el módulo deja de ser solo “login que funciona” y se convierte en un sistema de autenticación móvil consistente, resistente y agradable de mantener.
