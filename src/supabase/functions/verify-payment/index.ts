/// <reference lib="deno.window" />
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { transaction_id, level_id, user_id } = await req.json();

  // 1. VERIFY WITH PAYCHANGU
  const verifyRes = await fetch(
    `https://api.paychangu.com/verify-payment/${transaction_id}`,
    {
      headers: {
        Authorization: `Bearer ${Deno.env.get("PAYCHANGU_SECRET_KEY")}`,
      },
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyData?.data?.status || verifyData.data.status !== "success") {
    return new Response(
      JSON.stringify({ success: false }),
      { status: 400 }
    );
  }

  // 2. FETCH USER CURRENT LEVELS
  const { data: user } = await supabase
    .from("user_profiles")
    .select("unlocked_levels")
    .eq("id", user_id)
    .single();

  const updatedLevels = Array.from(
    new Set([...(user?.unlocked_levels || []), level_id])
  );

  // 3. UPDATE USER ACCESS
  await supabase
    .from("user_profiles")
    .update({
      unlocked_levels: updatedLevels,
      subscription: "paid",
    })
    .eq("id", user_id);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  );
});