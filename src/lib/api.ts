// src/lib/api.ts
import { supabase } from "@/lib/supabase";

export type Building = { id: number; name: string; address: string };

export type CatalogItem = {
  id: number;
  image_path: string | null;
  description: string;
  found_at: string;            // ISO string from timestamptz
  building_id: number;
  location_detail: string | null;
  status: string;
  created_at: string;
  front_desk_buildings: { name: string } | null;  // present when you join
};

export type Ticket = {
  id: number;
  student_name: string;
  uniqname: string;
  lost_at: string;
  building_id: number | null;
  item_description: string;
  created_at: string;
};

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

