import * as Location from "expo-location";

import { loadBuildings, matchBuilding, type Building } from "@/lib/campus/umich-buildings";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type NearbyBuilding = Coordinates & Building & {
  distanceMeters: number;
};

export const SEARCH_RADIUS_METERS = 300;

async function formatPlace(
  place: Location.LocationGeocodedAddress,
  latitude: number,
  longitude: number,
): Promise<string> {
  const frontDeskBuilding = await matchBuilding(place);
  if (frontDeskBuilding) {
    return frontDeskBuilding.name;
  }


  if (place.formattedAddress) {
    return place.formattedAddress;
  }

  const street = [place.streetNumber, place.street].filter(Boolean).join(" ");
  const parts = [place.name, street, place.city].filter(
    (part): part is string => Boolean(part),
  );
  const unique = [...new Set(parts)];
  if (unique.length > 0) {
    return unique.join(", ");
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export async function getCurrentLocationLabel(): Promise<string | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    return null;
  }

  const lastKnown = await Location.getLastKnownPositionAsync({
    maxAge: 2 * 60 * 1000,
    requiredAccuracy: 100,
  });
  const position =
    lastKnown ??
    (await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }));

  const { latitude, longitude } = position.coords;

  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (places[0]) {
      return formatPlace(places[0], latitude, longitude);
    }
  } catch {
    // Reverse geocoding is not available on every platform.
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Turns the pin's coordinates into a building name or address. */
export async function getLabelForCoordinates(
  latitude: number,
  longitude: number,
): Promise<string> {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (places[0]) {
      return formatPlace(places[0], latitude, longitude);
    }
  } catch {
    // Reverse geocoding is not available on every platform.
  }
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

type BuildingWithCoords = Building & Coordinates;

let buildingCoordsPromise: Promise<BuildingWithCoords[]> | null = null;

// Geocodes each building address once per app session. Sequential, because
// iOS throttles bursts of geocoding requests.
async function geocodeBuildings(): Promise<BuildingWithCoords[]> {
  const buildings = await loadBuildings();
  
  const results: BuildingWithCoords[] = [];
  for (const building of buildings) {
    try {
      const [hit] = await Location.geocodeAsync(
        `${building.address}, Ann Arbor, MI`,
      );
      if (hit) {
        results.push({
          ...building,
          latitude: hit.latitude,
          longitude: hit.longitude,
        });
      }
    } catch {
      // skip buildings that fail to geocode
    }
  }
  return results;
}

function loadBuildingCoords(): Promise<BuildingWithCoords[]> {
  if (!buildingCoordsPromise) {
    buildingCoordsPromise = geocodeBuildings().then((list) => {
      if (list.length === 0) buildingCoordsPromise = null; // allow a retry
      return list;
    });
  }
  return buildingCoordsPromise;
}

/** UMich front-desk buildings within the radius of the pin, nearest first. */
export async function findBuildingsWithinRadius(
  center: Coordinates,
  radiusMeters: number = SEARCH_RADIUS_METERS,
): Promise<NearbyBuilding[]> {
  const buildings = await loadBuildingCoords();
  return buildings
    .map((b) => ({ ...b, distanceMeters: distanceMeters(center, b) }))
    .filter((b) => b.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}