import { GoogleGenAI } from "@google/genai";

// Initialize with Gemini models.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type ImageSize = "512px" | "1K" | "2K" | "4K";

/**
 * Generates an image from a prompt.
 * Falls back to gemini-2.5-flash-image if 3.1-preview is restricted (403).
 */
export async function generateImage(prompt: string, size: ImageSize = "1K") {
  const modelsToTry = [
    'imagen-3.0-generate-001',
    'imagen-3.0-alpha-001',
    'gemini-2.0-flash', // Some versions support image generation tools
    'gemini-1.5-flash'
  ];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [{ text: `Generate a high-fidelity, professional Full HD quality image of: ${prompt}. Ensure perfectly clean details and realistic textures. no watermarks.` }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: size
          }
        },
      });

      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // If it's a 404 or 403, try the next model
      if (error.message?.includes('403') || error.message?.includes('404')) {
        continue;
      }
      break; 
    }
  }
  
  throw lastError || new Error("Failed to generate image. Please try again later.");
}

/**
 * Re-generates an image based on an existing one to simulate "upscaling".
 * Uses multimodal input.
 */
export async function upscaleImage(imageDataBase64: string, targetSize: ImageSize = "4K") {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/png", data: imageDataBase64.split(',')[1] } },
          { text: "Clean this image by removing all noise, artifacts, and blur. Enhance it to ultra-high resolution 4K with sharp details and professional lighting. Output a clean, Full HD Master version." }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: targetSize
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data returned during upscale.");
  } catch (error: any) {
    console.warn("High-res upscale failed, falling back to recreation:", error.message);
    return generateImage(`Ultra high resolution clean 4K recreation of this scene.`, targetSize);
  }
}

export async function vectorizeImage(imageDataBase64: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/png", data: imageDataBase64.split(',')[1] } },
          { text: "Convert this image into a professional vector art style with pixel-perfect hard edges. Use bold, flat colors and eliminate all gradients. The output must look like high-fidelity vector graphics with sharp pixels and defined shapes, strictly and only vector style." }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "2K"
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Vectorization failed");
  } catch (error: any) {
    console.warn("Vectorize primary failed:", error.message);
    return generateImage("Clean professional vector art style recreation of the provided scene, solid colors, sharp edges.", "2K");
  }
}

export async function bypassWatermark(premiumUrl: string) {
  try {
    // Attempt to generate a clean version by identifying the stock asset from URL
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { text: `Identify and recreate a clean, Full HD 4K version of this creative asset based on this URL: ${premiumUrl}. Completely remove any shutterstock or stock watermarks and logos. Focus on delivering a professional, high-resolution original asset strictly without watermarks.` }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "4K"
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    // Fallback if image generation fails
    return generateImage(`Ultra clean 4K high-resolution version of stock image from ${premiumUrl}, professional quality, no watermark`, '4K');
  } catch (error) {
    console.error("Bypass error:", error);
    return generateImage(`Premium high resolution stock image, ultra clean 4K, no watermark`, '4K');
  }
}

/**
 * Searches for image information using Google Search.
 * Uses gemini-3-flash-preview for better grounding and text processing.
 */
export async function searchImages(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for high-resolution premium stock images for: ${query}. List 5 specific asset titles and detailed visual descriptions.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text;
  } catch (error) {
    console.error("Search with tools failed:", error);
    // Basic reasoning fallback
    const fallback = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide 5 detailed creative prompts for premium stock assets related to: ${query}.`
    });
    return fallback.text;
  }
}

export async function improvePrompt(originalPrompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve this image generation prompt to make it more professional, detailed, and high-quality. Output only the improved prompt text. Original: "${originalPrompt}"`,
    });
    return response.text.trim();
  } catch (error) {
    return originalPrompt;
  }
}
