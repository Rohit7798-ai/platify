// ──────────────────────────────────────────────
// Plants Service — Optimized for NVIDIA NIM
// ──────────────────────────────────────────────

import OpenAI from 'openai';
import { config } from '../../config/env.config.js';
import { InternalError } from '../../common/errors/AppError.js';
import { compressImageBuffer, stripDataUriPrefix } from '../../common/utils/image.utils.js';
import { scanPipeline } from './scan.pipeline.js';

// NVIDIA Client (OpenAI-compatible)
const nvClient = new OpenAI({
  apiKey: config.nvidiaApiKey,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

class PlantsService {
  /**
   * Helper to clean up any conversational fluff or markdown code fences 
   * and parse only the JSON block from the AI's output.
   */
  private cleanAndParseJson(text: string): any {
    let cleaned = text.replace(/```json|```/g, '').trim();
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
      throw new Error('No JSON object found in AI response');
    }
    
    cleaned = cleaned.substring(startIdx, endIdx + 1);
    
    // Remove single line comments
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    
    return JSON.parse(cleaned);
  }

  /**
   * Main scan entry point — optimized for NVIDIA NIM.
   */
  async scan(imageBuffer: Buffer, mode: 'identify' | 'diagnose' | 'both' = 'both') {
    const hash = scanPipeline.generateHash(imageBuffer);
    
    return scanPipeline.execute(hash, async () => {
      const base64 = await compressImageBuffer(imageBuffer, 1024, 80);
      return this.callNvidia(base64, mode);
    });
  }

  /**
   * Streams the scanning process via an async generator using NVIDIA NIM Streaming.
   */
  async *scanStream(imageBuffer: Buffer, mode: 'identify' | 'diagnose' | 'both' = 'both') {
    yield { type: 'status', message: 'Optimizing image for NVIDIA NIM...' };
    
    const hash = scanPipeline.generateHash(imageBuffer);
    const cached = scanPipeline.getCached(hash);
    if (cached) {
      yield { type: 'status', message: 'Analyzing with NVIDIA AI...' };
      yield { type: 'status', message: 'Retrieving cached analysis...' };
      yield { type: 'result', data: cached };
      return;
    }
    
    const base64 = await compressImageBuffer(imageBuffer, 1024, 80);
    const prompt = this.getPrompt(mode);
    
    yield { type: 'status', message: 'Analyzing with NVIDIA AI...' };

    try {
      const stream = await nvClient.chat.completions.create({
        model: 'meta/llama-3.2-11b-vision-instruct',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert botanist and plant pathologist. You must respond ONLY with a raw JSON object. Do NOT wrap it in markdown codeblocks. Do NOT include any introductory or concluding text. Start your response directly with the opening curly brace \'{\'.' 
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
            ],
          },
        ],
        stream: true,
        temperature: 0.1,
        max_tokens: 800,
      });

      let fullText = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullText += content;
        if (content) {
          yield { type: 'chunk', data: content };
        }
      }

      // Final Cleanup and Parse using the robust parser
      try {
        const finalData = this.cleanAndParseJson(fullText);
        // Persist the result in the cache
        scanPipeline.setCache(hash, finalData);
        yield { type: 'result', data: finalData };
      } catch (parseError: any) {
        console.error('[PlantsService] JSON Parse Error:', parseError, fullText);
        throw new InternalError('Failed to parse AI response.');
      }
    } catch (error: any) {
      console.error('[PlantsService] NVIDIA Stream Error:', error);
      yield { type: 'error', message: 'NVIDIA AI analysis failed. Please check your API key.' };
    }
  }

  // ─── Legacy Compatibility ───────────────────

  async identifyFromBuffer(imageBuffer: Buffer) {
    return this.scan(imageBuffer, 'identify');
  }

  async diagnoseFromBuffer(imageBuffer: Buffer) {
    return this.scan(imageBuffer, 'diagnose');
  }

  async identifyFromBase64(base64Image: string) {
    const base64Data = stripDataUriPrefix(base64Image);
    const buffer = Buffer.from(base64Data, 'base64');
    return this.scan(buffer, 'identify');
  }

  async diagnoseFromBase64(base64Image: string) {
    const base64Data = stripDataUriPrefix(base64Image);
    const buffer = Buffer.from(base64Data, 'base64');
    return this.scan(buffer, 'diagnose');
  }

  async searchPlants(query: string) {
    const database = [
      { id: 'db1', name: 'Aloe Vera', type: 'Succulent', img: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=300&q=80' },
      { id: 'db2', name: 'Peace Lily', type: 'Indoor', img: 'https://images.unsplash.com/photo-1713539768904-22a1950e194d?w=300&q=80' },
      { id: 'db3', name: 'Spider Plant', type: 'Pet Safe', img: 'https://images.unsplash.com/photo-1706544376082-1cbfbdcc2fec?w=300&q=80' },
      { id: 'db4', name: 'Rubber Plant', type: 'Indoor', img: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=300&q=80' },
    ];
    if (!query) return database;
    return database.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }

  // ─── Private Helpers ──────────────────────────

  private async callNvidia(base64Data: string, mode: 'identify' | 'diagnose' | 'both') {
    const prompt = this.getPrompt(mode);

    try {
      const response = await nvClient.chat.completions.create({
        model: 'meta/llama-3.2-11b-vision-instruct',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert botanist and plant pathologist. You must respond ONLY with a raw JSON object. Do NOT wrap it in markdown codeblocks. Do NOT include any introductory or concluding text. Start your response directly with the opening curly brace \'{\'.' 
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new InternalError('No data from NVIDIA AI.');
      return this.cleanAndParseJson(content);
    } catch (error: any) {
      console.error(`NVIDIA Scan Error:`, error);
      throw new InternalError('NVIDIA AI failed to analyze plant.');
    }
  }

  private getPrompt(mode: string): string {
    const identifyFields = `
      "commonName": string,
      "scientificName": string,
      "speciesClassification": { "kingdom": string, "family": string, "genus": string, "species": string },
      "description": string (strictly under 2 sentences),
      "careInstructions": { 
        "light": string (strictly under 1 sentence), 
        "water": string (strictly under 1 sentence), 
        "soil": string (strictly under 1 sentence), 
        "fertilizer": string (strictly under 1 sentence),
        "growthConditions": string (strictly under 1 sentence)
      },
      "funFact": string (strictly under 1 sentence),
      "isToxic": boolean,
      "toxicityDetails": string (strictly under 1 sentence, explaining toxicity to humans and pets like cats/dogs),
      "medicinalOrAgriculturalUses": string (strictly under 1 sentence),
      "matchScore": number (0-100),
      "confidenceScore": number (0-100),
      "similarPlants": [{ "name": string, "imageAlt": string }],
      "lowConfidenceDetails": {
        "possibleMatches": [{ "commonName": string, "scientificName": string, "probability": number }],
        "suggestions": string[]
      } | null`;

    const diagnoseFields = `
      "healthAssessment": {
        "isHealthy": boolean,
        "diagnosis": string,
        "symptoms": string[],
        "causes": string[],
        "treatment": string[],
        "prevention": string[]
      }`;

    let structure = '';
    if (mode === 'identify') structure = `{ ${identifyFields} }`;
    else structure = `{ ${identifyFields}, ${diagnoseFields} }`;

    return `Analyze this plant image. Evaluate the image quality for low light, blurriness, extreme crop/angles, complex background noise, or partial leaf/stem visibility. Calculate a "confidenceScore" between 0 and 100 based on this assessment. If the image is blurry, low-light, has a complex background, or only has partial visibility, reduce the score below 65. Set "matchScore" to the exact same value as "confidenceScore" for backward compatibility.
    
    If the calculated "confidenceScore" is below 65:
    - You MUST populate the "lowConfidenceDetails" object. Provide the top 3 possible alternative plant species matches under "possibleMatches" (with probability percentages summing to at most the remaining probability), and at least 3 custom actionable suggestions for capturing a clearer image under "suggestions" (e.g. "Focus on a single leaf", "Wipe the camera lens to remove smudge-induced blur", "Improve ambient lighting").
    If the "confidenceScore" is 65 or higher:
    - Set "lowConfidenceDetails" to null.

    Return a JSON object with the following structure: ${structure}. 
    Be extremely specific. Do NOT return generic categories (like "cactus", "fern", "succulent", "palm", "tree" or "indoor plant") as the commonName unless it is impossible to determine the exact species. Always identify the exact species and variety level (e.g., "Saguaro Cactus", "Golden Barrel Cactus", "Boston Fern", "Aloe Vera", "Fiddle Leaf Fig", "Monstera Deliciosa", etc.).
    Be extremely accurate. Keep all descriptions and text values strictly under 1-2 short sentences to maximize response speed. If the image is completely unrelated to a plant, return: { "error": "Not a plant" }.`;
  }
}

export const plantsService = new PlantsService();
