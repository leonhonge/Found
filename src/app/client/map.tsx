import { location_styles } from "@/lib/location-styles";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import MapView, { type MapPressEvent, Marker } from "react-native-maps";

import { clearMarker, type SavedMarker, saveMarker } from "@/lib/marker-storage";

const U_OF_M = { latitude: 42.278, longitude: -83.7382 }; // Central Campus

export default function MarkerMap() {
  const router = useRouter();
  const [marker, setMarker] = useState<SavedMarker | null>(null);
  const [loaded, setLoaded] = useState(false);

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const next = { latitude, longitude };
    setMarker(next);
    try {
      await saveMarker(next);
    } catch (error) {
      console.warn("Could not save marker", error);
    }
  };

  const handleClear = async () => {
    setMarker(null);
    try {
      await clearMarker();
    } catch (error) {
      console.warn("Could not clear marker", error);
    }
  };

  // Wait for storage so the map opens at the saved spot instead of jumping
  if (!loaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          ...(marker ?? U_OF_M),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        {marker && <Marker coordinate={marker} pinColor="#FFCB05" />}
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.panelText}>
          {marker ? "Location saved" : "Tap the map to set a location"}
        </Text>
        <View style={styles.buttons}>
          {marker && (
            <Pressable accessibilityRole="button" onPress={handleClear} style={styles.clearButton}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={!marker}
            // Change "/search" to your next page's route
            onPress={() => router.push("/search" as Href)}
            style={[styles.continueButton, !marker && styles.continueDisabled]}
          >
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = location_styles;