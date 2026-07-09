"use server";

import { createClient } from "@/lib/supabase/server";
import { validateName, validatePhone, validateEmail } from "@/lib/validation";

export async function placeOrder(formData: {
  name: string;
  phone: string;
  email?: string;
  pickupTime: string;
  paymentMethod: string;
  items: { id: number; name: string; quantity: number; price: string }[];
}) {
  // Input validation
  const nameValidation = validateName(formData.name, "Name");
  if (!nameValidation.success) {
    throw new Error(nameValidation.error);
  }

  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.success) {
    throw new Error(phoneValidation.error);
  }

  if (formData.email) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.success) {
      throw new Error(emailValidation.error);
    }
  }

  if (!formData.pickupTime || typeof formData.pickupTime !== "string") {
    throw new Error("Pickup time is required");
  }

  if (!formData.paymentMethod || typeof formData.paymentMethod !== "string") {
    throw new Error("Payment method is required");
  }

  const validPaymentMethods = ["Telebirr", "CBE", "Cash"];
  if (!validPaymentMethods.includes(formData.paymentMethod)) {
    throw new Error("Invalid payment method");
  }

  if (!Array.isArray(formData.items) || formData.items.length === 0) {
    throw new Error("At least one item is required");
  }

  for (const item of formData.items) {
    if (!item.id || typeof item.id !== "number") {
      throw new Error("Invalid item ID");
    }
    if (!item.quantity || typeof item.quantity !== "number" || item.quantity < 1) {
      throw new Error("Invalid item quantity");
    }
    if (!item.price || typeof item.price !== "string") {
      throw new Error("Invalid item price");
    }
  }

  const supabase = await createClient();

  const orderNumber = `SIF-${Date.now()}`;
  const subtotal = formData.items.reduce((sum, item) => {
    const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, ""));
    return sum + priceNum * item.quantity;
  }, 0);

  if (subtotal <= 0) {
    throw new Error("Invalid order total");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      guest_name: formData.name.trim(),
      guest_phone: formData.phone.trim(),
      guest_email: formData.email?.trim() || null,
      order_number: orderNumber,
      subtotal,
      total_amount: subtotal,
      payment_method: formData.paymentMethod,
      order_status: "Waiting Verification",
      pickup_time: formData.pickupTime,
      notes: "",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order creation error:", orderError);
    throw new Error("Failed to place order");
  }

  const orderItems = formData.items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.id,
    quantity: item.quantity,
    unit_price: parseFloat(item.price.replace(/[^0-9.]/g, "")),
    subtotal: parseFloat(item.price.replace(/[^0-9.]/g, "")) * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Order items insert error:", itemsError);
  }

  return { orderNumber };
}
