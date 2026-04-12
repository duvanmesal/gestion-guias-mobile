import type { ListAtencionesParams } from "../types/atenciones.types";

export const atencionesKeys = {
  all: ["atenciones"] as const,
  lists: () => [...atencionesKeys.all, "list"] as const,
  list: (params: ListAtencionesParams) =>
    [...atencionesKeys.all, "list", params] as const,
  details: () => [...atencionesKeys.all, "detail"] as const,
  detail: (id: number) => [...atencionesKeys.all, "detail", id] as const,
  turnos: (id: number) => [...atencionesKeys.all, "turnos", id] as const,
  summary: (id: number) => [...atencionesKeys.all, "summary", id] as const,
};
