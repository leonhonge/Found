import { supabase } from "@/lib/supabase/client";
import { matchBuilding as genericMatchBuilding, type PlaceInput } from "./match-building";

export type { PlaceInput };
export type Building = { id: number; name: string; address: string };

let cache: Building[] | null = null;
let loadingPromise: Promise<Building[]> | null = null;

export async function loadBuildings(): Promise<Building[]> {
  if (cache) return cache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    console.log("Found: Fetching buildings from Supabase table: 'front_desk_buildings'...");
    const { data, error } = await supabase
      .from("front_desk_buildings")
      .select("id, name, address");

    if (error) {
      console.error("Found: Error fetching from 'front_desk_buildings':", JSON.stringify(error, null, 2));
      loadingPromise = null;
      throw new Error(`Supabase error: ${error.message}`);
    }

    cache = data ?? [];
    return cache;
  })();

  return loadingPromise;
}

/**
 * Returns the currently cached buildings, or an empty array if not loaded.
 */
export function getCachedBuildings(): Building[] {
  if (!cache) {
    console.warn("Found: getCachedBuildings called but cache is null. Buildings may still be loading.");
  }
  return cache ?? [];
}

/**
 * Matches a place against the front desk buildings.
 * This will load buildings if they haven't been loaded yet.
 */
export async function matchBuilding(place: PlaceInput): Promise<Building | null> {
  const buildings = await loadBuildings();
  console.log(`Found: matchBuilding called for "${place.name || place.formattedAddress}" with ${buildings.length} buildings in cache.`);
  return genericMatchBuilding(place, buildings);
}