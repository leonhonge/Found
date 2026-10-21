import { GoogleGenAI } from "@google/genai/node";

import { ITEM_CATEGORIES } from "@/lib/item-categories";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export type GeneratedItemDetails = {
  category: string;
  description: string;
};

function parseGeneratedDetails(text: string | undefined): GeneratedItemDetails {
  const fallback: GeneratedItemDetails = {
    category: "Miscellaneous",
    description: text?.trim() ?? "",
  };

  if (!text) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(text) as Partial<GeneratedItemDetails>;
    return {
      category: typeof parsed.category === "string" ? parsed.category : fallback.category,
      description:
        typeof parsed.description === "string" ? parsed.description.trim() : fallback.description,
    };
  } catch {
    return fallback;
  }
}

export async function generateImageDescription(
  imageBase64: string,
  mimeType: string,
): Promise<GeneratedItemDetails> {
  const result = await gemini.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      { inlineData: { mimeType, data: imageBase64 } },
      {
        text: `Identify a lost item from this photo. Return JSON only with keys category and description.
category must be exactly one of: ${ITEM_CATEGORIES.join(", ")}.
description should help the owner recognize the item, including small details, 15 words max.`,
      },
    ],
  });

  return parseGeneratedDetails(result.text);
}
