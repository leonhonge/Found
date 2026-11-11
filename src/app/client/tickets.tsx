import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { getTickets, subscribeTickets, type SubmittedTicket } from "@/lib/tickets-store";

const MAIZE = "#FFCB05";
const MAIZE_SOFT = "#FFF6CC";
const BLUE = "#00274C";
const BLUE_MID = "#1A3E66";

function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function TicketCard({ ticket }: { ticket: SubmittedTicket }) {
  return (
    <View style={styles.previewCard}>
      {ticket.photoUri ? (
        <Image source={{ uri: ticket.photoUri }} style={styles.photoPreview} contentFit="cover" />
      ) : null}
      <Text style={styles.previewTitle}>Ticket {ticket.id}</Text>
      <Text style={styles.previewLine}>Category: {ticket.category || "(none)"}</Text>
      <Text style={styles.previewLine}>Description: {ticket.description || "(none)"}</Text>
      <Text style={styles.previewLine}>
        Date lost: {formatDateTime(new Date(ticket.lostAt))}
      </Text>
      <Text style={styles.previewLine}>Location: {ticket.location || "(none)"}</Text>
      <Text style={styles.previewLine}>
        Submitted: {formatDateTime(new Date(ticket.submittedAt))}
      </Text>
    </View>
  );
}

export default function TicketsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<SubmittedTicket[]>(() => getTickets());

  useEffect(() => {
    return subscribeTickets(() => {
      setTickets(getTickets());
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false, title: "Tickets" }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Submitted tickets</Text>
        {tickets.length === 0 ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>No tickets yet</Text>
            <Text style={styles.previewLine}>
              Reports you submit will show up here so you can scroll through them.
            </Text>
          </View>
        ) : (
          tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        )}
      </ScrollView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
