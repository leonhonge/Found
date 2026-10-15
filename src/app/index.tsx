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
