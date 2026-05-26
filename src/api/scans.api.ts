// ──────────────────────────────────────────────
// Scans API + Tools API
// ──────────────────────────────────────────────

import { apiClient, extractData } from './client';

export const scansApi = {
  async getAll(page = 1, limit = 20) {
    const res = await apiClient.get('/scans', { params: { page, limit } });
    return res.data;
  },

  async getRecent() {
    const res = await apiClient.get('/scans/recent');
    const data = extractData<any[]>(res);
    return data.map(item => ({
      ...item,
      image: item.image_url,
      scientificName: item.scientific_name,
    }));
  },

  async save(scan: {
    name: string;
    scientificName: string;
    imageUrl: string;
    type: string;
    data: Record<string, unknown>;
  }) {
    const res = await apiClient.post('/scans', scan);
    return extractData(res);
  },
};

export const toolsApi = {
  async waterCalculator(plantType: string, potSize: number, season: string) {
    const res = await apiClient.post('/tools/water-calculator', { plantType, potSize, season });
    return extractData<{ frequency: string; amount: string }>(res);
  },
};
