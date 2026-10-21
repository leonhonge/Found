import { generateImageDescription } from "@/server/generateImageDescription";

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = await request.json();

    if (!imageBase64) {
      return Response.json({ error: "Missing imageBase64" }, { status: 400 });
    }

    const details = await generateImageDescription(imageBase64, mimeType);

    return Response.json(details);
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
