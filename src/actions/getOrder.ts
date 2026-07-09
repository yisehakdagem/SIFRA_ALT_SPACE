"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrderByNumber(orderNumber: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
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
    .eq("order_number", orderNumber)
    .single();

  if (error || !data) {
    throw new Error("Order not found");
  }

  // Safely extract menu_item (it might come as an array)
  const safeItems = (data.order_items || []).map((item: any) => ({
    quantity: item.quantity,
    unit_price: item.unit_price,
    menu_item: Array.isArray(item.menu_item) ? (item.menu_item[0] || null) : item.menu_item,
  }));

  return {
    id: data.id,
    order_number: data.order_number,
    guest_name: data.guest_name,
    guest_phone: data.guest_phone,
    guest_email: data.guest_email,
    subtotal: data.subtotal,
    total_amount: data.total_amount,
    payment_method: data.payment_method,
    order_status: data.order_status,
    pickup_time: data.pickup_time,
    created_at: data.created_at,
    notes: data.notes,
    order_items: safeItems,
  };
}
