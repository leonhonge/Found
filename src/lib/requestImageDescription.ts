import Constants from "expo-constants";

export type ImageDescriptionResult = {
  category: string;
  description: string;
};

function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(",")[0];
    return host.startsWith("http") ? host : `http://${host}`;
  }

  return "";
}

export async function requestImageDescription(
  imageBase64: string,
  mimeType: "image/jpeg",
): Promise<ImageDescriptionResult> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/image-description`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate image description");
  }
  const data = (await response.json()) as Partial<ImageDescriptionResult>;
  return {
    category: data.category ?? "",
    description: data.description ?? "",
  };
}
