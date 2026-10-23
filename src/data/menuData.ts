
import { supabase } from "@/lib/supabase";

/* =========================
   TYPES
========================= */

export type FoodType = "veg" | "non-veg" | "egg";

export interface Category {
  id: string;
  name: string;
  restaurant_id: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_veg: boolean;
  is_available: boolean;
  category_name?: string;
  created_at?: string;
}

export interface ComboItem {
  id?: string;
  name: string;
  quantity: number;
  image_url?: string | null;
}

export interface MenuCombo {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  total_price: number;
  discount_price: number;
  image_url: string;
  is_available: boolean;
  category_id: string;
  category_name?: string;
  included_items: ComboItem[];
  created_at: string;
}

/* =========================
   INTERNAL TYPES
========================= */

interface RawComboItem {
  quantity?: number | null;
  menu_items:
    | {
        id?: string;
        name?: string | null;
        image_url?: string | null;
      }
    | {
        id?: string;
        name?: string | null;
        image_url?: string | null;
      }[]
    | null;
}

interface RawCombo {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  total_price: number | null;
  discount_price: number | null;
  image_url: string | null;
  is_available: boolean;
  category_id: string;
  created_at: string;
  menu_combo_items?: RawComboItem[] | null;
}

const PLACEHOLDER_IMAGE = "/placeholder.png";

/* =========================
   IMAGE HANDLER
========================= */

export const getMenuImageUrl = (path?: string | null): string => {
  if (!path?.trim()) return PLACEHOLDER_IMAGE;

  if (/^https?:\/\//i.test(path)) return path;

  const { data } = supabase.storage
    .from("menu-images")
    .getPublicUrl(path);

  return data?.publicUrl || PLACEHOLDER_IMAGE;
};

/* =========================
   CATEGORY FETCHER
========================= */

export const fetchCategories = async (
  restaurantId: string
): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("id, name, restaurant_id")
    .eq("restaurant_id", restaurantId)
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }

  return (data ?? []) as Category[];
};

/* =========================
   MENU ITEMS FETCHER
========================= */

export const fetchMenuItems = async (
  restaurantId: string
): Promise<MenuItem[]> => {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_available", true)
    .order("name");

  if (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }

  return (data ?? []) as MenuItem[];
};

/* =========================
   COMBO MAPPER
========================= */

const mapCombo = (
  raw: RawCombo,
  categoryNames: Map<string, string>
): MenuCombo => {
  const includedItems: ComboItem[] = (
    raw.menu_combo_items ?? []
  ).flatMap((junction) => {
    const linkedItems = Array.isArray(junction.menu_items)
      ? junction.menu_items
      : junction.menu_items
        ? [junction.menu_items]
        : [];

    return linkedItems.flatMap((item) => {
      if (!item.id || !item.name?.trim()) {
        return [];
      }

      return [
        {
          id: item.id,
          name: item.name,
          image_url: item.image_url ?? null,
          quantity: Math.max(1, Number(junction.quantity) || 1),
        },
      ];
    });
  });

  return {
    id: raw.id,
    restaurant_id: raw.restaurant_id,
    name: raw.name,
    description: raw.description ?? "",
    total_price: Number(raw.total_price ?? 0),
    discount_price: Number(raw.discount_price ?? 0),
    image_url: raw.image_url ?? "",
    is_available: raw.is_available,
    category_id: raw.category_id,
    category_name: categoryNames.get(raw.category_id) ?? "Uncategorized",
    included_items: includedItems,
    created_at: raw.created_at,
  };
};

/* =========================
   COMBOS FETCHER
========================= */

export const fetchMenuCombos = async (
  restaurantId: string
): Promise<MenuCombo[]> => {
  const [categoryResult, comboResult] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("id, name")
      .eq("restaurant_id", restaurantId),

    supabase
      .from("menu_combos")
      .select(`
        id,
        restaurant_id,
        name,
        description,
        total_price,
        discount_price,
        image_url,
        is_available,
        category_id,
        created_at,
        menu_combo_items (
          quantity,
          menu_items (
            id,
            name,
            image_url
          )
        )
      `)
      .eq("restaurant_id", restaurantId)
      .eq("is_available", true)
      .order("created_at", { ascending: false }),
  ]);

  if (categoryResult.error) {
    console.error("Error fetching combo categories:", categoryResult.error);
    throw categoryResult.error;
  }

  if (comboResult.error) {
    console.error("Error fetching combos and linked dishes:", comboResult.error);
    throw comboResult.error;
  }

  const categoryNames = new Map<string, string>(
    (categoryResult.data ?? []).map((category) => [
      category.id,
      category.name,
    ])
  );

  return ((comboResult.data ?? []) as unknown as RawCombo[]).map((combo) =>
    mapCombo(combo, categoryNames)
  );
};

/* =========================
   COMPLETE MENU FETCHER
========================= */

export const fetchMenuWithCategories = async (
  restaurantId: string
) => {
  const [categories, items, combos] = await Promise.all([
    fetchCategories(restaurantId),
    fetchMenuItems(restaurantId),
    fetchMenuCombos(restaurantId),
  ]);

  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name])
  );

  const itemsWithCategory: MenuItem[] = items.map((item) => ({
    ...item,
    category_name:
      categoryNames.get(item.category_id) ?? "Uncategorized",
  }));

  return {
    categories,
    items: itemsWithCategory,
    combos,
  };
};
