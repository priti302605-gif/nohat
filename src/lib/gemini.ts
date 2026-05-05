import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateImage(prompt: string, size: "512px" | "1K" | "2K" | "4K" = "1K") {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export async function improvePrompt(originalPrompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve this image generation prompt to make it more professional, detailed, and high-quality: "${originalPrompt}". Output only the improved prompt text.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error improving prompt:", error);
    return originalPrompt;
  }
}
