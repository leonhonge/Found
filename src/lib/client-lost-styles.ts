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
  fieldHint: {
    fontSize: 12,
    color: "#68788D",
    marginTop: 2,
  },
  chevronFallback: {
    color: MAIZE,
    fontSize: 22,
    fontWeight: "700",
  },
  textInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D7DEE8",
    backgroundColor: "#F4F7FB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: BLUE,
  },
  descriptionInput: {
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
  calendarModalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderTopWidth: 4,
    borderTopColor: MAIZE,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
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
    lineHeight: 19,
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
  modalSecondary: {
    backgroundColor: "#F4F7FB",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    flex: 1,
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
    flex: 1,
  },
  modalSaveText: {
    color: MAIZE,
    fontWeight: "700",
    fontSize: 16,
  },
  calendarMonthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarNavButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#F4F7FB",
  },
  calendarNavButtonDisabled: {
    opacity: 0.35,
  },
  calendarNavText: {
    color: BLUE,
    fontSize: 28,
    lineHeight: 30,
  },
  calendarNavTextDisabled: {
    color: "#8A96A8",
  },
  calendarMonthTitle: {
    color: BLUE,
    fontSize: 17,
    fontWeight: "700",
  },
  calendarWeekdayRow: {
    flexDirection: "row",
  },
  calendarWeekday: {
    color: BLUE_MID,
    fontSize: 12,
    fontWeight: "700",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: "14.2857%",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayInRange: {
    backgroundColor: MAIZE_SOFT,
  },
  calendarDaySelected: {
    backgroundColor: BLUE,
  },
  calendarDayDisabled: {
    opacity: 0.35,
  },
  calendarDayText: {
    color: BLUE,
    fontSize: 14,
    fontWeight: "600",
  },
  calendarDayTextSelected: {
    color: MAIZE,
  },
  calendarDayTextDisabled: {
    color: "#8A96A8",
  },
  calendarSelectionSummary: {
    backgroundColor: MAIZE_SOFT,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  calendarSelectionText: {
    color: BLUE,
    fontSize: 13,
    fontWeight: "600",
  },
  calendarActions: {
    flexDirection: "row",
    gap: 10,
  },
});
