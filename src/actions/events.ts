"use server";

import { createClient } from "@/lib/supabase/server";

export async function getEventsData() {
  const supabase = await createClient();

  const { data: upcoming, error: upError } = await supabase
    .from("events")
    .select("*")
    .eq("status", "Upcoming")
    .order("event_date", { ascending: true });

  const { data: past, error: pastError } = await supabase
    .from("events")
    .select("*")
    .eq("status", "Past")
    .order("event_date", { ascending: false });

  if (upError || pastError) {
    console.error("Event fetch error:", upError || pastError);
    throw new Error("Failed to load events");
  }

  return {
    upcoming: upcoming ?? [],
    past: past ?? [],
  };
}