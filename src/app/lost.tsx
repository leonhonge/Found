import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useRef, useState } from "react";

import { CameraCapture } from "@/components/camera-capture";
import { getCurrentLocationLabel } from "@/lib/current-location";
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

const MAIZE = "#FFCB05";
const MAIZE_SOFT = "#FFF6CC";
const BLUE = "#00274C";
const BLUE_MID = "#1A3E66";

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
  photoUri: string | null;
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
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const locationTouchedRef = useRef(false);

  useEffect(() => {
    if (isCategory(initialCategory)) {
      setCategory(initialCategory);
    }
    if (initialDescription !== undefined) {
      setDescription(initialDescription);
    }
  }, [initialCategory, initialDescription]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const label = await getCurrentLocationLabel();
        if (!cancelled && label && !locationTouchedRef.current) {
          setLocation(label);
        }
      } finally {
        if (!cancelled) {
          setLocationLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const dateLabel = useMemo(() => formatDateTime(lostAt), [lostAt]);

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
      photoUri,
    };
    setLastSubmitted(report);
    Alert.alert(
      "Report submitted (preview)",
      [
        `Category: ${category || "(none)"}`,
        `Description: ${description || "(none)"}`,
        `Date lost: ${formatDateTime(lostAt)}`,
        `Location: ${location || "(none)"}`,
        `Photo: ${photoUri || "(none)"}`,
      ].join("\n"),
    );
  }

  if (isCameraOpen) {
    return (
      <CameraCapture
        onCancel={() => setIsCameraOpen(false)}
        onCaptured={(uri) => {
          setPhotoUri(uri);
          setIsCameraOpen(false);
        }}
      />
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
            accessibilityRole="button"
            onPress={() => setIsCameraOpen(true)}
            style={({ pressed }) => [
              styles.fieldCard,
              styles.fieldCardStack,
              pressed && styles.fieldCardPressed,
            ]}
          >
            <Text style={styles.fieldLabel}>Photo</Text>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
            ) : (
              <Text style={styles.fieldPlaceholder}>Take a photo of the item</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setCategoryOpen(true)}
            style={({ pressed }) => [styles.fieldCard, pressed && styles.fieldCardPressed]}
          >
            <View style={styles.fieldCopy}>
              <Text style={styles.fieldLabel}>Category</Text>
              <Text style={category ? styles.fieldValue : styles.fieldPlaceholder}>
                {category || "Select a category"}
              </Text>
            </View>
            <SymbolView
              name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
              tintColor={MAIZE}
              size={18}
              fallback={<Text style={styles.chevronFallback}>›</Text>}
            />
          </Pressable>

          <View style={[styles.fieldCard, styles.fieldCardStack]}>
            <Text style={styles.fieldLabel}>Item description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Any identifying details: color, stickers, name, brand..."
              placeholderTextColor="#8A7310"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={openDatePicker}
            style={({ pressed }) => [styles.fieldCard, pressed && styles.fieldCardPressed]}
          >
            <View style={styles.fieldCopy}>
              <Text style={styles.fieldLabel}>Estimated date lost</Text>
              <Text style={styles.fieldValue}>{dateLabel}</Text>
            </View>
            <SymbolView
              name={{ ios: "calendar", android: "calendar_month", web: "calendar_month" }}
              tintColor={MAIZE}
              size={22}
              fallback={<Text style={styles.chevronFallback}>▣</Text>}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setLocationDraft(location);
              setLocationOpen(true);
            }}
            style={({ pressed }) => [styles.fieldCard, pressed && styles.fieldCardPressed]}
          >
            <View style={styles.fieldCopy}>
              <Text style={styles.fieldLabel}>Location lost</Text>
              <Text style={location ? styles.fieldValue : styles.fieldPlaceholder}>
                {location ||
                  (locationLoading ? "Finding current location..." : "Add a campus location")}
              </Text>
            </View>
            <SymbolView
              name={{ ios: "mappin.and.ellipse", android: "location_on", web: "location_on" }}
              tintColor={MAIZE}
              size={22}
              fallback={<Text style={styles.chevronFallback}>⌖</Text>}
            />
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
              <Text style={styles.previewLine}>
                Photo: {lastSubmitted.photoUri || "(none)"}
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
              tintColor={MAIZE}
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
              This starts as your current location. You can edit it.
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
                locationTouchedRef.current = true;
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
  descriptionInput: {
    marginTop: 10,
    backgroundColor: MAIZE_SOFT,
    borderRadius: 14,
    minHeight: 112,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: BLUE,
  },
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    gap: 6,
    borderLeftWidth: 5,
    borderLeftColor: MAIZE,
    ...fieldShadow,
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
