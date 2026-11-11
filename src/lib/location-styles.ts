import { StyleSheet } from "react-native";

export const location_styles = StyleSheet.create({
    container: { flex: 1 },
  map: { flex: 1 },
  panel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  panelText: { fontSize: 16, fontWeight: "600", color: "#00274C", flexShrink: 1 },
  buttons: { flexDirection: "row", gap: 8 },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#00274C",
  },
  clearText: { color: "#00274C", fontWeight: "600" },
  continueButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#FFCB05",
  },
  continueDisabled: { opacity: 0.4 },
  continueText: { color: "#00274C", fontWeight: "700" },
  });
  