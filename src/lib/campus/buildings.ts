import { supabase } from "@/lib/supabase/client";

export type Building = { id: number; name: string; address: string };

export async function getBuildings(): Promise<Building[]> {
  const { data, error } = await supabase
    .from("front_desk_buildings")
    .select("id, name, address")
    .order("name");
  if (error) throw error;
  return data ?? [];
}