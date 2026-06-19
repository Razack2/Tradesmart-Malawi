import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paychanguKey = Deno.env.get("PAYCHANGU_SECRET_KEY");

    if (!supabaseUrl || !serviceKey || !paychanguKey) {
      return new Response(
        JSON.stringify({ error: "Missing environment variables" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { transaction_id, level_id, user_id } = await req.json();

    if (!transaction_id || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 1. VERIFY PAYMENT
    const verifyRes = await fetch(
      `https://api.paychangu.com/verify-payment/${transaction_id}`,
      {
        headers: {
          Authorization: `Bearer ${paychanguKey}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || verifyData?.data?.status !== "success") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment not confirmed",
          provider_response: verifyData,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. FETCH USER
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("unlocked_levels")
      .eq("id", user_id)
      .single();

    if (userError) {
      return new Response(
        JSON.stringify({ error: userError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. UPDATE ACCESS
    const updatedLevels = Array.from(
      new Set([...(user?.unlocked_levels || []), level_id])
    );

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        unlocked_levels: updatedLevels,
        subscription: "paid",
      })
      .eq("id", user_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and access granted",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});