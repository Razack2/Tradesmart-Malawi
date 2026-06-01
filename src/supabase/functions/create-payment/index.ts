/// <reference lib="deno.window" />
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { user_id, level_id, amount, provider, phone } = await req.json();

  if (!user_id || !level_id || !amount || !provider || !phone) {
    return new Response(
      JSON.stringify({ error: "Missing payment parameters." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const transaction_ref = crypto.randomUUID();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id,
      level_id,
      amount,
      provider,
      phone,
      status: "pending",
      transaction_ref,
    })
    .select()
    .single();

  if (error) {
    console.error("Create payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
