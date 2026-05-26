import { apiClient, extractData } from './client';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const plantsApi = {
  /**
   * Unified scan endpoint.
   */
  async scan(image: File | string, mode: 'identify' | 'diagnose' | 'both' = 'both') {
    if (image instanceof File) {
      const formData = new FormData();
      formData.append('image', image);
      const res = await apiClient.post(`/plants/scan?mode=${mode}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      return extractData<{ plantData: any }>(res);
    } else {
      const res = await apiClient.post(`/plants/scan?mode=${mode}`, { imageBase64: image }, {
        timeout: 120000,
      });
      return extractData<{ plantData: any }>(res);
    }
  },

  /**
   * SSE Stream version of scan.
   * Calls the callback with status updates and the final result.
   */
  async scanStream(
    image: File | string, 
    onEvent: (event: { type: 'status' | 'chunk' | 'result' | 'error', message?: string, data?: any }) => void,
    mode: 'identify' | 'diagnose' | 'both' = 'both'
  ) {
    const token = localStorage.getItem('plantify_access_token');
    const url = `${API_BASE}/plants/scan?stream=true&mode=${mode}`;
    
    let body: any;
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };

    if (image instanceof File) {
      body = new FormData();
      body.append('image', image);
      // Don't set Content-Type, fetch will set it for FormData
    } else {
      body = JSON.stringify({ imageBase64: image });
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) throw new Error('Scan failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              onEvent(data);
            } catch (e) {
              console.error('Failed to parse SSE data', e);
            }
          }
        }
      }
    } catch (error: any) {
      onEvent({ type: 'error', message: error.message });
    }
  },

  async identify(imageFile: File) {
    return this.scan(imageFile, 'identify');
  },

  async identifyBase64(imageBase64: string) {
    return this.scan(imageBase64, 'identify');
  },

  async diagnose(imageFile: File) {
    return this.scan(imageFile, 'diagnose');
  },

  async diagnoseBase64(imageBase64: string) {
    return this.scan(imageBase64, 'diagnose');
  },

  async search(query: string) {
    const res = await apiClient.get('/plants/search', { params: { q: query } });
    return extractData<any[]>(res);
  },
};
