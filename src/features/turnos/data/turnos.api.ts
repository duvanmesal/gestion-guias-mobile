import {
  authRequest,
  authRequestEnvelope,
} from "../../../core/http/authInterceptor";
import type {
  ApiEnvelopeResult,
  ApiResult,
} from "../../../core/http/types";
import type {
  ListTurnosMeParams,
  ListTurnosParams,
  TurnoItem,
  TurnoListMeta,
} from "../types/turnos.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

function appendCommon(
  search: URLSearchParams,
  params: ListTurnosMeParams
): void {
  if (params.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params.dateTo) search.set("dateTo", params.dateTo);
  if (typeof params.atencionId === "number")
    search.set("atencionId", String(params.atencionId));
  if (typeof params.recaladaId === "number")
    search.set("recaladaId", String(params.recaladaId));
  if (params.status) search.set("status", params.status);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 20));
}

function buildListSearch(params: ListTurnosParams): string {
  const search = new URLSearchParams();
  appendCommon(search, params);
  if (params.guiaId) search.set("guiaId", params.guiaId);
  if (typeof params.assigned === "boolean")
    search.set("assigned", params.assigned ? "true" : "false");
  return search.toString();
}

function buildListMeSearch(params: ListTurnosMeParams): string {
  const search = new URLSearchParams();
  appendCommon(search, params);
  return search.toString();
}

export function getTurnos(
  params: ListTurnosParams = {},
  signal?: AbortSignal
): Promise<ApiEnvelopeResult<TurnoItem[], TurnoListMeta>> {
  const query = buildListSearch(params);
  return authRequestEnvelope<TurnoItem[], TurnoListMeta>(
    `/turnos${query ? `?${query}` : ""}`,
    { method: "GET", headers: { ...PLATFORM_HEADER }, signal }
  );
}

export function getMyTurnos(
  params: ListTurnosMeParams = {},
  signal?: AbortSignal
): Promise<ApiEnvelopeResult<TurnoItem[], TurnoListMeta>> {
  const query = buildListMeSearch(params);
  return authRequestEnvelope<TurnoItem[], TurnoListMeta>(
    `/turnos/me${query ? `?${query}` : ""}`,
    { method: "GET", headers: { ...PLATFORM_HEADER }, signal }
  );
}

export function getMyNextTurno(
  signal?: AbortSignal
): Promise<ApiResult<TurnoItem | null>> {
  return authRequest<TurnoItem | null>(`/turnos/me/next`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function getMyActiveTurno(
  signal?: AbortSignal
): Promise<ApiResult<TurnoItem | null>> {
  return authRequest<TurnoItem | null>(`/turnos/me/active`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function getTurnoById(
  id: number,
  signal?: AbortSignal
): Promise<ApiResult<TurnoItem>> {
  return authRequest<TurnoItem>(`/turnos/${id}`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function claimTurno(id: number): Promise<ApiResult<TurnoItem>> {
  return authRequest<TurnoItem>(`/turnos/${id}/claim`, {
    method: "POST",
    headers: { ...PLATFORM_HEADER },
  });
}

export function checkInTurno(id: number): Promise<ApiResult<TurnoItem>> {
  return authRequest<TurnoItem>(`/turnos/${id}/check-in`, {
    method: "PATCH",
    headers: { ...PLATFORM_HEADER },
  });
}

export function checkOutTurno(id: number): Promise<ApiResult<TurnoItem>> {
  return authRequest<TurnoItem>(`/turnos/${id}/check-out`, {
    method: "PATCH",
    headers: { ...PLATFORM_HEADER },
  });
}

export function assignTurno(
  id: number,
  body: { guiaId: string }
): Promise<ApiResult<TurnoItem>> {
  return authRequest<TurnoItem>(`/turnos/${id}/assign`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function unassignTurno(
  id: number,
  body: { reason?: string } = {}
): Promise<ApiResult<TurnoItem>> {
  return authRequest<TurnoItem>(`/turnos/${id}/unassign`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function cancelTurno(
  id: number,
  body: { cancelReason?: string } = {}
): Promise<ApiResult<TurnoItem>> {
  return authRequest<TurnoItem>(`/turnos/${id}/cancel`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function noShowTurno(
  id: number,
  body: { reason?: string } = {}
): Promise<ApiResult<TurnoItem>> {
  return authRequest<TurnoItem>(`/turnos/${id}/no-show`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}
