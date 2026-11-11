import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { MAIZE } from "@/lib/theme";
import { ticketStyles } from "@/lib/ticket-styles";
import { getAdminTickets, subscribeTickets, type SubmittedAdminTicket } from "@/lib/tickets-store";

function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function TicketCard({ ticket }: { ticket: SubmittedAdminTicket }) {
  return (
    <View style={styles.previewCard}>
      {ticket.photoUri ? (
        <Image source={{ uri: ticket.photoUri }} style={styles.photoPreview} contentFit="cover" />
      ) : null}
    </View>
  );
}

export default function TicketsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<SubmittedAdminTicket[]>(() => getAdminTickets());

  useEffect(() => {
    return subscribeTickets(() => {
      setTickets(getAdminTickets());
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen options={{ headerShown: false, title: "Tickets" }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Potential Matches</Text>
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

const styles = ticketStyles