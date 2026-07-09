"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMenuData() {
  const supabase = await createClient();

  // Fetch active categories
  const { data: categories, error: catError } = await supabase
    .from("menu_categories")
    .select("id, name, slug")
    .eq("active", true)
    .order("sort_order");

  if (catError) {
    console.error("Category fetch error:", catError);
    throw new Error("Failed to load categories");
  }

  // Fetch available menu items with their category slug
  const { data: items, error: itemError } = await supabase
    .from("menu_items")
    .select(`
      id,
      name,
      price,
      description,
      image_url,
      featured,
      category:menu_categories(slug, name)
    `)
    .eq("available", true)
    .order("name");

  if (itemError) {
    console.error("Item fetch error:", itemError);
    throw new Error("Failed to load menu items");
  }

  return {
    categories: categories ?? [],
    items: items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image_url,
      category: item.category?.name ?? "Uncategorized",
      slug: item.category?.slug ?? "uncategorized",
    })) ?? [],
  };
}