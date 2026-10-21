import { type Href, Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAIZE = "#FFCB05";
const BLUE = "#00274C";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false, title: "Michigan Found" }} />
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>University of Michigan</Text>
          <Text style={styles.title}>Michigan Found</Text>
          <Text style={styles.subtitle}>Report a lost item and help it get back to campus.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/lost" as Href)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Report lost item</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BLUE,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 36,
  },
  hero: {
    gap: 10,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: MAIZE,
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: "#C5D4E8",
    maxWidth: 320,
  },
  button: {
    backgroundColor: MAIZE,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  buttonText: {
    color: BLUE,
    fontSize: 18,
    fontWeight: "800",
  },
});
