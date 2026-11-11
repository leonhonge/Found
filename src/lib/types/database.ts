// src/lib/api.ts

export type Building = { id: number; name: string; address: string };

export type CatalogItem = {
  id: number;
  image_path: string | null;
  category: string;
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
  lost_from: string;
  lost_until: string;
  building_ids: number[];
  item_description: string;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'client';
  created_at: string;
};

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

