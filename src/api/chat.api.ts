// ──────────────────────────────────────────────
// Chat API — replaces direct Gemini chat calls
// ──────────────────────────────────────────────

import { apiClient, extractData } from './client';

interface ChatResponse {
  reply: string;
  sessionId: string;
}

export const chatApi = {
  async sendMessage(message: string, sessionId?: string, imageBase64?: string) {
    const res = await apiClient.post('/chat/message', {
      message,
      sessionId,
      imageBase64,
    }, {
      timeout: 60000,
    });
    return extractData<ChatResponse>(res);
  },

  async clearSession(sessionId: string) {
    await apiClient.delete(`/chat/sessions/${sessionId}`);
  },
};
