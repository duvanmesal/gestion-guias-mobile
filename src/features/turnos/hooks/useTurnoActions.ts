import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as turnosApi from "../data/turnos.api";
import { turnosKeys } from "../data/turnos.keys";

function useInvalidate() {
  const queryClient = useQueryClient();
  return async (id?: number) => {
    await queryClient.invalidateQueries({ queryKey: turnosKeys.all });
    if (typeof id === "number") {
      await queryClient.invalidateQueries({ queryKey: turnosKeys.detail(id) });
    }
  };
}

export function useClaimTurno() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await turnosApi.claimTurno(id);
      if (!res.ok)
        throw new Error(getErrorMessage(res.error, "No pude tomar el turno"));
      return res.data;
    },
    onSuccess: async (_data, id) => invalidate(id),
  });
}

export function useCheckInTurno() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await turnosApi.checkInTurno(id);
      if (!res.ok)
        throw new Error(getErrorMessage(res.error, "No pude hacer check-in"));
      return res.data;
    },
    onSuccess: async (_data, id) => invalidate(id),
  });
}

export function useCheckOutTurno() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await turnosApi.checkOutTurno(id);
      if (!res.ok)
        throw new Error(getErrorMessage(res.error, "No pude hacer check-out"));
      return res.data;
    },
    onSuccess: async (_data, id) => invalidate(id),
  });
}

export function useAssignTurno() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (args: { id: number; guiaId: string }) => {
      const res = await turnosApi.assignTurno(args.id, { guiaId: args.guiaId });
      if (!res.ok)
        throw new Error(getErrorMessage(res.error, "No pude asignar el turno"));
      return res.data;
    },
    onSuccess: async (_data, args) => invalidate(args.id),
  });
}

export function useUnassignTurno() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (args: { id: number; reason?: string }) => {
      const res = await turnosApi.unassignTurno(args.id, { reason: args.reason });
      if (!res.ok)
        throw new Error(
          getErrorMessage(res.error, "No pude desasignar el turno")
        );
      return res.data;
    },
    onSuccess: async (_data, args) => invalidate(args.id),
  });
}

export function useCancelTurno() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (args: { id: number; cancelReason?: string }) => {
      const res = await turnosApi.cancelTurno(args.id, {
        cancelReason: args.cancelReason,
      });
      if (!res.ok)
        throw new Error(getErrorMessage(res.error, "No pude cancelar el turno"));
      return res.data;
    },
    onSuccess: async (_data, args) => invalidate(args.id),
  });
}

export function useNoShowTurno() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (args: { id: number; reason?: string }) => {
      const res = await turnosApi.noShowTurno(args.id, { reason: args.reason });
      if (!res.ok)
        throw new Error(getErrorMessage(res.error, "No pude marcar no-show"));
      return res.data;
    },
    onSuccess: async (_data, args) => invalidate(args.id),
  });
}
