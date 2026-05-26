// ──────────────────────────────────────────────
// Collection API — replaces direct Supabase CRUD
// ──────────────────────────────────────────────

import { apiClient, extractData } from './client';

export const collectionApi = {
  async getAll(page = 1, limit = 20, search?: string) {
    const params: Record<string, unknown> = { page, limit };
    if (search) params.search = search;

    const res = await apiClient.get('/collection', { params });
    return res.data; // includes meta for pagination
  },

  async getById(id: string) {
    const res = await apiClient.get(`/collection/${id}`);
    return extractData(res);
  },

  async add(plant: {
    name: string;
    scientificName: string;
    image: string;
    tags: string[];
    data: Record<string, unknown>;
  }) {
    const res = await apiClient.post('/collection', plant);
    return extractData(res);
  },

  async update(id: string, updates: Record<string, unknown>) {
    const res = await apiClient.put(`/collection/${id}`, updates);
    return extractData(res);
  },

  async remove(id: string) {
    await apiClient.delete(`/collection/${id}`);
  },
};
