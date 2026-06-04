import {
  authRequest,
  authRequestEnvelope,
} from "../../../../core/http/authInterceptor";
import type {
  ApiEnvelopeResult,
  ApiResult,
} from "../../../../core/http/types";
import type {
  CatalogPaginationMeta,
  ListMuellesParams,
  MuelleDetail,
  MuelleListItem,
  MuelleLookupItem,
  UpsertMuellePayload,
} from "../types/catalogs.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

function buildSearch(params: ListMuellesParams = {}) {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  if (typeof params.puertoId === "number" && Number.isFinite(params.puertoId)) {
    search.set("puertoId", String(params.puertoId));
  }
  if (params.status) search.set("status", params.status);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));

  return search.toString();
}

export function getMuelles(
  params: ListMuellesParams = {},
  signal?: AbortSignal
): Promise<ApiEnvelopeResult<MuelleListItem[], CatalogPaginationMeta>> {
  const query = buildSearch(params);

  return authRequestEnvelope<MuelleListItem[], CatalogPaginationMeta>(
    `/muelles${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: { ...PLATFORM_HEADER },
      signal,
    }
  );
}

export function getMuelleById(
  id: number,
  signal?: AbortSignal
): Promise<ApiResult<MuelleDetail>> {
  return authRequest<MuelleDetail>(`/muelles/${id}`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function createMuelle(
  body: UpsertMuellePayload
): Promise<ApiResult<MuelleDetail>> {
  return authRequest<MuelleDetail>("/muelles", {
    method: "POST",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function updateMuelle(
  id: number,
  body: Partial<UpsertMuellePayload>
): Promise<ApiResult<MuelleDetail>> {
  return authRequest<MuelleDetail>(`/muelles/${id}`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function deleteMuelle(id: number): Promise<ApiResult<void>> {
  return authRequest<void>(`/muelles/${id}`, {
    method: "DELETE",
    headers: { ...PLATFORM_HEADER },
  });
}

export function getMuellesLookup(
  puertoId?: number,
  signal?: AbortSignal
): Promise<ApiResult<MuelleLookupItem[]>> {
  const search = new URLSearchParams();
  if (typeof puertoId === "number" && Number.isFinite(puertoId)) {
    search.set("puertoId", String(puertoId));
  }
  const query = search.toString();

  return authRequest<MuelleLookupItem[]>(
    `/muelles/lookup${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: { ...PLATFORM_HEADER },
      signal,
    }
  );
}
