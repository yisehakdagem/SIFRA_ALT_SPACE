"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminUser, hasPermission } from "@/lib/admin-auth";
import { logAuditAction } from "@/lib/audit-log";

export async function getAdminOrders() {
  const adminUser = await getAdminUser();

  if (!adminUser || !(await hasPermission("can_view_orders"))) {
    throw new Error("Unauthorized: You do not have permission to view orders");
  }

  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      guest_name,
      guest_phone,
      guest_email,
      subtotal,
      total_amount,
      payment_method,
      order_status,
      pickup_time,
      created_at,
      notes,
      order_items (
        quantity,
        unit_price,
        menu_item:menu_items(name)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin orders fetch error:", error);
    throw new Error("Failed to load orders");
  }

  return orders ?? [];
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const adminUser = await getAdminUser();

  if (!adminUser || !(await hasPermission("can_manage_orders"))) {
    throw new Error("Unauthorized: You do not have permission to manage orders");
  }

  // Input validation
  if (!orderId || typeof orderId !== "string") {
    throw new Error("Invalid order ID");
  }

  if (!newStatus || typeof newStatus !== "string") {
    throw new Error("Invalid status");
  }

  const validStatuses = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid status value");
  }

  const supabase = await createClient();

  // Get current order for audit log
  const { data: currentOrder } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!currentOrder) {
    throw new Error("Order not found");
  }

  const { error } = await supabase
    .from("orders")
    .update({ order_status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    console.error("Update order status error:", error);
    throw new Error("Failed to update order");
  }

  // Log audit action
  await logAuditAction({
    user_id: adminUser.user.id,
    staff_id: adminUser.staff.id,
    action: "update",
    table_name: "orders",
    record_id: orderId,
    old_values: { order_status: currentOrder.order_status },
    new_values: { order_status: newStatus },
  });

  return { success: true };
}