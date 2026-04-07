import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getRouteInfo(origin: string, destination: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `What is the driving distance and estimated time between ${origin} and ${destination} in the Dominican Republic? Are there any major highways connecting them?`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    return {
      text: response.text,
      chunks:
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  } catch (error) {
    console.error("Error fetching route info:", error);
    return null;
  }
}
