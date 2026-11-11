import { useSyncExternalStore } from "react";

import type { Coordinates, NearbyBuilding } from "@/lib/campus/location-service";

export type SavedMarker = Coordinates & {
  /** Building name or address from reverse geocoding the pin. */
  label: string;
  /** UMich front-desk buildings inside the search radius, nearest first. */
  nearbyBuildings: NearbyBuilding[];
  /** Changes every time a pin is saved. */
  savedAt: number;
};

let current: SavedMarker | null = null;
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

export function getMarker(): SavedMarker | null {
  return current;
}

/** Re-renders the component whenever the saved marker changes. */
export function useMarker(): SavedMarker | null {
  return useSyncExternalStore(subscribe, getMarker, () => null);
}

export function saveMarker(marker: SavedMarker): void {
  current = marker;
  emit();
}

export function clearMarker(): void {
  current = null;
  emit();
}