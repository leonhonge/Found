import { supabase } from "@/lib/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";

export type ImageDescriptionResult = {
  category: string;
  description: string;
};

/**
 * Calls the Supabase Edge Function to analyze an image using Gemini AI.
 */
export async function requestImageDescription(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png" = "image/jpeg",
): Promise<ImageDescriptionResult> {
  const { data, error } = await supabase.functions.invoke("analyze-item", {
    body: { imageBase64, mimeType },
  });

  if (error) {
    let details = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const body = await error.context.json();
        details = body.error || JSON.stringify(body);
      } catch (e) {
        // Fallback if not JSON
      }
    }
    console.error("Found: Error calling analyze-item function:", details);
    throw new Error(details);
  }

  return {
    category: data.category ?? "Miscellaneous",
    description: data.description ?? "",
  };
}

/**
 * Calls the Supabase Edge Function to verify semantic matches using Gemini AI.
 */
export async function requestMatchVerification(
  ticketDescription: string,
  potentialMatches: Array<{ id: number; description: string }>
): Promise<number[]> {
  const { data, error } = await supabase.functions.invoke("match-items", {
    body: { ticketDescription, potentialMatches },
  });

  if (error) {
    let details = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const body = await error.context.json();
        details = body.error || JSON.stringify(body);
      } catch (e) {
        // Fallback
      }
    }
    console.error("Found: Error calling match-items function:", details);
    throw new Error(details);
  }

  return data.matchingIds || [];
}
