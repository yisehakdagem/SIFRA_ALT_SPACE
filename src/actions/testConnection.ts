"use server";

import { createClient } from "@/lib/supabase/server";

export async function testConnection() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("menu_categories").select("count", { count: "exact", head: true });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, count: data ?? 0 };
}