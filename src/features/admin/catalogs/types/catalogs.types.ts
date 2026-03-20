export type CatalogStatus = "ACTIVO" | "INACTIVO";

export interface CatalogPaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaisListItem {
  id: number;
  codigo: string;
  nombre: string;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaisDetail extends PaisListItem {}

export interface PaisLookupItem {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ListPaisesParams {
  q?: string;
  codigo?: string;
  status?: CatalogStatus;
  page?: number;
  pageSize?: number;
}

export interface UpsertPaisPayload {
  codigo: string;
  nombre: string;
  status?: CatalogStatus;
}

export interface BuqueCountryRef {
  id: number;
  codigo: string;
  nombre?: string;
}

export interface BuqueListItem {
  id: number;
  codigo: string;
  nombre: string;
  status: CatalogStatus;
  capacidad: number | null;
  naviera: string | null;
  pais: BuqueCountryRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface BuqueDetail extends BuqueListItem {}

export interface BuqueLookupItem {
  id: number;
  codigo: string;
  nombre: string;
  pais: {
    id: number;
    codigo: string;
  } | null;
}

export interface ListBuquesParams {
  q?: string;
  paisId?: number;
  status?: CatalogStatus;
  page?: number;
  pageSize?: number;
}

export interface UpsertBuquePayload {
  codigo: string;
  nombre: string;
  paisId?: number;
  capacidad?: number | null;
  naviera?: string | null;
  status?: CatalogStatus;
}