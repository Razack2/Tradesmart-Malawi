import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.28.0?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      user_id,
      amount,
      provider,
      phone,
      subscription_type,
    } = await req.json();

    if (
      !user_id ||
      !amount ||
      !provider ||
      !phone ||
      !subscription_type
    ) {
      return new Response(
        JSON.stringify({ error: "Missing payment parameters." }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const transaction_ref = crypto.randomUUID();

    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id,
        amount,
        provider,
        phone,
        status: "pending",
        transaction_ref,
      })
      .select()
      .single();

    if (error) {
      console.error("DB ERROR:", error);

      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (err) {
    console.error("FUNCTION ERROR:", err);

    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});