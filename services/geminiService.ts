
import { GoogleGenAI } from "@google/genai";

export async function editImage(
  base64Data: string, 
  mimeType: string, 
  prompt: string, 
  aspectRatio: string = "1:1"
): Promise<string> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("MISSING_ENV_KEY");
  }

const ai = new GoogleGenAI({ apiKey: "AIzaSyDKvsz8eJ8L7wdFoRGxqyGX4dZ4KD4o2fo" });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any
        }
      }
    });

    let generatedImageUrl = '';
    
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error("No image data returned from Gemini API");
    }

    return generatedImageUrl;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
}
