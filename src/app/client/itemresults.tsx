import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { findMatchingItems, getCatalogImageUrl } from "@/lib/campus/catalog-service";
import type { ItemCategory } from "@/lib/constants/item-categories";
import type { CatalogItem } from "@/lib/types/database";
import { BLUE, MAIZE, MAIZE_SOFT } from "@/styles/theme";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const GAP = 12;
const ITEM_WIDTH = (width - (GAP * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

export default function ItemResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Robust param parsing
      if (!params.buildingIds || !params.lostFrom || !params.lostUntil) {
        setLoading(false);
        return;
      }

      const buildingIds = JSON.parse(params.buildingIds as string) as number[];
      const lostFrom = params.lostFrom as string;
      const lostUntil = params.lostUntil as string;
      const ticketDescription = (params.ticketDescription as string) || "";
      const category = params.category as ItemCategory;

      const matches = await findMatchingItems({
        buildingIds,
        lostFrom,
        lostUntil,
        ticketDescription,
        category,
        limit: 20
      });

      setItems(matches);
    } catch (err) {
      console.error("Found: Error loading matches:", err);
      setError("Unable to complete search. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [params.buildingIds, params.lostFrom, params.lostUntil, params.ticketDescription, params.category]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const renderItem = ({ item }: { item: CatalogItem }) => {
    const imageUrl = getCatalogImageUrl(item.image_path);
    
    return (
      <Pressable 
        style={styles.itemCard}
        onPress={() => {
            // Future: Navigate to detail view
        }}
      >
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.itemImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage]}>
             <SymbolView 
                name={{ ios: "photo", android: "image", web: "image" }} 
                tintColor={BLUE} 
                size={32} 
            />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen options={{ headerShown: false, title: "Matches" }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <SymbolView 
            name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }} 
            tintColor="#FFF" 
            size={24} 
          />
        </Pressable>
        <Text style={styles.headerTitle}>Potential Matches</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={MAIZE} />
          <Text style={styles.loadingText}>Searching for matches...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => loadMatches()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerContainer}>
          <SymbolView 
            name={{ ios: "questionmark.circle", android: "help_outline", web: "help_outline" }} 
            tintColor={MAIZE} 
            size={64} 
          />
          <Text style={styles.emptyTitle}>No matches found</Text>
          <Text style={styles.emptySubtitle}>
            We couldn't find any items matching your description near those locations.
          </Text>
          <Pressable 
            style={styles.homeActionButton} 
            onPress={() => router.push("/")}
          >
            <Text style={styles.homeActionText}>Back to Home</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.columnWrapper}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            // Pagination logic would go here
          }}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={MAIZE} style={{ margin: 20 }} /> : <View />}
        />
      )}

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    marginLeft: 10,
  },
  gridContent: {
    padding: GAP,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    gap: GAP,
    marginBottom: GAP,
  },
  itemCard: {
    width: ITEM_WIDTH,
    aspectRatio: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    backgroundColor: MAIZE_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 15,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: MAIZE,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: BLUE,
    fontWeight: "700",
  },
  emptyTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
  },
  emptySubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 30,
  },
  homeActionButton: {
    backgroundColor: MAIZE,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  homeActionText: {
    color: BLUE,
    fontSize: 16,
    fontWeight: "800",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
});
