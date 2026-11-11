import { StyleSheet } from "react-native";
import { MAIZE } from "./theme";

export const locationStyles = StyleSheet.create({
  flex: { flex: 1 },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 16,
    gap: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  hint: { fontSize: 14, color: "#445066", textAlign: "center" },
  row: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  primary: { backgroundColor: MAIZE },
  primaryText: { color: "#00274C", fontWeight: "700", fontSize: 16 },
  secondary: { backgroundColor: "#EEF1F6" },
  secondaryText: { color: "#00274C", fontWeight: "600", fontSize: 16 },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MAIZE,
  },
  mapButtonSet: { backgroundColor: MAIZE },
  mapButtonText: { color: MAIZE, fontWeight: "600", flexShrink: 1 },
  });
  