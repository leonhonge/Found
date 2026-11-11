import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Image } from "expo-image";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useRef, useState } from "react";

import { CameraCapture } from "@/components/camera-capture";
import { lostStyles } from "@/lib/admin-lost-styles";
import { getCurrentLocationLabel } from "@/lib/current-location";
import {
  ITEM_CATEGORIES,
  isItemCategory,
  type ItemCategory,
} from "@/lib/item-categories";
import { requestImageDescription } from "@/lib/requestImageDescription";
import { MAIZE } from "@/lib/theme";
import { addAdminTicket } from "@/lib/tickets-store";
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

const CATEGORIES = ITEM_CATEGORIES;

type Category = ItemCategory;

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
  return isItemCategory(value);
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
  const [descriptionDraft, setDescriptionDraft] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [descriptionConfirmOpen, setDescriptionConfirmOpen] = useState(false);
  const [descriptionEditOpen, setDescriptionEditOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [webDateOpen, setWebDateOpen] = useState(false);
  const [webDateDraft, setWebDateDraft] = useState("");
  const [pickerMode, setPickerMode] = useState<
    "date" | "time" | "datetime" | null
  >(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const locationTouchedRef = useRef(false);

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
    addAdminTicket(report);
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
    setLostAt(new Date());
    setLocation("");
    setLocationDraft("");
    setPhotoUri(null);
    setDescriptionDraft("");
    setPickerMode(null);
    setIsIdentifying(false);
    locationTouchedRef.current = true; // don't let auto-location refill it
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

  async function fillDetailsFromPhoto(imageBase64?: string) {
    if (!imageBase64) {
      return;
    }

    setIsIdentifying(true);
    try {
      const details = await requestImageDescription(imageBase64, "image/jpeg");
      if (details.description) {
        setDescription(details.description);
      }
      if (isCategory(details.category)) {
        setCategory(details.category);
      }
    } catch {
      Alert.alert(
        "Could not identify item",
        "You can still choose a category and write a description.",
      );
    } finally {
      setIsIdentifying(false);
    }
  }

  if (isCameraOpen) {
    return (
      <CameraCapture
        onCancel={() => setIsCameraOpen(false)}
        onCaptured={(uri, imageBase64) => {
          setPhotoUri(uri);
          setIsCameraOpen(false);
          void fillDetailsFromPhoto(imageBase64);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
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
            onPress={() => setIsCameraOpen(true)}
            style={({ pressed }) => [
              styles.fieldCard,
              styles.fieldCardStack,
              pressed && styles.fieldCardPressed,
            ]}
          >
            <Text style={styles.fieldLabel}>Photo</Text>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.photoPreview}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.fieldPlaceholder}>
                Take a photo of the item
              </Text>
            )}
          </Pressable>

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
                {category ||
                  (isIdentifying
                    ? "Identifying from photo..."
                    : "Select a category")}
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

          <Pressable
            accessibilityRole="button"
            onPress={() => setDescriptionConfirmOpen(true)}
            style={({ pressed }) => [
              styles.fieldCard,
              styles.fieldCardStack,
              pressed && styles.fieldCardPressed,
            ]}
          >
            <Text style={styles.fieldLabel}>Item description</Text>
            <Text
              style={
                description
                  ? styles.descriptionPreview
                  : [styles.descriptionPreview, styles.fieldPlaceholder]
              }
            >
              {description ||
                (isIdentifying
                  ? "Identifying from photo..."
                  : "Any identifying details: color, stickers, name, brand...")}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={openDatePicker}
            style={({ pressed }) => [
              styles.fieldCard,
              pressed && styles.fieldCardPressed,
            ]}
          >
            <View style={styles.fieldCopy}>
              <Text style={styles.fieldLabel}>Estimated date lost</Text>
              <Text style={styles.fieldValue}>{dateLabel}</Text>
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

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setLocationDraft(location);
              setLocationOpen(true);
            }}
            style={({ pressed }) => [
              styles.fieldCard,
              pressed && styles.fieldCardPressed,
            ]}
          >
            <View style={styles.fieldCopy}>
              <Text style={styles.fieldLabel}>Location lost</Text>
              <Text
                style={location ? styles.fieldValue : styles.fieldPlaceholder}
              >
                {location ||
                  (locationLoading
                    ? "Finding current location..."
                    : "Add a campus location")}
              </Text>
            </View>
            <SymbolView
              name={{
                ios: "mappin.and.ellipse",
                android: "location_on",
                web: "location_on",
              }}
              tintColor={MAIZE}
              size={22}
              fallback={<Text style={styles.chevronFallback}>⌖</Text>}
            />
          </Pressable>
        </ScrollView>

        {Platform.OS !== "web" && pickerMode ? (
          <View
            style={Platform.OS === "ios" ? styles.iosPickerWrap : undefined}
          >
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

      <Modal visible={descriptionConfirmOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDescriptionConfirmOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit description?</Text>
            <Text style={styles.modalHint}>
              Do you want to make changes to the item description?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalSecondary}
                onPress={() => setDescriptionConfirmOpen(false)}
              >
                <Text style={styles.modalSecondaryText}>Keep as is</Text>
              </Pressable>
              <Pressable
                style={styles.modalSave}
                onPress={() => {
                  setDescriptionDraft(description);
                  setDescriptionConfirmOpen(false);
                  setDescriptionEditOpen(true);
                }}
              >
                <Text style={styles.modalSaveText}>Make changes</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={descriptionEditOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDescriptionEditOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Item description</Text>
            <Text style={styles.modalHint}>
              Edit the description, then save.
            </Text>
            <TextInput
              style={[styles.modalInput, styles.descriptionModalInput]}
              placeholder="Any identifying details: color, stickers, name, brand..."
              placeholderTextColor="#8A7310"
              multiline
              textAlignVertical="top"
              value={descriptionDraft}
              onChangeText={setDescriptionDraft}
              autoFocus
            />
            <Pressable
              style={styles.modalSave}
              onPress={() => {
                setDescription(descriptionDraft.trim());
                setDescriptionEditOpen(false);
              }}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </Pressable>
          </Pressable>
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

const styles = lostStyles;