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
          <Text style={styles.kicker}>University of Michigan</Text>
          <Text style={styles.title}>Michigan Found</Text>
          <Text style={styles.subtitle}>Welcome to the University of Michigan Lost and Found system.</Text>
        </View>
        <View style={styles.accentBar} />
        <View style={styles.actions}>
          <Text style={styles.prompt}>Sign in to your account to get started.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/client" as Href)}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Student View</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/admin" as Href)}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.secondaryButtonText}>Admin View</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = landingStyles;