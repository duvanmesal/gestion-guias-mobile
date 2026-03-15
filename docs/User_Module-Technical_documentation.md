# Users Module (Mobile) – Documentación técnica

## 1. Objetivo

El módulo **Users** en la app móvil tiene como responsabilidad gestionar la **información operativa del usuario autenticado**.

Mientras Auth se encarga de la identidad, la sesión, los tokens y el acceso, **Users** se encarga de responder preguntas como:

* ¿quién es exactamente el usuario autenticado?
* ¿qué datos personales tiene cargados?
* ¿su perfil está completo o incompleto?
* ¿qué información debe mostrar la pantalla de cuenta?
* ¿qué cambios debe enviar el onboarding?
* ¿cómo se sincronizan esos cambios con el estado global del cliente?

En términos funcionales, el módulo Users gobierna:

* lectura del usuario autenticado desde `GET /users/me`
* transformación del DTO backend a `SessionUser`
* actualización del perfil mínimo requerido
* soporte al flujo de onboarding
* hidratación de la pantalla de cuenta
* exposición visual de datos de usuario
* sincronización entre backend, React Query y store de sesión

---

## 2. Alcance del módulo

## 2.1 Qué sí pertenece a Users

El módulo Users Mobile cubre estas responsabilidades:

### Fuente de verdad del usuario

* consumo de `GET /users/me`
* normalización del shape de usuario del backend
* mapeo hacia la estructura interna del cliente
* sincronización del usuario en el store global

### Perfil y onboarding

* edición del perfil mínimo del usuario
* actualización de nombres, apellidos, teléfono y documento
* cambio del estado funcional de perfil
* soporte al onboarding inicial

### Pantalla de cuenta

* exposición de datos del usuario autenticado
* formato de labels y máscara de documento
* refresco manual desde backend
* acciones visuales relacionadas con la cuenta

### Integración con el ciclo de acceso

* entrega a Auth de `profileStatus`
* entrega a Auth de `emailVerifiedAt`
* soporte a la resolución de etapa: `unverified`, `onboarding`, `ready`

---

## 2.2 Qué no pertenece a Users

Estos comportamientos no deben documentarse ni implementarse como parte de Users:

* login
* refresh token
* logout / logout-all
* persistencia del refresh token
* bootstrap de sesión
* interceptor con retry por `401`
* expiración de sesión
* guards de acceso
* `authNotice`

Todo eso pertenece al **módulo Auth**.

---

## 3. Límite funcional entre Users y Auth

La frontera correcta queda así:

### Users es dueño de:

* `GET /users/me`
* `PATCH /users/me/profile`
* onboarding
* pantalla de perfil / cuenta
* datos personales
* perfil completo o incompleto
* mappers del usuario autenticado

### Auth es dueño de:

* login
* tokens
* refresh
* verify email
* guards
* routing por etapa
* logout
* sesión expirada

### Punto de integración clave

Auth usa `GET /users/me` para decidir si el usuario:

* aún no ha verificado email
* ya verificó email pero tiene perfil incompleto
* ya está listo para entrar a módulos internos

Users no decide la política de navegación, pero sí entrega los datos que la hacen posible.

---

## 4. Estructura de archivos del módulo Users

## 4.1 Feature Users

* `src/features/users/data/users.api.ts`
* `src/features/users/data/users.keys.ts`
* `src/features/users/data/users.mappers.ts`
* `src/features/users/hooks/useMe.ts`
* `src/features/users/hooks/useMyAccount.ts`
* `src/features/users/hooks/useUpdateProfile.ts`
* `src/features/users/pages/OnboardingPage.tsx`
* `src/features/users/pages/ProfilePage.tsx`
* `src/features/users/components/OnboardingForm.tsx`
* `src/features/users/components/ProfileCard.tsx`
* `src/features/users/types/users.types.ts`
* `src/features/users/utils/accountFormatters.ts`

---

## 4.2 Integraciones usadas por Users

Aunque pertenezcan a otras capas, Users se apoya en:

* `src/core/http/apiClient.ts`
* `src/core/http/authInterceptor.ts`
* `src/core/http/getErrorMessage.ts`
* `src/core/auth/sessionStore.ts`
* `src/features/auth/hooks/useChangePassword.ts`

---

## 4.3 Relación con pantallas protegidas

Las pantallas del módulo Users que participan en el flujo global son:

* `OnboardingPage.tsx`
* `ProfilePage.tsx`

Aunque son pantallas de Users, su acceso está protegido por Auth en el router.

---

## 5. Arquitectura general del módulo

## 5.1 `pages`

Representan pantallas completas del módulo.

### Ejemplos

* `OnboardingPage.tsx`
* `ProfilePage.tsx`

---

## 5.2 `components`

Encapsulan UI reutilizable y lógica visual local.

### Ejemplos

* `OnboardingForm.tsx`
* `ProfileCard.tsx`

---

## 5.3 `hooks`

Orquestan lectura y mutación de datos del usuario.

### Ejemplos

* `useMe()`
* `useMyAccount()`
* `useUpdateProfile()`

---

## 5.4 `data/*.api.ts`

Define las funciones HTTP del módulo Users.

### Ejemplos

* `getMe()`
* `updateMyProfile()`
* `getGuidesLookup()`

---

## 5.5 `mappers`

Transforman DTOs del backend al modelo interno usado por el cliente.

### Ejemplo central

* `mapUserMeToSessionUser()`

---

## 5.6 `utils`

Resuelven formato visual y helpers específicos de cuenta.

### Ejemplos

* `buildFullName()`
* `getDocumentTypeLabel()`
* `maskDocumentNumber()`
* `getRoleLabel()`
* `getVerificationLabel()`
* `getProfileStatusLabel()`

---

## 6. Responsabilidad central: `GET /users/me`

## 6.1 Objetivo

`GET /users/me` es la **fuente de verdad del usuario autenticado** dentro del cliente móvil.

No es solo una query de perfil. Es el contrato que permite saber:

* quién es el usuario autenticado
* si ya verificó email
* si su perfil está completo
* qué datos deben mostrarse en cuenta
* qué estado debe reflejar el store de sesión

---

## 6.2 Por qué es tan importante

Este endpoint se usa en varios momentos críticos del sistema:

* después del login
* durante el bootstrap de sesión
* después de confirmar verificación de email
* después de actualizar perfil
* al refrescar manualmente la pantalla de cuenta

Es el punto donde Users y Auth se tocan.

---

## 6.3 Regla de diseño

La app no debe inventar ni asumir localmente el estado final del usuario.

Siempre que ocurra un cambio relevante, se debe volver a consultar `GET /users/me`.

Eso evita estados fantasmas y mantiene sincronía real con backend.

---

## 7. Tipos del módulo Users

En `src/features/users/types/users.types.ts` se modelan los contratos del backend y las requests del módulo.

---

## 7.1 `UpdateProfileRequest`

```ts id="3yzgvs"
export interface UpdateProfileRequest {
  nombres: string;
  apellidos: string;
  telefono: string;
  documentType: DocumentType;
  documentNumber: string;
}
```

### Propósito

Representa el payload que el onboarding y futuras ediciones de perfil envían a:

* `PATCH /users/me/profile`

---

## 7.2 `UpdateProfileResponse`

```ts id="r10r5g"
export interface UpdateProfileResponse {
  profileStatus: ProfileStatus;
}
```

### Propósito

Permite al front saber si el backend considera que el perfil quedó completo o aún no.

---

## 7.3 `UserMeResponse`

El DTO de `GET /users/me` contiene la información operativa del usuario autenticado.

Ejemplo de shape esperado:

```ts id="n0c9qs"
export interface UserMeResponse {
  id: string;
  nombre?: string;
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  email?: string;
  telefono?: string | null;
  documento?: string | null;
  documentType?: UserDocumentType | null;
  documentNumber?: string | null;
  rol?: Role;
  role?: Role;
  profileStatus: ProfileStatus;
  profileCompletedAt?: string | null;
  emailVerifiedAt?: string | null;
  activo?: boolean;
}
```

---

## 7.4 Observación sobre compatibilidad de nombres

El módulo Users soporta pequeñas variaciones del backend en campos como:

* `rol` o `role`
* `nombre` o `nombres`
* `apellido` o `apellidos`
* `documento` o `documentNumber`

Esto vuelve al mapper más tolerante y evita que una variación mínima rompa la experiencia.

---

## 8. Mapper principal del módulo

## 8.1 `mapUserMeToSessionUser()`

En `src/features/users/data/users.mappers.ts`, este mapper transforma `UserMeResponse` al modelo `SessionUser`.

### Objetivo

Unificar el shape del backend con el shape interno del store y la UI.

---

## 8.2 Responsabilidades del mapper

* combinar `nombres` y `apellidos` en `nombre`
* resolver `rol` vs `role`
* resolver `documentNumber` vs `documento`
* mantener `emailVerifiedAt`
* mantener `profileStatus`
* mantener `activo`
* entregar un objeto consistente al store

---

## 8.3 Beneficio

Evita que la UI y los hooks dependan directamente de detalles inestables del backend.

El mapper funciona como traductor entre “idioma backend” e “idioma front”.

---

## 9. API functions del módulo Users

En `src/features/users/data/users.api.ts` viven las funciones de acceso HTTP del módulo.

## 9.1 Funciones principales

* `getMe()` → `GET /users/me`
* `updateMyProfile(payload)` → `PATCH /users/me/profile`
* `getGuidesLookup()` → endpoint de lookup de guías, si aplica en el proyecto

---

## 9.2 Uso de `authRequest()`

Las funciones del módulo Users suelen usar `authRequest()` porque dependen de que exista un usuario autenticado.

Esto aplica especialmente a:

* `getMe()`
* `updateMyProfile()`

### Razón

Los datos del usuario autenticado son recursos protegidos y deben viajar con `Authorization`.

---

## 10. Hook `useMe()`

## 10.1 Objetivo

`useMe()` permite obtener el usuario autenticado usando React Query.

Su propósito es encapsular la lectura de `GET /users/me` y exponer un query reutilizable.

---

## 10.2 Casos de uso

* consumo puntual del usuario autenticado
* refresco de datos operativos
* sincronización de vistas que dependan del perfil
* reutilización de `usersKeys.me()`

---

## 10.3 Papel en la arquitectura

Aunque Auth consume `getMe()` de manera directa en puntos críticos, `useMe()` sigue siendo útil para vistas del módulo Users y escenarios de consulta controlada por React Query.

---

## 11. Hook `useMyAccount()`

## 11.1 Objetivo

`useMyAccount()` existe para conectar la pantalla de cuenta con la fuente de verdad real del backend.

---

## 11.2 Flujo

1. ejecuta `getMe()`
2. si falla, lanza error legible
3. si funciona:

   * transforma la respuesta con `mapUserMeToSessionUser()`
   * actualiza el store global usando `setAuthedSession()`
   * devuelve el usuario actualizado

---

## 11.3 Beneficio

La pantalla de cuenta deja de depender de un snapshot viejo del store y puede refrescarse contra backend.

En otras palabras, evita que el perfil mostrado sea una foto vieja pegada en la nevera.

---

## 11.4 Regla importante

Cuando la pantalla de cuenta refresca datos reales, el store también debe quedar alineado.

No basta con renderizar el nuevo usuario localmente. La sesión global debe enterarse.

---

## 12. Hook `useUpdateProfile()`

## 12.1 Objetivo

`useUpdateProfile()` resuelve la actualización del perfil mínimo del usuario.

---

## 12.2 Flujo actual

1. llama `PATCH /users/me/profile`
2. si falla, lanza error normalizado
3. si funciona:

   * vuelve a llamar `GET /users/me`
   * transforma la respuesta con el mapper
   * actualiza el store global
   * invalida `usersKeys.me()`

---

## 12.3 Por qué vuelve a pedir `GET /users/me`

Porque el front no debe asumir que el estado final del usuario es exactamente el que él envió.

El backend puede:

* normalizar datos
* recalcular `profileStatus`
* ajustar campos
* enriquecer la respuesta

El re-fetch garantiza consistencia real.

---

## 12.4 Efecto funcional

Este hook es el responsable de que, después de completar onboarding, el usuario pase de:

* `profileStatus = "INCOMPLETE"`

a:

* `profileStatus = "COMPLETE"`

si el backend así lo determina.

---

## 13. Onboarding

## 13.1 Objetivo

El onboarding es la etapa donde el usuario ya está autenticado y verificado, pero todavía no ha completado la información mínima requerida por el sistema.

Aunque el control de acceso lo decide Auth, la **pantalla y la lógica de perfil** pertenecen al módulo Users.

---

## 13.2 Pantallas y componentes involucrados

* `src/features/users/pages/OnboardingPage.tsx`
* `src/features/users/components/OnboardingForm.tsx`

---

## 13.3 Flujo funcional actual

El onboarding ejecuta dos pasos encadenados:

1. actualización de perfil
2. cambio de contraseña

---

## 13.4 Responsabilidad exacta de Users en ese flujo

Users se encarga de:

* renderizar el formulario
* validar y enviar datos del perfil
* sincronizar el usuario resultante
* dejar listo el estado de perfil en el store

El cambio de contraseña pertenece al módulo Auth, aunque sea invocado desde la misma pantalla.

---

## 13.5 Resultado esperado

Si el perfil se actualiza correctamente y la contraseña cambia con éxito:

* el usuario queda listo para entrar al módulo interno real
* la navegación pasa a `/`
* Auth resuelve finalmente el entry hacia `/profile` u otra pantalla permitida

---

## 14. Pantalla de perfil / cuenta

## 14.1 Objetivo

La pantalla de cuenta permite mostrar al usuario la versión actual de sus datos operativos.

No es solo una vista bonita. También sirve para validar visualmente que:

* el store de sesión está sincronizado
* `GET /users/me` responde correctamente
* el mapeo de campos está bien resuelto
* el estado del usuario coincide con lo esperado por backend

---

## 14.2 Pantallas y componentes involucrados

* `src/features/users/pages/ProfilePage.tsx`
* `src/features/users/components/ProfileCard.tsx`

---

## 14.3 Datos mostrados

La pantalla de cuenta expone:

* nombres
* apellidos
* email
* teléfono
* tipo de documento
* número de documento enmascarado
* rol
* estado de verificación
* estado del perfil
* estado activo/inactivo si aplica

---

## 14.4 Acciones visibles

La pantalla también puede incluir:

* refrescar datos desde backend
* cerrar sesión
* cerrar todas las sesiones

### Importante

Las acciones de logout se **muestran** en esta pantalla, pero la política de logout pertenece al módulo Auth a través de `sessionLifecycle.ts`.

---

## 15. `ProfileCard.tsx`

## 15.1 Objetivo

`ProfileCard` encapsula la UI de la cuenta del usuario autenticado.

---

## 15.2 Props principales

```ts id="l3f6y9"
interface ProfileCardProps {
  user: SessionUser;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}
```

---

## 15.3 Responsabilidades del componente

* renderizar datos del usuario
* mostrar chips de estado
* aplicar helpers de formato
* disparar refresh visual
* invocar acciones de salida expuestas por Auth

---

## 15.4 Regla de diseño

El componente no debe reinventar la lógica de negocio del logout ni del refresh token.

Su trabajo es presentar la cuenta y disparar acciones ya resueltas en capas correctas.

---

## 16. Helpers visuales del módulo

En `src/features/users/utils/accountFormatters.ts` se concentran los helpers de presentación.

---

## 16.1 `buildFullName()`

Compone el nombre completo usando:

* `nombres`
* `apellidos`
* o `nombre` como fallback

---

## 16.2 `getDocumentTypeLabel()`

Traduce valores internos como:

* `CC`
* `CE`
* `TI`
* `PASSPORT`

a labels amigables para la UI.

---

## 16.3 `maskDocumentNumber()`

Enmascara el documento dejando visibles solo los últimos dígitos.

Ejemplo conceptual:

* `1234567890` → `••••••7890`

### Beneficio

Mejora privacidad visual sin perder capacidad de reconocimiento por parte del usuario.

---

## 16.4 `getRoleLabel()`

Convierte valores técnicos a labels más humanos:

* `SUPER_ADMIN` → `Super administrador`
* `SUPERVISOR` → `Supervisor`
* `GUIA` → `Guía`

---

## 16.5 `getVerificationLabel()`

Evalúa `emailVerifiedAt` y devuelve:

* `Verificado`
* `Pendiente`

---

## 16.6 `getProfileStatusLabel()`

Evalúa `profileStatus` y devuelve:

* `Completo`
* `Incompleto`

---

## 17. Integración con React Query

## 17.1 Keys del módulo

En `src/features/users/data/users.keys.ts` se definen las query keys del módulo.

La clave más importante es:

* `usersKeys.me()`

---

## 17.2 Regla principal

Cada vez que el perfil del usuario cambie, `usersKeys.me()` debe invalidarse o refrescarse.

---

## 17.3 Escenarios típicos

### Después de `updateMyProfile()`

* invalidar `usersKeys.me()`
* volver a pedir `GET /users/me`

### En pantalla de cuenta

* permitir `refetch()` manual
* sincronizar store después del fetch

---

## 17.4 Beneficio

React Query actúa como caché coherente del usuario, pero sin reemplazar el rol del store de sesión.

---

## 18. Relación entre Users y el store global

## 18.1 Qué guarda el store

El store de sesión no guarda todo el universo del usuario, sino una versión funcional resumida útil para navegación, UX y pantallas clave.

---

## 18.2 Qué hace Users con ese store

Users actualiza el store cuando:

* se resuelve `GET /users/me`
* se completa el onboarding
* se refresca la cuenta
* se confirma verify email y el usuario vuelve a cargarse

---

## 18.3 Regla importante

Users no es dueño del store, pero sí es uno de sus principales hidratadores.

Auth decide cuándo iniciar o cerrar sesión.
Users decide con qué datos concretos queda representado el usuario autenticado.

---

## 19. Contrato mínimo que el backend debe entregar

Para que el módulo Users funcione de forma completa, `GET /users/me` debe exponer como mínimo:

* `id`
* `email`
* `nombres`
* `apellidos`
* `telefono`
* `rol`
* `profileStatus`
* `emailVerifiedAt`
* `documentType`
* `documentNumber`
* `activo` si aplica

---

## 19.1 Observación importante sobre documento

Si el backend no retorna:

* `documentType`
* `documentNumber`

la pantalla de cuenta no podrá mostrar el documento enmascarado y terminará usando fallback como:

* `No registrado`

---

## 19.2 Ajuste de backend necesario

Para soportar el perfil enriquecido, el select de `userMe` en la API debe incluir explícitamente:

```ts id="jt6fw8"
documentType: true,
documentNumber: true,
```

---

## 20. Estado funcional del usuario desde la perspectiva de Users

Aunque Auth decide la navegación, Users aporta los dos campos clave para esa decisión:

## 20.1 `emailVerifiedAt`

Indica si el correo ya fue verificado.

---

## 20.2 `profileStatus`

Indica si el perfil requerido por el sistema está:

* `INCOMPLETE`
* `COMPLETE`

---

## 20.3 Combinación funcional

Esto permite que el sistema distinga entre:

* usuario autenticado pero no verificado
* usuario verificado pero con onboarding pendiente
* usuario listo para usar módulos internos

Users no decide la ruta, pero sí entrega el tablero de señales.

---

## 21. Checklist de verificación manual del módulo Users

## 21.1 `GET /users/me`

Verificar:

* endpoint responde `200`
* incluye `Authorization`
* retorna los campos esperados
* `profileStatus` coincide con el estado real del usuario

---

## 21.2 Mapper

Verificar:

* `rol` se mapea correctamente a `role`
* `documentNumber` o `documento` terminan bien en `SessionUser`
* `nombre` se compone correctamente con nombres y apellidos

---

## 21.3 Onboarding

Verificar:

* `PATCH /users/me/profile`
* la respuesta no falla
* luego se ejecuta nuevamente `GET /users/me`
* el store queda actualizado
* `profileStatus` cambia cuando corresponde

---

## 21.4 Pantalla de cuenta

Verificar:

* renderiza datos actuales
* refresca correctamente
* muestra documento enmascarado
* muestra labels de rol y verificación
* no depende solo del snapshot inicial del store

---

## 21.5 Sincronización con Auth

Verificar:

* después de actualizar perfil, Auth ya no redirige a onboarding si el backend marcó `COMPLETE`
* después de verify email, el usuario avanza según el `profileStatus` real

---

## 22. Seguridad y decisiones de diseño

## 22.1 Re-fetch después de mutaciones

El front no debe asumir que el estado final del usuario coincide exactamente con el payload enviado.

Por eso `GET /users/me` se vuelve a consultar después de mutaciones relevantes.

---

## 22.2 Documento enmascarado

El documento no debe mostrarse completo en UI de cuenta si no es necesario.

El enmascaramiento mejora privacidad y experiencia.

---

## 22.3 Mapper tolerante

El mapper acepta pequeñas variaciones de naming del backend para hacer el sistema más resistente a cambios menores.

---

## 22.4 Users no administra tokens

Aunque el módulo actualiza el store con datos del usuario, no debe tocar la política de refresh token, logout o session expired.

Eso evita mezclar perfil con sesión, que fue justamente el problema que estás corrigiendo.

---

## 23. Bugs resueltos y ajustes importantes

## 23.1 Desalineación `rol` vs `role`

### Causa

Backend y front no usaban el mismo nombre de propiedad.

### Solución

El mapper resuelve ambos formatos y normaliza a `role`.

---

## 23.2 Documento no visible en cuenta

### Causa

`GET /users/me` no exponía explícitamente `documentNumber`.

### Solución

Actualizar el select del backend y mapear correctamente:

* `documentType`
* `documentNumber`

---

## 23.3 Perfil desactualizado en pantalla de cuenta

### Causa

La UI podía quedar usando solo el snapshot del store.

### Solución

* `useMyAccount()`
* `refetch()` manual
* actualización simultánea del store

---

## 23.4 Mezcla entre Users y Auth

### Causa

El documento anterior mezclaba onboarding, perfil, cuenta, verify email, sesión y routing como si todo fuera Auth.

### Solución

Separación clara:

* Users documenta perfil y usuario
* Auth documenta sesión y acceso

---

## 24. Estado actual del módulo Users

## 24.1 Ya implementado

* `GET /users/me`
* mapper de usuario autenticado
* actualización de perfil
* onboarding page
* onboarding form
* sincronización con store global
* invalidación de `usersKeys.me()`
* pantalla de cuenta
* `ProfileCard`
* refresh manual de cuenta
* helpers visuales para cuenta
* soporte para documento enmascarado y labels amigables

---

## 24.2 Qué queda fuera porque pertenece a Auth

* login
* refresh token
* session restore
* forced logout
* verify email como política de acceso
* guards
* route resolution
* notices de sesión

---

## 25. Conclusión

El módulo Users Mobile es el dueño del **usuario como entidad operativa dentro de la app**.

Su misión no es autenticar al usuario, sino representar con precisión quién es, qué datos tiene cargados y qué tan completo está su perfil.

La separación correcta deja la arquitectura mucho más limpia:

* **Auth** controla identidad, sesión y acceso
* **Users** controla perfil, cuenta y completitud del usuario
