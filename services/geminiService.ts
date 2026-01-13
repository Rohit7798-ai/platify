
import { GoogleGenAI, Type } from "@google/genai";
import { PlantData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PLANT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    commonName: { type: Type.STRING, description: "The common everyday name of the plant." },
    scientificName: { type: Type.STRING, description: "The scientific Latin name of the plant." },
    description: { type: Type.STRING, description: "A concise description of the plant's appearance and origin." },
    careInstructions: {
      type: Type.OBJECT,
      properties: {
        light: { type: Type.STRING, description: "Light requirements (e.g., Bright indirect)." },
        water: { type: Type.STRING, description: "Watering schedule (e.g., Every 1-2 weeks)." },
        soil: { type: Type.STRING, description: "Preferred soil type (e.g., Peat-based)." },
        fertilizer: { type: Type.STRING, description: "Fertilizer needs (e.g., Monthly)." },
      },
      required: ["light", "water", "soil", "fertilizer"],
    },
    funFact: { type: Type.STRING, description: "An interesting or unique fact about this plant." },
    isToxic: { type: Type.BOOLEAN, description: "Whether the plant is toxic to pets or humans." },
    matchScore: { type: Type.NUMBER, description: "Confidence score of the identification from 0 to 100." },
    similarPlants: {
      type: Type.ARRAY,
      description: "List of 3 related or similar plant species.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the similar plant." },
          imageAlt: { type: Type.STRING, description: "Short visual description of this similar plant." }
        },
        required: ["name", "imageAlt"]
      }
    }
  },
  required: ["commonName", "scientificName", "description", "careInstructions", "funFact", "isToxic", "matchScore", "similarPlants"],
};

const DIAGNOSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    commonName: { type: Type.STRING, description: "The name of the plant." },
    scientificName: { type: Type.STRING, description: "The scientific name." },
    description: { type: Type.STRING, description: "Brief description of the plant." },
    // Include basic care even for diagnosis as context
    careInstructions: {
      type: Type.OBJECT,
      properties: {
        light: { type: Type.STRING },
        water: { type: Type.STRING },
        soil: { type: Type.STRING },
        fertilizer: { type: Type.STRING },
      },
      required: ["light", "water", "soil", "fertilizer"],
    },
    funFact: { type: Type.STRING, description: "A brief interesting fact." },
    isToxic: { type: Type.BOOLEAN },
    matchScore: { type: Type.NUMBER },
    similarPlants: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, imageAlt: { type: Type.STRING } } } },

    // Health specific fields
    healthAssessment: {
      type: Type.OBJECT,
      properties: {
        isHealthy: { type: Type.BOOLEAN, description: "True if the plant looks healthy, false if it shows signs of disease/pests." },
        diagnosis: { type: Type.STRING, description: "Name of the disease, pest, or deficiency. Use 'Healthy' if no issues found." },
        symptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of visible symptoms (e.g., yellow leaves, spots)." },
        causes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Possible causes (e.g., overwatering, fungi)." },
        treatment: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step treatment instructions." },
        prevention: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tips to prevent future recurrence." },
      },
      required: ["isHealthy", "diagnosis", "symptoms", "causes", "treatment", "prevention"]
    }
  },
  required: ["commonName", "healthAssessment"]
};

export async function identifyPlant(base64Image: string): Promise<PlantData> {
  const base64Data = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: "Identify this plant accurately. Return JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: PLANT_SCHEMA,
        systemInstruction: "You are an expert botanist. Identify plants accurately from images and provide helpful care tips.",
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini.");

    return JSON.parse(text) as PlantData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to identify the plant. Please try again with a clearer image.");
  }
}

export async function diagnosePlant(base64Image: string): Promise<PlantData> {
  const base64Data = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: "Analyze this plant for diseases, pests, or deficiencies. Diagnose the issue and provide treatment. Return JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: DIAGNOSIS_SCHEMA,
        systemInstruction: "You are an expert plant pathologist. Diagnose plant health issues accurately. If the plant is healthy, state so. If sick, explain symptoms, causes, and treatments clearly.",
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini.");

    return JSON.parse(text) as PlantData;

  } catch (error) {
    console.error("Gemini Diagnosis Error:", error);
    throw new Error("Failed to diagnose the plant. Please try again with a clearer image.");
  }
}

export async function askBotanist(message: string, image?: string, context?: string): Promise<string> {
  try {
    const systemInstruction = "You are 'Flora', an intelligent AI Botanist Assistant. Your goal is to help users with plant care, disease identification, pest control, and gardening tips. Be friendly, concise, and helpful. Use emojis occasionally. If the user asks about a specific plant they recently identified, use the provided context to give a personalized answer. Format your response with clear paragraphs or bullet points if needed.";

    let fullMessage = message;
    if (context) {
      fullMessage = `[Context about my plant: ${context}]\n\nUser Question: ${message}`;
    }

    // If there is an image, we must use generateContent to pass the image part
    if (image) {
      const base64Data = image.split(',')[1] || image;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            },
            { text: fullMessage }
          ]
        },
        config: {
          systemInstruction: systemInstruction,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text || "I couldn't analyze the image, but I can try to help based on your description.";
    }

    // Text-only request
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const result = await chat.sendMessage({ message: fullMessage });
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("I'm having trouble connecting to the botanical database. Please try again.");
  }
}
