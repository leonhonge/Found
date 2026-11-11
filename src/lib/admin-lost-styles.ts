import { Platform, StyleSheet } from "react-native";
import { BLUE, BLUE_MID, MAIZE, MAIZE_SOFT } from "./theme";

export const fieldShadow =
  Platform.OS === "ios"
    ? {
        shadowColor: "#001428",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
      }
    : Platform.OS === "android"
      ? { elevation: 6 }
      : { boxShadow: "0 12px 32px rgba(0, 20, 40, 0.28)" };

export const lostStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BLUE,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 14,
  },
  fieldCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderLeftWidth: 5,
    borderLeftColor: MAIZE,
    ...fieldShadow,
  },
  fieldCardStack: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  fieldCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  fieldCopy: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: BLUE_MID,
  },
  fieldValue: {
    fontSize: 18,
    fontWeight: "600",
    color: BLUE,
  },
  fieldPlaceholder: {
    fontSize: 18,
    fontWeight: "500",
    color: "#8A96A8",
  },
  chevronFallback: {
    color: MAIZE,
    fontSize: 22,
    fontWeight: "700",
  },
  photoPreview: {
    marginTop: 10,
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: MAIZE_SOFT,
  },
  descriptionPreview: {
    marginTop: 10,
    backgroundColor: MAIZE_SOFT,
    borderRadius: 14,
    minHeight: 112,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: BLUE,
  },
  descriptionModalInput: {
    minHeight: 112,
  },
  submitBar: {
    backgroundColor: BLUE_MID,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: MAIZE,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  resetButton: {
    backgroundColor: BLUE_MID,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 203, 5, 0.25)",
  },
  resetText: {
    color: "#B8C4D6",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 39, 76, 0.55)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderTopWidth: 4,
    borderTopColor: MAIZE,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BLUE,
    textAlign: "center",
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 13,
    color: BLUE_MID,
    textAlign: "center",
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F4F7FB",
  },
  optionRowSelected: {
    backgroundColor: MAIZE,
  },
  optionText: {
    fontSize: 17,
    textAlign: "center",
    fontWeight: "600",
    color: BLUE,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D7DEE8",
    backgroundColor: "#F4F7FB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: BLUE,
  },
  modalActions: {
    gap: 10,
  },
  modalSecondary: {
    backgroundColor: "#F4F7FB",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSecondaryText: {
    color: BLUE,
    fontWeight: "700",
    fontSize: 16,
  },
  modalSave: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSaveText: {
    color: MAIZE,
    fontWeight: "700",
    fontSize: 16,
  },
  iosPickerWrap: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  iosPickerDone: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iosPickerDoneText: {
    fontSize: 16,
    fontWeight: "700",
    color: BLUE,
  },
});