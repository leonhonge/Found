import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

import type { Coordinates, NearbyBuilding } from "@/lib/location";

export type SavedMarker = Coordinates & {
  /** Building name or address from reverse geocoding the pin. */
  label: string;
  /** UMich front-desk buildings inside the search radius, nearest first. */
  nearbyBuildings: NearbyBuilding[];
  /** Changes every time a pin is saved. */
  savedAt: number;
};

const STORAGE_KEY = "michigan-found:marker";

let current: SavedMarker | null = null;
let touched = false; // stops late hydration from overwriting a fresh save/clear
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function parse(raw: string | null): SavedMarker | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (typeof p?.latitude === "number" && typeof p?.longitude === "number") {
      return {
        latitude: p.latitude,
        longitude: p.longitude,
        label: typeof p.label === "string" ? p.label : "",
        nearbyBuildings: Array.isArray(p.nearbyBuildings) ? p.nearbyBuildings : [],
        savedAt: typeof p.savedAt === "number" ? p.savedAt : 0,
      };
    }
  } catch {
    // corrupted value, treat as empty
  }
  return null;
}

// Hydrate once at module load, outside any component.
AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (touched) return;
    current = parse(raw);
    emit();
  })
  .catch(() => {});

export function getMarker(): SavedMarker | null {
  return current;
}

/** Re-renders the component whenever the saved marker changes. */
export function useMarker(): SavedMarker | null {
  return useSyncExternalStore(subscribe, getMarker, () => null);
}

export async function saveMarker(marker: SavedMarker): Promise<void> {
  touched = true;
  current = marker;
  emit();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(marker));
}

export async function clearMarker(): Promise<void> {
  touched = true;
  current = null;
  emit();
  await AsyncStorage.removeItem(STORAGE_KEY);
}