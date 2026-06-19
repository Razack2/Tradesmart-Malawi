import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Missing Supabase environment variables"
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const payload = await req.json();

    console.log(
      "PAYCHANGU WEBHOOK:",
      JSON.stringify(payload, null, 2)
    );

    // Support multiple possible payload formats
    const transactionId =
      payload?.transaction_id ||
      payload?.data?.transaction_id ||
      payload?.data?.tx_ref ||
      payload?.tx_ref;

    const status =
      payload?.status ||
      payload?.data?.status;

    if (!transactionId) {
      return new Response(
        JSON.stringify({
          error:
            "Missing transaction identifier in webhook payload",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    // Ignore failed payments
    if (
      status &&
      status.toLowerCase() !== "success"
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          message:
            "Payment not successful, ignored",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const {
      data: subscription,
      error: subscriptionError,
    } = await supabase
      .from("subscriptions")
      .select("*")
      .eq(
        "transaction_ref",
        transactionId
      )
      .single();

    if (
      subscriptionError ||
      !subscription
    ) {
      console.error(
        "Subscription not found",
        subscriptionError
      );

      return new Response(
        JSON.stringify({
          error:
            "Subscription not found",
          transactionId,
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    // Prevent duplicate activation
    if (
      subscription.status === "active"
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          message:
            "Subscription already active",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const startsAt = new Date();

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + 30
    );

    const { error: updateError } =
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          starts_at:
            startsAt.toISOString(),
          expires_at:
            expiresAt.toISOString(),
        })
        .eq(
          "transaction_ref",
          transactionId
        );

    if (updateError) {
      console.error(updateError);

      return new Response(
        JSON.stringify({
          error:
            updateError.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    console.log(
      "✅ Subscription activated:",
      transactionId
    );

    return new Response(
      JSON.stringify({
        success: true,
        transactionId,
        status: "active",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (err) {
    console.error(
      "WEBHOOK ERROR:",
      err
    );

    return new Response(
      JSON.stringify({
        error: String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});