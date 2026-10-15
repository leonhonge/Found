import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import { saveCapturedPhoto } from "@/lib/save-captured-photo";

type CameraCaptureProps = {
  onCancel: () => void;
  onCaptured: (uri: string) => void;
};

export function CameraCapture({ onCancel, onCaptured }: CameraCaptureProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!permission) {
    return <View style={styles.centered} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Camera access is needed to take a photo for this form.</Text>
        <Button title="Allow camera" onPress={requestPermission} />
        <Button title="Cancel" onPress={onCancel} />
      </View>
    );
  }

  async function takePhoto() {
    if (!isReady || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const photo = await cameraRef.current?.takePictureAsync();
      if (!photo?.uri) {
        throw new Error("No photo was captured.");
      }

      const savedUri = await saveCapturedPhoto(photo.uri);
      onCaptured(savedUri);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save photo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setIsReady(true)}
      />
      <View style={styles.controls}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={isSaving ? "Saving…" : "Take photo"} onPress={takePhoto} disabled={!isReady || isSaving} />
        <Button title="Cancel" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  controls: {
    padding: 24,
    gap: 12,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  message: {
    textAlign: "center",
    marginBottom: 8,
  },
  error: {
    color: "#ff8a80",
    textAlign: "center",
  },
});
