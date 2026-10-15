// This function generates an image description using the Gemini API

import { GoogleGenAI } from "@google/genai/node";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateImageDescription(imageBase64: string, mimeType: string) {
  const result = await gemini.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
        {inlineData: {mimeType, data: imageBase64}},
        {text: "Describe the image so that a person who has lost the item in the image can find it again. Small details are important as well as the overall context. 15 words max."}
    ],
  });

  return result.text;
}