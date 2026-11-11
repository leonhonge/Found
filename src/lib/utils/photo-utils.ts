import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

const PHOTOS_FOLDER = "photos";

/**
 * Copies a camera capture into the app Documents/photos folder.
 * That lives in the app sandbox, not the device camera roll.
 * Cache URIs from takePictureAsync are temporary, so this copy is required.
 */
export async function saveCapturedPhoto(cacheUri: string): Promise<string> {
  if (Platform.OS === "web") {
    return cacheUri;
  }

  const photosDir = new Directory(Paths.document, PHOTOS_FOLDER);
  photosDir.create({ intermediates: true, idempotent: true });

  const destination = new File(photosDir, `${Date.now()}.jpg`);
  await new File(cacheUri).copy(destination);
  return destination.uri;
}
