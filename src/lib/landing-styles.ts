import { BLUE, MAIZE } from "@/lib/theme";
import { StyleSheet } from "react-native";

export const landingStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BLUE },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 28, gap: 36 },
  actions: { gap: 12 },
  hero: { gap: 10 },
  kicker: {
    fontSize: 13, fontWeight: "700", letterSpacing: 1.2,
    textTransform: "uppercase", color: MAIZE,
  },
  title: { fontSize: 40, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 17, lineHeight: 24, color: "#C5D4E8", maxWidth: 320 },
  button: {
    backgroundColor: MAIZE, paddingVertical: 16, paddingHorizontal: 24,
    borderRadius: 18, alignItems: "center",
  },
  buttonPressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  buttonText: { color: BLUE, fontSize: 18, fontWeight: "800" },
  secondaryButton: {
    backgroundColor: "transparent", borderWidth: 2, borderColor: MAIZE,
    paddingVertical: 16, paddingHorizontal: 24, borderRadius: 18, alignItems: "center",
  },
  secondaryButtonText: { color: MAIZE, fontSize: 18, fontWeight: "800" },
  prompt: { color: "#FFFFFF", fontSize: 17, fontWeight: "600", marginBottom: 4 },
  accentBar: {
    width: "100%",
    height: 5,
    borderRadius: 3,
    backgroundColor: MAIZE,
    marginBottom: 8,
  },
});