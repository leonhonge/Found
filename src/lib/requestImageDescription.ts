// This function calls the custom API endpoint for generating image descriptions

const API_URL = process.env.EXPO_URL;

export async function requestImageDescription(imageBase64: string, mimeType: "image/jpeg") {
    const response = await fetch(`${API_URL}/api/image-description`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64, mimeType }),
    });
    if (!response.ok) {
        throw new Error("Failed to generate image description");
    }
    const {description} = await response.json();
    return description as string;
}