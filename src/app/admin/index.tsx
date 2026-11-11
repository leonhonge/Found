import { landingStyles } from "@/styles/landing-styles";
import { type Href, Stack, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false, title: "Michigan Found" }} />
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Admin View</Text>
          <Text style={styles.subtitle}>Report a lost item and help it get back to campus.</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/admin/lost" as Href)}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Report lost item</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/admin/tickets" as Href)}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.secondaryButtonText}>View all tickets</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = landingStyles;