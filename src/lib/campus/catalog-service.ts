import type { ItemCategory } from "@/lib/constants/item-categories";
import { supabase } from "@/lib/supabase/client";
import type { CatalogItem } from "@/lib/types/database";

const CATALOG_BUCKET = "catalog-images";

/**
 * Resolves the full public URL for an item's image path.
 */
export function getCatalogImageUrl(path: string | null): string | null {
  if (!path) return null;
  
  const { data } = supabase.storage
    .from(CATALOG_BUCKET)
    .getPublicUrl(path);
    
  return data.publicUrl;
}

/**
 * Fetches items from the catalog that match the user's lost report criteria.
 * Filters by building IDs, date range, and category, then uses AI to verify semantic matches.
 */
export async function findMatchingItems(params: {
  buildingIds: number[];
  lostFrom: string;
  lostUntil: string;
  ticketDescription: string;
  category?: ItemCategory | "";
  limit?: number;
}): Promise<CatalogItem[]> {
  const { buildingIds, lostFrom, lostUntil, ticketDescription, category, limit = 50 } = params;
  console.log("Found: findMatchingItems called with:", { buildingIds, lostFrom, lostUntil, ticketDescription, category });

  if (buildingIds.length === 0) {
    console.warn("Found: No building IDs provided for matching.");
    return [];
  }

  // 1. Initial Database Query (Broad filtering by location, status, and category)
  let query = supabase
    .from("catalog_items")
    .select(`
      *,
      front_desk_buildings (
        name
      )
    `)
    .in("building_id", buildingIds)
    .eq("status", "available")
    .gte("found_at", lostFrom) // Only items found AFTER the user lost theirs
    .lte("found_at", new Date().toISOString()) // Safety: items found up to now
    .order("found_at", { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq("category", category);
  }

  const { data: potentialItems, error } = await query;
  console.log("Found: Database returned potential matches:", potentialItems?.length || 0);

  if (error) {
    console.error("Found: Error fetching potential matches:", error.message);
    throw error;
  }

  if (!potentialItems || potentialItems.length === 0) return [];

  // 2. AI Semantic Verification
  // We send the ticket description and potential item descriptions to Gemini
  const { data: verificationResult, error: verificationError } = await supabase.functions.invoke("match-items", {
    body: {
      ticketDescription,
      potentialMatches: potentialItems.map(item => ({
        id: item.id,
        description: item.description
      }))
    }
  });

  if (verificationError) {
    console.warn("Found: AI verification failed, returning all broad matches:", verificationError.message);
    return potentialItems as CatalogItem[];
  }

  const matchingIds = verificationResult?.matchingIds || [];
  console.log("Found: AI identified matching IDs:", matchingIds);
  
  // Return only the items that Gemini flagged as potential matches
  const filteredItems = potentialItems.filter(item => matchingIds.includes(item.id));
  console.log("Found: Filtered items count:", filteredItems.length);
  
  return filteredItems as CatalogItem[];
}

/**
 * Fetches all available items in the catalog for a specific building.
 */
export async function fetchCatalogByBuilding(buildingId: number): Promise<CatalogItem[]> {
  const { data, error } = await supabase
    .from("catalog_items")
    .select(`
      *,
      front_desk_buildings (
        name
      )
    `)
    .eq("building_id", buildingId)
    .eq("status", "available")
    .order("found_at", { ascending: false });

  if (error) {
    console.error("Found: Error fetching building catalog:", error.message);
    throw error;
  }

  return data as CatalogItem[];
}

/**
 * Uploads an image to the catalog bucket.
 * Expects a local URI (mobile) or File/Blob (web).
 */
export async function uploadCatalogImage(uri: string): Promise<string> {
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
  const filePath = `items/${fileName}`;

  // For React Native, we need to fetch the file content first
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from(CATALOG_BUCKET)
    .upload(filePath, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    console.error("Found: Error uploading image:", error.message);
    throw error;
  }

  return filePath;
}

/**
 * Creates a new found item entry in the catalog.
 */
export async function createCatalogItem(item: Omit<CatalogItem, "id" | "created_at" | "front_desk_buildings">): Promise<CatalogItem> {
  const { data, error } = await supabase
    .from("catalog_items")
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error("Found: Error creating catalog item:", error.message);
    throw error;
  }

  return data as CatalogItem;
}
