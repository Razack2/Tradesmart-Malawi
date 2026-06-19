import { supabase } from "@/lib/supabaseClient";

export async function createPayment({
  userId,
  amount,
  provider,
  phone,
}: {
  userId: string;
  amount: number;
  provider: string;
  phone: string;
}) {
  const response = await supabase.functions.invoke("create-payment", {
    body: {
      user_id: userId,
      amount,
      provider,
      phone,
      subscription_type: "premium",
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

export async function cancelSubscription({ userId }: { userId: string }) {
  try {
    const { data: existingSub, error: selectErr } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (selectErr && selectErr.code !== "PGRST116") {
      console.warn("Could not select subscription:", selectErr.message || selectErr);
    }

    if (existingSub) {
      const { error: updErr } = await supabase
        .from("subscriptions")
        .update({ status: "inactive", expires_at: new Date().toISOString() })
        .eq("id", existingSub.id);

      if (updErr) {
        console.error("Failed to update subscription:", updErr);
        throw updErr;
      }
    }

    const { error: profileErr } = await supabase
      .from("user_profiles")
      .update({ subscription: "free", has_active_subscription: false, unlocked_levels: [] })
      .eq("id", userId);

    if (profileErr) {
      console.error("Failed to update user profile on cancellation:", profileErr);
      throw profileErr;
    }

    return true;
  } catch (err) {
    throw err;
  }
}