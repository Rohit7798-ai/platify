// ──────────────────────────────────────────────
// Chat Service — NVIDIA NIM-powered Flora AI assistant
// Moved from frontend AssistantView.tsx
// ──────────────────────────────────────────────

import OpenAI from 'openai';
import { config } from '../../config/env.config.js';
import { InternalError } from '../../common/errors/AppError.js';
import { stripDataUriPrefix, compressImageBuffer } from '../../common/utils/image.utils.js';

const nvClient = new OpenAI({
  apiKey: config.nvidiaApiKey,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const SYSTEM_PROMPT = `You are Flora, an expert virtual botanist and plant care assistant. Your knowledge spans:
- Plant identification and classification
- Detailed care instructions (watering, sunlight, soil, fertilizing)
- Diagnosing plant diseases, deficiencies, and pest infestations
- Propagation techniques
- Indoor and outdoor gardening best practices

Guidelines:
1. Be friendly, enthusiastic and encouraging.
2. Use scientific names alongside common names when relevant.
3. Give specific, actionable advice.
4. If an image is provided, analyze it thoroughly.
5. Keep responses concise but thorough (200-400 words max).
6. Use plant emojis naturally.
7. If you're uncertain, say so and suggest consulting a local nursery.`;

// In-memory session store
const sessions = new Map<string, Array<{ role: 'user' | 'assistant' | 'system'; content: any }>>();

class ChatService {
  async sendMessage(userId: string, sessionId: string | null, message: string, imageBase64?: string) {
    const sid = sessionId || `${userId}_${Date.now()}`;

    // Get or create session history
    if (!sessions.has(sid)) {
      sessions.set(sid, []);
    }
    const history = sessions.get(sid)!;

    try {
      // Build current user message
      let userContent: any = message;
      if (imageBase64) {
        const data = stripDataUriPrefix(imageBase64);
        const buffer = Buffer.from(data, 'base64');
        const compressed = await compressImageBuffer(buffer, 800, 70); // Chat needs less res
        userContent = [
          { type: 'text', text: message },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${compressed}` },
          },
        ];
      }

      // Call NVIDIA NIM
      const response = await nvClient.chat.completions.create({
        model: 'meta/llama-3.2-11b-vision-instruct',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: userContent },
        ],
      });

      const reply = response.choices[0]?.message?.content || "Flora is having trouble finding the words. Please try again.";

      // Update session history (keep last 10 exchanges = 20 messages + system)
      history.push(
        { role: 'user', content: userContent },
        { role: 'assistant', content: reply }
      );
      
      if (history.length > 20) {
        sessions.set(sid, history.slice(-20));
      }

      return { reply, sessionId: sid };
    } catch (error: any) {
      console.error('NVIDIA Chat error:', error);
      throw new InternalError('Flora is having trouble responding via NVIDIA AI. Please try again.');
    }
  }

  clearSession(sessionId: string) {
    sessions.delete(sessionId);
  }
}

export const chatService = new ChatService();
