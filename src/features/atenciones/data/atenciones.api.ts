import {
  authRequest,
  authRequestEnvelope,
} from "../../../core/http/authInterceptor";
import type {
  ApiEnvelopeResult,
  ApiResult,
} from "../../../core/http/types";
import type {
  AtencionItem,
  AtencionListMeta,
  AtencionSummary,
  AtencionTurno,
  CreateAtencionPayload,
  ListAtencionesParams,
  UpdateAtencionPayload,
} from "../types/atenciones.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

function buildListSearch(params: ListAtencionesParams): string {
  const search = new URLSearchParams();
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (typeof params.recaladaId === "number")
    search.set("recaladaId", String(params.recaladaId));
  if (params.supervisorId) search.set("supervisorId", params.supervisorId);
  if (params.status) search.set("status", params.status);
  if (params.operationalStatus)
    search.set("operationalStatus", params.operationalStatus);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 20));
  return search.toString();
}

export function getAtenciones(
  params: ListAtencionesParams = {},
  signal?: AbortSignal
): Promise<ApiEnvelopeResult<AtencionItem[], AtencionListMeta>> {
  const query = buildListSearch(params);
  return authRequestEnvelope<AtencionItem[], AtencionListMeta>(
    `/atenciones${query ? `?${query}` : ""}`,
    { method: "GET", headers: { ...PLATFORM_HEADER }, signal }
  );
}

export function getAtencionById(
  id: number,
  signal?: AbortSignal
): Promise<ApiResult<AtencionItem>> {
  return authRequest<AtencionItem>(`/atenciones/${id}`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function getAtencionTurnos(
  id: number,
  signal?: AbortSignal
): Promise<ApiResult<AtencionTurno[]>> {
  return authRequest<AtencionTurno[]>(`/atenciones/${id}/turnos`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function getAtencionSummary(
  id: number,
  signal?: AbortSignal
): Promise<ApiResult<AtencionSummary>> {
  return authRequest<AtencionSummary>(`/atenciones/${id}/summary`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function claimAtencionTurno(
  id: number
): Promise<ApiResult<AtencionTurno>> {
  return authRequest<AtencionTurno>(`/atenciones/${id}/claim`, {
    method: "POST",
    headers: { ...PLATFORM_HEADER },
  });
}

export function createAtencion(
  body: CreateAtencionPayload
): Promise<ApiResult<AtencionItem>> {
  return authRequest<AtencionItem>("/atenciones", {
    method: "POST",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function updateAtencion(
  id: number,
  body: UpdateAtencionPayload
): Promise<ApiResult<AtencionItem>> {
  return authRequest<AtencionItem>(`/atenciones/${id}`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function cancelAtencion(
  id: number,
  body: { reason: string }
): Promise<ApiResult<AtencionItem>> {
  return authRequest<AtencionItem>(`/atenciones/${id}/cancel`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function closeAtencion(
  id: number
): Promise<ApiResult<AtencionItem>> {
  return authRequest<AtencionItem>(`/atenciones/${id}/close`, {
    method: "PATCH",
    headers: { ...PLATFORM_HEADER },
  });
}
