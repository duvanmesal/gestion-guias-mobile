import type { RecaladaOperationalStatus } from "./types/recaladas.types";

export const RECALADA_STATUS_COPY: Record<
  RecaladaOperationalStatus,
  { singular: string; plural: string }
> = {
  SCHEDULED: { singular: "Programada", plural: "Programadas" },
  ARRIVED: { singular: "Llegada", plural: "Llegadas" },
  DEPARTED: { singular: "Zarpada", plural: "Zarpadas" },
  CANCELED: { singular: "Cancelada", plural: "Canceladas" },
};
