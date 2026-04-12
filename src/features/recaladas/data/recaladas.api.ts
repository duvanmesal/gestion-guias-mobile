import {
  authRequest,
  authRequestEnvelope,
} from "../../../core/http/authInterceptor";
import type {
  ApiEnvelopeResult,
  ApiResult,
} from "../../../core/http/types";
import type {
  CreateRecaladaPayload,
  ListRecaladasParams,
  RecaladaAtencionItem,
  RecaladaItem,
  RecaladaListMeta,
  UpdateRecaladaPayload,
} from "../types/recaladas.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

function buildListSearch(params: ListRecaladasParams): string {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.operationalStatus)
    search.set("operationalStatus", params.operationalStatus);
  if (typeof params.buqueId === "number")
    search.set("buqueId", String(params.buqueId));
  if (typeof params.paisOrigenId === "number")
    search.set("paisOrigenId", String(params.paisOrigenId));
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 20));
  return search.toString();
}

export function getRecaladas(
  params: ListRecaladasParams = {},
  signal?: AbortSignal
): Promise<ApiEnvelopeResult<RecaladaItem[], RecaladaListMeta>> {
  const query = buildListSearch(params);
  return authRequestEnvelope<RecaladaItem[], RecaladaListMeta>(
    `/recaladas${query ? `?${query}` : ""}`,
    { method: "GET", headers: { ...PLATFORM_HEADER }, signal }
  );
}

export function getRecaladaById(
  id: number,
  signal?: AbortSignal
): Promise<ApiResult<RecaladaItem>> {
  return authRequest<RecaladaItem>(`/recaladas/${id}`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function getRecaladaAtenciones(
  id: number,
  signal?: AbortSignal
): Promise<ApiResult<RecaladaAtencionItem[]>> {
  return authRequest<RecaladaAtencionItem[]>(`/recaladas/${id}/atenciones`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function createRecalada(
  body: CreateRecaladaPayload
): Promise<ApiResult<RecaladaItem>> {
  return authRequest<RecaladaItem>("/recaladas", {
    method: "POST",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function updateRecalada(
  id: number,
  body: UpdateRecaladaPayload
): Promise<ApiResult<RecaladaItem>> {
  return authRequest<RecaladaItem>(`/recaladas/${id}`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function arriveRecalada(
  id: number,
  body: { arrivedAt?: string }
): Promise<ApiResult<RecaladaItem>> {
  return authRequest<RecaladaItem>(`/recaladas/${id}/arrive`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function departRecalada(
  id: number,
  body: { departedAt?: string }
): Promise<ApiResult<RecaladaItem>> {
  return authRequest<RecaladaItem>(`/recaladas/${id}/depart`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function cancelRecalada(
  id: number,
  body: { reason?: string }
): Promise<ApiResult<RecaladaItem>> {
  return authRequest<RecaladaItem>(`/recaladas/${id}/cancel`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function deleteRecalada(
  id: number
): Promise<ApiResult<{ deleted: boolean; id: number }>> {
  return authRequest<{ deleted: boolean; id: number }>(`/recaladas/${id}`, {
    method: "DELETE",
    headers: { ...PLATFORM_HEADER },
  });
}
