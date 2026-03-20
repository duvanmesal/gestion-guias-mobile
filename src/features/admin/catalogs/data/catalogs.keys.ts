import type {
  ListBuquesParams,
  ListPaisesParams,
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
};