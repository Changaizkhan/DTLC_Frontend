import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../api/queryKeys';
import {
  createShipment,
  deleteShipment,
  fetchShipmentById,
  fetchShipments,
  updateShipment,
  updateShipmentStatus,
  updateShipmentCurrentLocation,
} from '../../services/shipmentService';

/**
 * @param {Record<string, unknown>} [params]
 */
export function useShipmentsList(params) {
  return useQuery({
    queryKey: queryKeys.shipments.list(params ?? {}),
    queryFn: () => fetchShipments(params),
  });
}

/**
 * @param {string | undefined} id
 */
export function useShipment(id) {
  return useQuery({
    queryKey: queryKeys.shipments.detail(id),
    queryFn: () => fetchShipmentById(/** @type {string} */ (id)),
    enabled: Boolean(id),
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateShipmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
    },
  });
}

export function useUpdateShipmentCurrentLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateShipmentCurrentLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
    },
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
    },
  });
}

export function useDeleteShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
    },
  });
}
