import { GoogleGenAI, Modality, VideoGenerationReferenceImage, VideoGenerationReferenceType } from "@google/genai";
import { dataUrlToBase64 } from "../utils/fileUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class ApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiKeyError';
  }
}

/**
 * Redesigns a room image based on a selected style using the Gemini API.
 * @param base64Image The base64 encoded image string.
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg').
 * @param style The design style to apply.
 * @returns A promise that resolves to the base64 string of the redesigned image.
 */
export const redesignRoom = async (base64Image: string, mimeType: string, style: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // 'nano banana' model
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Redesign this room with a ${style} aesthetic. STRICT INSTRUCTIONS: 1. The architectural layout, including all walls, MUST remain UNCHANGED. Do NOT alter the room's structure. 2. If the image contains existing permanent fixtures like kitchen cabinets, kitchen islands, built-in shelving, windows, or doors, you MUST NOT change their style or color. They are to remain as they are in the original image. 3. Only modify movable furniture, wall color, floor covering, lighting, and decorative items to match the new ${style} style.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageData = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageData}`;
      }
    }
    
    throw new Error("No image was generated in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to redesign the room. Please check the console for more details.");
  }
};


/**
 * Generates a video tour from a series of room images.
 * @param images An array of data URLs for the images.
 * @returns A promise that resolves to an object URL for the generated video.
 */
export const generateVideoTour = async (images: string[]): Promise<string> => {
  const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const referenceImagesPayload: VideoGenerationReferenceImage[] = images.map(imgDataUrl => {
      const base64Data = dataUrlToBase64(imgDataUrl);
      const mimeType = imgDataUrl.substring(imgDataUrl.indexOf(':') + 1, imgDataUrl.indexOf(';'));
      return {
        image: {
          imageBytes: base64Data,
          mimeType: mimeType,
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      };
    }).slice(0, 3); // Veo model supports up to 3 reference images

    const prompt = 'Create a smooth, cinematic video tour of an apartment, transitioning through these rooms. Pan and zoom gently to give a sense of walking through the space.';

    let operation = await videoAi.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        referenceImages: referenceImagesPayload,
        resolution: '720p',
        aspectRatio: '16:9',
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await videoAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation succeeded but no download link was provided.");
    }

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error calling Veo API:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
      throw new ApiKeyError("API Key is invalid or missing permissions for the Veo API. Please select a valid key.");
    }
    throw new Error("Failed to generate video tour. Please check the console for details.");
  }
};