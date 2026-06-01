import { supabase } from "@/lib/supabaseClient";

export async function createPayment({
  userId,
  levelId,
  amount,
  provider,
  phone,
}: {
  userId: string;
  levelId: string;
  amount: number;
  provider: string;
  phone: string;
}) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      level_id: levelId,
      amount,
      provider,
      phone,
      status: "pending",
      transaction_ref: crypto.randomUUID(),
    })
    .select()
    .single();

  if (error) {
    console.error("Payment creation error:", error);
    throw error;
  }

  return data;
}