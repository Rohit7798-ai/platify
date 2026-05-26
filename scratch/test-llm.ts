import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('server/.env') });

const apiKey = process.env.NVIDIA_API_KEY;
if (!apiKey) {
  console.error("NVIDIA_API_KEY is not defined in server/.env");
  process.exit(1);
}

const nvClient = new OpenAI({
  apiKey,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// A tiny 1x1 green pixel base64 image
const base64Image = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

const prompt = `Analyze this plant image. Return a JSON object with the following structure: {
  "commonName": string,
  "scientificName": string,
  "description": string (strictly under 2 sentences),
  "careInstructions": { "light": string, "water": string, "soil": string, "fertilizer": string },
  "funFact": string,
  "isToxic": boolean,
  "matchScore": number,
  "similarPlants": [{ "name": string, "imageAlt": string }]
}. Be extremely accurate. Keep descriptions strictly under 1-2 short sentences. If not a plant, return: { "error": "Not a plant" }.`;

async function testModel(modelName: string) {
  console.log(`\nTesting model: ${modelName}...`);
  const start = Date.now();
  try {
    const response = await nvClient.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: 'You are an expert botanist and plant pathologist. Return ONLY a JSON object.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });
    const duration = (Date.now() - start) / 1000;
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    console.log(`Response content:`, response.choices[0]?.message?.content);
  } catch (error: any) {
    console.error(`Error with ${modelName}:`, error.message || error);
  }
}

async function main() {
  await testModel('nvidia/nemotron-nano-12b-v2-vl');
  await testModel('meta/llama-3.2-11b-vision-instruct');
}

main();
