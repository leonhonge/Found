// This is the custom API endpoint for generating image descriptions
// Takes in a base64 encoded image and a mime type and calls the server function that handles the actual generation

import { generateImageDescription } from "@/server/generateImageDescription";

export async function POST(request: Request) {
    try {
        const { imageBase64, mimeType = "image/jpeg" } = await request.json();
      
        if (!imageBase64) {
          return Response.json({ error: "Missing imageBase64" }, { status: 400 });
        }
      
        const description = await generateImageDescription(imageBase64, mimeType);
      
        return Response.json({ description });

    } catch (error) {
        console.error("image-description failed:", error);
        return Response.json(
          {
            error: "Failed to generate image description",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        );
    }
}