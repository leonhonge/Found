import { GoogleGenAI, Type } from "@google/genai"; // Ensure Type is imported

import { ITEM_CATEGORIES } from "@/lib/item-categories";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export type GeneratedItemDetails = {
  category: string;
  description: string;
};

export async function generateImageDescription(
  imageBase64: string,
  mimeType: string,
): Promise<GeneratedItemDetails> {
  const result = await gemini.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      { inlineData: { mimeType, data: imageBase64 } },
      {
        text: `Identify the lost item from this photo. Provide a description focused entirely on the item itself, ignoring background or irrelevant elements.`,
      },
    ],
    // Enforce structured output directly from Gemini
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "The primary category of the lost item.",
            // Strict enforcement of your specific array values
            enum: ITEM_CATEGORIES, 
          },
          description: {
            type: Type.STRING,
            description: "A sentence to help the owner recognize the item, max 15 words. Describe specific small details.",
          },
        },
        required: ["category", "description"],
      },
    },
  });

  // Gemini is now guaranteed to return a valid JSON matching your schema
  try {
    const data = JSON.parse(result.text!) as GeneratedItemDetails;
    return {
      category: data.category || "Miscellaneous",
      description: data.description?.trim() || "",
    };
  } catch (error) {
    console.error("Failed to parse verified JSON:", error);
    return {
      category: "Miscellaneous",
      description: result.text?.trim() ?? "",
    };
  }
}

