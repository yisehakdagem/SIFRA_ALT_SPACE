"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPaymentSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["telebirr_number", "cbe_number", "payment_instructions"]);

  if (error) {
    console.error("Settings fetch error:", error);
    // fallback
    return {
      telebirrNumber: "+251 9XX XXX XXX",
      cbeNumber: "+251 9XX XXX XXX",
      instructions: "Upload your payment receipt for verification.",
    };
  }

  const settings: any = {};
  data?.forEach((row) => {
    if (row.key === "telebirr_number") settings.telebirrNumber = row.value?.number || "+251 9XX XXX XXX";
    if (row.key === "cbe_number") settings.cbeNumber = row.value?.number || "+251 9XX XXX XXX";
    if (row.key === "payment_instructions") settings.instructions = row.value?.text || "Upload your payment receipt for verification.";
  });

  return {
    telebirrNumber: settings.telebirrNumber || "+251 9XX XXX XXX",
    cbeNumber: settings.cbeNumber || "+251 9XX XXX XXX",
    instructions: settings.instructions || "Upload your payment receipt for verification.",
  };
}