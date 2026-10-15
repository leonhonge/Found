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
  },
});
