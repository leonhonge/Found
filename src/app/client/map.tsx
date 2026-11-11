import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import MapView, { Marker, type MapPressEvent } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Coordinates } from "@/lib/location";
import {
  findBuildingsWithinRadius,
  getLabelForCoordinates,
  SEARCH_RADIUS_METERS,
} from "@/lib/location";
import { locationStyles } from "@/lib/location-styles";
import { clearMarker, getMarker, saveMarker } from "@/lib/marker-storage";
import { MAIZE } from "@/lib/theme";

const DEFAULT_REGION = {
  latitude: 42.278,
  longitude: -83.7382,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Lazy initializers: start from the saved pin if there is one.
  const [initialRegion] = useState(() => {
    const saved = getMarker();
    return saved
      ? { ...DEFAULT_REGION, latitude: saved.latitude, longitude: saved.longitude }
      : DEFAULT_REGION;
  });
  const [draft, setDraft] = useState<Coordinates | null>(() => {
    const saved = getMarker();
    return saved ? { latitude: saved.latitude, longitude: saved.longitude } : null;
  });
  const [saving, setSaving] = useState(false);

  function onMapPress(e: MapPressEvent) {
    setDraft(e.nativeEvent.coordinate);
  }

  async function onSave() {
    if (!draft) {
      Alert.alert("No pin dropped", "Tap the map to place a pin first.");
      return;
    }
    setSaving(true);
    try {
      const [label, nearbyBuildings] = await Promise.all([
        getLabelForCoordinates(draft.latitude, draft.longitude),
        findBuildingsWithinRadius(draft, SEARCH_RADIUS_METERS),
      ]);
      await saveMarker({ ...draft, label, nearbyBuildings, savedAt: Date.now() });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setDraft(null);
    await clearMarker();
  }

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ title: "Pin where you lost it" }} />

      <MapView style={styles.flex} initialRegion={initialRegion} onPress={onMapPress}>
        {draft && (
          <>
            <Marker
              coordinate={draft}
              draggable
              onDragEnd={(e) => setDraft(e.nativeEvent.coordinate)}
              pinColor={MAIZE}
            />
          </>
        )}
      </MapView>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Text style={styles.hint}>
          {draft
            ? `${draft.latitude.toFixed(5)}, ${draft.longitude.toFixed(5)}`
            : "Tap the map to drop a pin. Drag it to adjust."}
        </Text>
        <View style={styles.row}>
          <Pressable style={[styles.btn, styles.secondary]} onPress={onClear} disabled={saving}>
            <Text style={styles.secondaryText}>Clear</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.primary]} onPress={onSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#00274C" />
            ) : (
              <Text style={styles.primaryText}>Save location</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = locationStyles;