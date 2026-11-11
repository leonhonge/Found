import { StyleSheet } from "react-native";
import { BLUE, BLUE_MID, MAIZE, MAIZE_SOFT } from "./theme";

export const ticketStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: BLUE,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 24,
      gap: 14,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: "#fff",
      marginBottom: 4,
    },
    previewCard: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 16,
      gap: 6,
      borderLeftWidth: 5,
      borderLeftColor: MAIZE,
    },
    previewTitle: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: BLUE_MID,
      marginBottom: 4,
    },
    previewLine: {
      fontSize: 14,
      color: BLUE,
    },
    photoPreview: {
      width: "100%",
      height: 180,
      borderRadius: 14,
      backgroundColor: MAIZE_SOFT,
      marginBottom: 8,
    },
    footer: {
      backgroundColor: MAIZE,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
    },
    homeButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: BLUE,
      alignItems: "center",
      justifyContent: "center",
    },
    homeFallback: {
      color: MAIZE,
      fontSize: 26,
      fontWeight: "700",
    },
  });
  