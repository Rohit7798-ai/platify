// ──────────────────────────────────────────────
// React Query Hooks — data fetching with caching
// ──────────────────────────────────────────────

// NOTE: These hooks require @tanstack/react-query to be installed.
// For now, they provide a simple custom hook pattern that can be
// upgraded to React Query later for caching/dedup benefits.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plantsApi } from '../api/plants.api';
import { collectionApi } from '../api/collection.api';
import { chatApi } from '../api/chat.api';
import { scansApi, toolsApi } from '../api/scans.api';

// ─── Domain-specific hooks ───────────────────

export function useScan() {
  return useMutation({
    mutationFn: ({ image, mode }: { image: File | string, mode?: 'identify' | 'diagnose' | 'both' }) => 
      plantsApi.scan(image, mode),
  });
}

export function useIdentifyPlant() {
  return useMutation({
    mutationFn: (imageFile: File) => plantsApi.identify(imageFile),
  });
}

export function useIdentifyPlantBase64() {
  return useMutation({
    mutationFn: (base64: string) => plantsApi.identifyBase64(base64),
  });
}

export function useDiagnosePlant() {
  return useMutation({
    mutationFn: (imageFile: File) => plantsApi.diagnose(imageFile),
  });
}

export function useDiagnosePlantBase64() {
  return useMutation({
    mutationFn: (base64: string) => plantsApi.diagnoseBase64(base64),
  });
}

export function useSearchPlants() {
  return useMutation({
    mutationFn: (query: string) => plantsApi.search(query),
  });
}

export function useCollection(page?: number, search?: string) {
  return useQuery({
    queryKey: ['collection', page, search],
    queryFn: () => collectionApi.getAll(page, 20, search),
  });
}

export function usePlantDetail(id: string) {
  return useQuery({
    queryKey: ['plant', id],
    queryFn: () => collectionApi.getById(id),
    enabled: !!id,
  });
}

export function useAddToCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plant: Parameters<typeof collectionApi.add>[0]) => collectionApi.add(plant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] });
    },
  });
}

export function useRemoveFromCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] });
    },
  });
}

export function useChatMessage() {
  return useMutation({
    mutationFn: ({ message, sessionId, imageBase64 }: { message: string; sessionId?: string; imageBase64?: string }) => 
      chatApi.sendMessage(message, sessionId, imageBase64),
  });
}

export function useRecentScans() {
  return useQuery({
    queryKey: ['recentScans'],
    queryFn: () => scansApi.getRecent(),
  });
}

export function useWaterCalculator() {
  return useMutation({
    mutationFn: ({ plantType, potSize, season }: { plantType: string; potSize: number; season: string }) => 
      toolsApi.waterCalculator(plantType, potSize, season),
  });
}
