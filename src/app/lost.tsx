import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  "Water Bottle",
  "Charger",
  "Electronic Device",
  "Miscellaneous",
] as const;

type Category = (typeof CATEGORIES)[number];

type SubmittedReport = {
  category: Category | "";
  description: string;
  lostAt: string;
  location: string;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function isCategory(value: string | undefined): value is Category {
  return CATEGORIES.some((category) => category === value);
}

function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function applyDatePart(base: Date, picked: Date): Date {
  const next = new Date(base);
  next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  return next;
}

function applyTimePart(base: Date, picked: Date): Date {
  const next = new Date(base);
  next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return next;
}

export default function LostItemForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    category?: string | string[];
    description?: string | string[];
  }>();

  const initialCategory = firstParam(params.category);
  const initialDescription = firstParam(params.description);

  const [category, setCategory] = useState<Category | "">(
    isCategory(initialCategory) ? initialCategory : "",
  );
  const [description, setDescription] = useState(initialDescription ?? "");
  const [lostAt, setLostAt] = useState(() => new Date());
  const [location, setLocation] = useState("");
  const [locationDraft, setLocationDraft] = useState("");
  const [lastSubmitted, setLastSubmitted] = useState<SubmittedReport | null>(
    null,
  );

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [webDateOpen, setWebDateOpen] = useState(false);
  const [webDateDraft, setWebDateDraft] = useState("");
  const [pickerMode, setPickerMode] = useState<"date" | "time" | "datetime" | null>(
    null,
  );

  useEffect(() => {
    if (isCategory(initialCategory)) {
      setCategory(initialCategory);
    }
    if (initialDescription !== undefined) {
      setDescription(initialDescription);
    }
  }, [initialCategory, initialDescription]);

  const categoryLabel = category || "Category";
  const dateLabel = useMemo(() => formatDateTime(lostAt), [lostAt]);
  const locationLabel = location || "Location Lost";

  function openDatePicker() {
    if (Platform.OS === "web") {
      setWebDateDraft(toDatetimeLocalValue(lostAt));
      setWebDateOpen(true);
      return;
    }
    if (Platform.OS === "android") {
      setPickerMode("date");
      return;
    }
    setPickerMode("datetime");
  }

  function onNativeDateChange(_event: unknown, selectedDate: Date) {
    if (Platform.OS === "android" && pickerMode === "date") {
      setLostAt((current) => applyDatePart(current, selectedDate));
      setPickerMode("time");
      return;
    }
    if (Platform.OS === "android" && pickerMode === "time") {
      setLostAt((current) => applyTimePart(current, selectedDate));
      setPickerMode(null);
      return;
    }
    setLostAt(selectedDate);
  }

  function submitReport() {
    const report: SubmittedReport = {
      category,
      description,
      lostAt: lostAt.toISOString(),
      location,
    };
    setLastSubmitted(report);
    Alert.alert(
      "Report submitted (preview)",
      [
        `Category: ${category || "(none)"}`,
        `Description: ${description || "(none)"}`,
        `Date lost: ${formatDateTime(lostAt)}`,
        `Location: ${location || "(none)"}`,
      ].join("\n"),
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false, title: "Report Lost Item" }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={styles.whiteCard}
            onPress={() => setCategoryOpen(true)}
          >
            <Text style={styles.cardTitle}>{categoryLabel}</Text>
          </Pressable>

          <View style={styles.whiteCard}>
            <Text style={styles.cardTitle}>Item Description:</Text>
          </View>
          <TextInput
            style={styles.descriptionInput}
            placeholder="please list any identifying details about your item here."
            placeholderTextColor="#5c4b00"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <Pressable style={styles.whiteCard} onPress={openDatePicker}>
            <Text style={styles.cardTitle}>Estimated Date Lost</Text>
            <Text style={styles.cardValue}>{dateLabel}</Text>
          </Pressable>

          <Pressable
            style={styles.whiteCard}
            onPress={() => {
              setLocationDraft(location);
              setLocationOpen(true);
            }}
          >
            <Text style={styles.cardTitle}>{locationLabel}</Text>
          </Pressable>

          {lastSubmitted ? (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Last submitted (temporary)</Text>
              <Text style={styles.previewLine}>
                Category: {lastSubmitted.category || "(none)"}
              </Text>
              <Text style={styles.previewLine}>
                Description: {lastSubmitted.description || "(none)"}
              </Text>
              <Text style={styles.previewLine}>
                Date lost: {formatDateTime(new Date(lastSubmitted.lostAt))}
              </Text>
              <Text style={styles.previewLine}>
                Location: {lastSubmitted.location || "(none)"}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {Platform.OS !== "web" && pickerMode ? (
          <View style={Platform.OS === "ios" ? styles.iosPickerWrap : undefined}>
            {Platform.OS === "ios" ? (
              <Pressable
                style={styles.iosPickerDone}
                onPress={() => setPickerMode(null)}
              >
                <Text style={styles.iosPickerDoneText}>Done</Text>
              </Pressable>
            ) : null}
            <DateTimePicker
              value={lostAt}
              mode={pickerMode}
              presentation={Platform.OS === "android" ? "dialog" : undefined}
              onValueChange={onNativeDateChange}
              onDismiss={() => setPickerMode(null)}
            />
          </View>
        ) : null}

        <Pressable style={styles.submitBar} onPress={submitReport}>
          <Text style={styles.submitText}>Report Lost Item</Text>
        </Pressable>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Home"
            style={styles.homeButton}
            onPress={() => router.push("/")}
          >
            <SymbolView
              name={{ ios: "house.fill", android: "home", web: "home" }}
              tintColor="#F4D03F"
              size={28}
              fallback={<Text style={styles.homeFallback}>⌂</Text>}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={categoryOpen} transparent animationType="fade">
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

      <Modal visible={locationOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLocationOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Location Lost</Text>
            <Text style={styles.modalHint}>
              Type a place for now. This can later open the map page.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Mason Hall"
              value={locationDraft}
              onChangeText={setLocationDraft}
              autoFocus
            />
            <Pressable
              style={styles.modalSave}
              onPress={() => {
                setLocation(locationDraft.trim());
                setLocationOpen(false);
              }}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={webDateOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setWebDateOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Estimated Date Lost</Text>
            <Text style={styles.modalHint}>Use YYYY-MM-DDTHH:MM</Text>
            <TextInput
              style={styles.modalInput}
              value={webDateDraft}
              onChangeText={setWebDateDraft}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              style={styles.modalSave}
              onPress={() => {
                const next = new Date(webDateDraft);
                if (Number.isNaN(next.getTime())) {
                  Alert.alert("Invalid date", "Please use YYYY-MM-DDTHH:MM.");
                  return;
                }
                setLostAt(next);
                setWebDateOpen(false);
              }}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const YELLOW = "#F4D03F";
const YELLOW_BORDER = "#E8C547";
const BLUE = "#7BA3E3";
const DARK = "#3A3A3A";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BLUE,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 16,
  },
  whiteCard: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: YELLOW_BORDER,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  cardValue: {
    marginTop: 6,
    fontSize: 15,
    color: "#333",
    textAlign: "center",
  },
  descriptionInput: {
    backgroundColor: YELLOW,
    borderWidth: 3,
    borderColor: YELLOW_BORDER,
    borderRadius: 8,
    minHeight: 110,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontStyle: "italic",
    color: "#3b2f00",
  },
  previewCard: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: YELLOW_BORDER,
    borderRadius: 8,
    padding: 14,
    gap: 6,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  previewLine: {
    fontSize: 14,
    color: "#222",
  },
  submitBar: {
    backgroundColor: DARK,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: YELLOW,
    fontSize: 22,
    fontWeight: "700",
  },
  footer: {
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  homeButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  homeFallback: {
    color: YELLOW,
    fontSize: 26,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: YELLOW_BORDER,
    padding: 16,
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
  },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f7f7f7",
  },
  optionRowSelected: {
    backgroundColor: YELLOW,
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalSave: {
    backgroundColor: DARK,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSaveText: {
    color: YELLOW,
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
    color: "#0B5FFF",
  },
});
