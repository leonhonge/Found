import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedMarker = {
  latitude: number;
  longitude: number;
};

const STORAGE_KEY = "michigan-found:marker";

export async function saveMarker(marker: SavedMarker): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(marker));
}

export async function loadMarker(): Promise<SavedMarker | null> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    if (typeof parsed?.latitude === "number" && typeof parsed?.longitude === "number") {
      return parsed as SavedMarker;
    }
  } catch {
    // fall through to null if the stored value is corrupted
  }
  return null;
}

export async function clearMarker(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}