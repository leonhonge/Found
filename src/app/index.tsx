import { Image } from "expo-image";
import { useState } from "react";
import { Button, StyleSheet, View } from "react-native";

import { CameraCapture } from "@/components/camera-capture";

export default function Index() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  if (isCameraOpen) {
    return (
      <CameraCapture
        onCancel={() => setIsCameraOpen(false)}
        onCaptured={(uri) => {
          setPhotoUri(uri);
          setIsCameraOpen(false);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>

      <Button title={photoUri ? "Retake photo" : "Take photo"} onPress={() => setIsCameraOpen(true)} />

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />
      ) : null}
import { type Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Michigan Found</Text>
      {/* Temporary: later this should go Home → camera → /lost */}
      <Pressable
        style={styles.button}
        onPress={() => router.push("/lost" as Href)}
      >
        <Text style={styles.buttonText}>Report lost item</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#7BA3E3",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  button: {
    backgroundColor: "#3A3A3A",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#F4D03F",
    fontSize: 18,
    fontWeight: "700",
  },
});
