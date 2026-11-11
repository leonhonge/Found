import { Href, Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";

import { lostStyles } from "@/lib/client-lost-styles";
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
  Text,
  TextInput,
  View
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { MAIZE } from "@/lib/theme";

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
              placeholder="Press to enter where you think you lost it."
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

const styles = lostStyles