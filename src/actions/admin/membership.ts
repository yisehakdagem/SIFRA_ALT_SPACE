"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminUser, hasPermission } from "@/lib/admin-auth";
import { logAuditAction } from "@/lib/audit-log";

export async function getMembershipData() {
  const adminUser = await getAdminUser();

  if (!adminUser || !(await hasPermission("can_view_memberships"))) {
    throw new Error("Unauthorized: You do not have permission to view memberships");
  }

  const supabase = await createClient();

  // Get all plans (active and inactive)
  const { data: plans, error: plansError } = await supabase
    .from("membership_plans")
    .select("*")
    .order("price");

  if (plansError) throw new Error("Failed to load plans");

  // Get active memberships (join with customer_accounts and profiles for name)
  // For now, we'll just get memberships with customer id; we'll fetch names separately
  const { data: memberships, error: membershipsError } = await supabase
    .from("memberships")
    .select(`
      id,
      start_date,
      end_date,
      status,
      customer_id,
      plan_id
    `)
    .eq("status", "Active");

  if (membershipsError) throw new Error("Failed to load memberships");

  // To get customer names, we'd need to join profiles. For simplicity, we'll mock names later.
  // We'll return the raw data and handle display on the client with a mapping.

  return { plans, memberships };
}

export async function updatePlan(planId: string, data: any) {
  const adminUser = await getAdminUser();

  if (!adminUser || !(await hasPermission("can_manage_memberships"))) {
    throw new Error("Unauthorized: You do not have permission to manage memberships");
  }

  // Input validation
  if (!planId || typeof planId !== "string") {
    throw new Error("Invalid plan ID");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid plan data");
  }

  // Validate required fields
  if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim().length === 0)) {
    throw new Error("Plan name is required and must be a non-empty string");
  }

  if (data.price !== undefined && (typeof data.price !== "number" || data.price < 0)) {
    throw new Error("Price must be a non-negative number");
  }

  if (data.duration_days !== undefined && (typeof data.duration_days !== "number" || data.duration_days <= 0)) {
    throw new Error("Duration must be a positive number");
  }

  const supabase = await createClient();

  // Get current plan for audit log
  const { data: currentPlan } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!currentPlan) {
    throw new Error("Plan not found");
  }

  const { error } = await supabase
    .from("membership_plans")
    .update(data)
    .eq("id", planId);

  if (error) throw new Error("Failed to update plan");

  // Log audit action
  await logAuditAction({
    user_id: adminUser.user.id,
    staff_id: adminUser.staff.id,
    action: "update",
    table_name: "membership_plans",
    record_id: planId,
    old_values: currentPlan,
    new_values: data,
  });

  return { success: true };
}

export async function addPlan(data: any) {
  const adminUser = await getAdminUser();

  if (!adminUser || !(await hasPermission("can_manage_memberships"))) {
    throw new Error("Unauthorized: You do not have permission to manage memberships");
  }

  // Input validation
  if (!data || typeof data !== "object") {
    throw new Error("Invalid plan data");
  }

  // Validate required fields
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    throw new Error("Plan name is required and must be a non-empty string");
  }

  if (data.price === undefined || typeof data.price !== "number" || data.price < 0) {
    throw new Error("Price is required and must be a non-negative number");
  }

  if (!data.duration_days || typeof data.duration_days !== "number" || data.duration_days <= 0) {
    throw new Error("Duration is required and must be a positive number");
  }

  if (data.benefits && !Array.isArray(data.benefits)) {
    throw new Error("Benefits must be an array");
  }

  const supabase = await createClient();

  const { data: newPlan, error } = await supabase
    .from("membership_plans")
    .insert(data)
    .select("id")
    .single();

  if (error) throw new Error("Failed to add plan");

  // Log audit action
  await logAuditAction({
    user_id: adminUser.user.id,
    staff_id: adminUser.staff.id,
    action: "create",
    table_name: "membership_plans",
    record_id: newPlan.id,
    new_values: data,
  });

  return { success: true, id: newPlan.id };
}