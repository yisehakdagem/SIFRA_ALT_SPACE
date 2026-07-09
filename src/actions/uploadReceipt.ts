"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadReceipt(formData: FormData) {
  const supabase = await createClient();

  const orderId = formData.get("order_id") as string;
  const file = formData.get("receipt") as File;

  if (!file || !orderId) {
    throw new Error("Missing file or order ID");
  }

  // Upload file to Supabase Storage bucket 'receipts'
  const fileName = `${orderId}_${Date.now()}.${file.name.split(".").pop()}`;
  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(fileName, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("Failed to upload receipt");
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(fileName);
  const receiptUrl = urlData.publicUrl;

  // Insert into payment_receipts
  const { error: receiptError } = await supabase
    .from("payment_receipts")
    .insert({
      order_id: orderId,
      receipt_url: receiptUrl,
      payment_reference: "",
      verification_status: "Pending",
    });

  if (receiptError) {
    console.error("Receipt record error:", receiptError);
    throw new Error("Failed to save receipt record");
  }

  return { success: true, receiptUrl };
}