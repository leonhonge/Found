export const ITEM_CATEGORIES = [
  "Water Bottle",
  "Charger",
  "Electronic Device",
  "Miscellaneous",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export function isItemCategory(value: string | undefined): value is ItemCategory {
  return ITEM_CATEGORIES.some((category) => category === value);
}
