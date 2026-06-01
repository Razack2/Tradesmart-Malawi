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
  const response = await supabase.functions.invoke("create-payment", {
    body: JSON.stringify({
      user_id: userId,
      level_id: levelId,
      amount,
      provider,
      phone,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.error) {
    console.error("Payment creation error:", response.error);
    throw new Error(
      `Payment creation failed: ${response.error.message}`
    );
  }

  return response.data;
}