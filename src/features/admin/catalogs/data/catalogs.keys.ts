import type {
  ListBuquesParams,
  ListMuellesParams,
  ListPaisesParams,
  ListPuertosParams,
} from "../types/catalogs.types";

export const catalogsKeys = {
  all: ["admin", "catalogs"] as const,
  paises: {
    all: ["admin", "catalogs", "paises"] as const,
    lists: () => ["admin", "catalogs", "paises", "list"] as const,
    list: (params: ListPaisesParams) =>
      ["admin", "catalogs", "paises", "list", params] as const,
    details: () => ["admin", "catalogs", "paises", "detail"] as const,
    detail: (id: number) =>
      ["admin", "catalogs", "paises", "detail", id] as const,
    lookup: () => ["admin", "catalogs", "paises", "lookup"] as const,
  },
  buques: {
    all: ["admin", "catalogs", "buques"] as const,
    lists: () => ["admin", "catalogs", "buques", "list"] as const,
    list: (params: ListBuquesParams) =>
      ["admin", "catalogs", "buques", "list", params] as const,
    details: () => ["admin", "catalogs", "buques", "detail"] as const,
    detail: (id: number) =>
      ["admin", "catalogs", "buques", "detail", id] as const,
    lookup: () => ["admin", "catalogs", "buques", "lookup"] as const,
  },
  puertos: {
    all: ["admin", "catalogs", "puertos"] as const,
    lists: () => ["admin", "catalogs", "puertos", "list"] as const,
    list: (params: ListPuertosParams) =>
      ["admin", "catalogs", "puertos", "list", params] as const,
    details: () => ["admin", "catalogs", "puertos", "detail"] as const,
    detail: (id: number) =>
      ["admin", "catalogs", "puertos", "detail", id] as const,
    lookup: () => ["admin", "catalogs", "puertos", "lookup"] as const,
  },
  muelles: {
    all: ["admin", "catalogs", "muelles"] as const,
    lists: () => ["admin", "catalogs", "muelles", "list"] as const,
    list: (params: ListMuellesParams) =>
      ["admin", "catalogs", "muelles", "list", params] as const,
    details: () => ["admin", "catalogs", "muelles", "detail"] as const,
    detail: (id: number) =>
      ["admin", "catalogs", "muelles", "detail", id] as const,
    lookup: (puertoId?: number) =>
      ["admin", "catalogs", "muelles", "lookup", puertoId ?? "all"] as const,
  },
};
