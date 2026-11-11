import { Href, Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";

import {
  ITEM_CATEGORIES,
  type ItemCategory
} from "@/lib/item-categories";
import { addClientTicket } from "@/lib/tickets-store";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const MAIZE = "#FFCB05";
const MAIZE_SOFT = "#FFF6CC";
const BLUE = "#00274C";
const BLUE_MID = "#1A3E66";

const CATEGORIES = ITEM_CATEGORIES;

type Category = ItemCategory;

type SubmittedReport = {
  category: Category | "";
  description: string;
  /** The first day in the selected date range. Kept as `lostAt` for compatibility. */
  lostAt: string;
  /** The last day in the selected date range. */
  lostUntil: string;
  location: string;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(start: Date | null, end: Date | null): string {
  if (!start) return "Select the date range";
  if (!end || isSameDay(start, end)) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function getCalendarDays(month: Date): Array<Date | null> {
  const firstDayOfMonth = new Date(
    month.getFullYear(),
    month.getMonth(),
    1,
  ).getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cellCount = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const dayNumber = index - firstDayOfMonth + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return new Date(month.getFullYear(), month.getMonth(), dayNumber);
  });
}

export default function LostItemForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Every report field starts empty so the student enters it manually.
  const [category, setCategory] = useState<Category | "">("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [lostRangeStart, setLostRangeStart] = useState<Date | null>(null);
  const [lostRangeEnd, setLostRangeEnd] = useState<Date | null>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDraftStart, setCalendarDraftStart] = useState<Date | null>(
    null,
  );
  const [calendarDraftEnd, setCalendarDraftEnd] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );

  const dateRangeLabel = formatDateRange(lostRangeStart, lostRangeEnd);
  const today = startOfDay(new Date());
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoToNextMonth = visibleMonth < currentMonth;

  function openCalendar() {
    const initialDate = lostRangeStart ?? today;
    setCalendarDraftStart(lostRangeStart);
    setCalendarDraftEnd(lostRangeEnd);
    setVisibleMonth(
      new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );
    setCalendarOpen(true);
  }

  function selectCalendarDate(date: Date) {
    const selectedDate = startOfDay(date);
    if (selectedDate > today) return;

    // First tap chooses the start; the second tap chooses the end.
    // Tapping again after a complete range starts a new range.
    if (!calendarDraftStart || calendarDraftEnd) {
      setCalendarDraftStart(selectedDate);
      setCalendarDraftEnd(null);
      return;
    }

    if (selectedDate < calendarDraftStart) {
      setCalendarDraftStart(selectedDate);
      setCalendarDraftEnd(null);
      return;
    }

    setCalendarDraftEnd(selectedDate);
  }

  function saveCalendarRange() {
    if (!calendarDraftStart) {
      Alert.alert("Select a date", "Choose at least one date on the calendar.");
      return;
    }

    // A single selected date is treated as a one-day range.
    const start = startOfDay(calendarDraftStart);
    const end = startOfDay(calendarDraftEnd ?? calendarDraftStart);
    setLostRangeStart(start);
    setLostRangeEnd(end);
    setCalendarOpen(false);
  }

  function submitReport() {
    const trimmedDescription = description.trim();
    const trimmedLocation = location.trim();

    if (!category || !trimmedDescription || !trimmedLocation || !lostRangeStart) {
      Alert.alert(
        "Missing information",
        "Please complete the category, description, date range, and location before submitting.",
      );
      return;
    }

    const endDate = lostRangeEnd ?? lostRangeStart;
    const report: SubmittedReport = {
      category,
      description: trimmedDescription,
      // Keep the start date in the existing field and save the range end too.
      lostAt: startOfDay(lostRangeStart).toISOString(),
      lostUntil: startOfDay(endDate).toISOString(),
      location: trimmedLocation,
    };

    addClientTicket(report);
    Alert.alert(
      "Report submitted",
      "Your ticket was saved. You can view all tickets from the home page.",
      [
        { text: "OK" },
        {
          text: "View tickets",
          onPress: () => router.push("/tickets" as Href),
        },
      ],
    );
  }

  function resetForm() {
    setCategory("");
    setDescription("");
    setLocation("");
    setLostRangeStart(null);
    setLostRangeEnd(null);
    setCalendarDraftStart(null);
    setCalendarDraftEnd(null);
    setCalendarOpen(false);
    setCategoryOpen(false);
  }

  function confirmReset() {
    if (Platform.OS === "web") {
      resetForm();
      return;
    }

    Alert.alert("Reset form?", "This will clear all fields.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: resetForm },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen
        options={{ headerShown: false, title: "Report Lost Item" }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => setCategoryOpen(true)}
            style={({ pressed }) => [
              styles.fieldCard,
              pressed && styles.fieldCardPressed,
            ]}
          >
            <View style={styles.fieldCopy}>
              <Text style={styles.fieldLabel}>Category</Text>
              <Text
                style={category ? styles.fieldValue : styles.fieldPlaceholder}
              >
                {category || "Select a category"}
              </Text>
            </View>
            <SymbolView
              name={{
                ios: "chevron.right",
                android: "chevron_right",
                web: "chevron_right",
              }}
              tintColor={MAIZE}
              size={18}
              fallback={<Text style={styles.chevronFallback}>›</Text>}
            />
          </Pressable>

          <View style={[styles.fieldCard, styles.fieldCardStack]}>
            <Text style={styles.fieldLabel}>Item description</Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="Describe the item, including its color, brand, stickers, or other identifying details."
              placeholderTextColor="#8A96A8"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose the estimated date range when the item was lost"
            onPress={openCalendar}
            style={({ pressed }) => [
              styles.fieldCard,
              pressed && styles.fieldCardPressed,
            ]}
          >
            <View style={styles.fieldCopy}>
              <Text style={styles.fieldLabel}>Estimated date lost</Text>
              <Text
                style={
                  lostRangeStart ? styles.fieldValue : styles.fieldPlaceholder
                }
              >
                {dateRangeLabel}
              </Text>
              <Text style={styles.fieldHint}>
                Choose a start date and an end date.
              </Text>
            </View>
            <SymbolView
              name={{
                ios: "calendar",
                android: "calendar_month",
                web: "calendar_month",
              }}
              tintColor={MAIZE}
              size={22}
              fallback={<Text style={styles.chevronFallback}>▣</Text>}
            />
          </Pressable>

          <View style={[styles.fieldCard, styles.fieldCardStack]}>
            <Text style={styles.fieldLabel}>Location lost</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter where you think you lost it (e.g. Mason Hall)."
              placeholderTextColor="#8A96A8"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
          </View>
        </ScrollView>

        <Pressable style={styles.submitBar} onPress={submitReport}>
          <Text style={styles.submitText}>Report Lost Item</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset form"
          style={styles.resetButton}
          onPress={confirmReset}
        >
          <Text style={styles.resetText}>Reset form</Text>
        </Pressable>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Home"
            style={styles.homeButton}
            onPress={() => router.push("/")}
          >
            <SymbolView
              name={{ ios: "house.fill", android: "home", web: "home" }}
              tintColor={MAIZE}
              size={28}
              fallback={<Text style={styles.homeFallback}>⌂</Text>}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={categoryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCategoryOpen(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Category</Text>
            {CATEGORIES.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.optionRow,
                  category === option && styles.optionRowSelected,
                ]}
                onPress={() => {
                  setCategory(option);
                  setCategoryOpen(false);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={calendarOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCalendarOpen(false)}
        >
          <Pressable style={styles.calendarModalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>When was the item lost?</Text>
            <Text style={styles.modalHint}>
              Select the first date, then select the last date. For a one-day range,
              select one date and tap “Use date range.”
            </Text>

            <View style={styles.calendarMonthHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                style={styles.calendarNavButton}
                onPress={() =>
                  setVisibleMonth(
                    (month) =>
                      new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                <Text style={styles.calendarNavText}>‹</Text>
              </Pressable>
              <Text style={styles.calendarMonthTitle}>
                {visibleMonth.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next month"
                disabled={!canGoToNextMonth}
                style={[
                  styles.calendarNavButton,
                  !canGoToNextMonth && styles.calendarNavButtonDisabled,
                ]}
                onPress={() =>
                  setVisibleMonth(
                    (month) =>
                      new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                <Text
                  style={[
                    styles.calendarNavText,
                    !canGoToNextMonth && styles.calendarNavTextDisabled,
                  ]}
                >
                  ›
                </Text>
              </Pressable>
            </View>

            <View style={styles.calendarWeekdayRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map(
                (day, index) => (
                  <View key={`${day}-${index}`} style={styles.calendarCell}>
                    <Text style={styles.calendarWeekday}>{day}</Text>
                  </View>
                ),
              )}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                if (!day) {
                  return (
                    <View
                      key={`empty-${index}`}
                      style={styles.calendarCell}
                    />
                  );
                }

                const disabled = startOfDay(day) > today;
                const isStart =
                  calendarDraftStart !== null &&
                  isSameDay(day, calendarDraftStart);
                const isEnd =
                  calendarDraftEnd !== null &&
                  isSameDay(day, calendarDraftEnd);
                const isInRange =
                  calendarDraftStart !== null &&
                  calendarDraftEnd !== null &&
                  startOfDay(day) >= calendarDraftStart &&
                  startOfDay(day) <= calendarDraftEnd;
                const isSelected = isStart || isEnd;

                return (
                  <View key={day.toISOString()} style={styles.calendarCell}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={formatDate(day)}
                      accessibilityState={{
                        disabled,
                        selected: isSelected,
                      }}
                      disabled={disabled}
                      onPress={() => selectCalendarDate(day)}
                      style={[
                        styles.calendarDayButton,
                        isInRange && styles.calendarDayInRange,
                        isSelected && styles.calendarDaySelected,
                        disabled && styles.calendarDayDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          isSelected && styles.calendarDayTextSelected,
                          disabled && styles.calendarDayTextDisabled,
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <View style={styles.calendarSelectionSummary}>
              <Text style={styles.calendarSelectionText}>
                Start: {calendarDraftStart ? formatDate(calendarDraftStart) : "Not selected"}
              </Text>
              <Text style={styles.calendarSelectionText}>
                End: {calendarDraftEnd ? formatDate(calendarDraftEnd) : "Not selected"}
              </Text>
            </View>

            <View style={styles.calendarActions}>
              <Pressable
                style={styles.modalSecondary}
                onPress={() => setCalendarOpen(false)}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalSave}
                onPress={saveCalendarRange}
              >
                <Text style={styles.modalSaveText}>Use date range</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const fieldShadow =
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

const styles = StyleSheet.create({
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
