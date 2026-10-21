import * as Location from "expo-location";

function formatPlace(
  place: Location.LocationGeocodedAddress,
  latitude: number,
  longitude: number,
): string {
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
