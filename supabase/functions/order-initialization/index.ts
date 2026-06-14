import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const body = await req.json();

    const {
      user_id,
      level_id,
      amount,
      provider,
      phone,
    } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate unique reference
    const transaction_ref =
      crypto.randomUUID();

    // -------------------------
    // PAYCHANGU INITIALIZATION
    // -------------------------

    const paychanguResponse =
      await fetch(
        "https://api.paychangu.com/payment",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get(
              "PAYCHANGU_SECRET_KEY"
            )}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            amount,
            currency: "MWK",
            tx_ref: transaction_ref,

            callback_url:
              `${Deno.env.get(
                "SITE_URL"
              )}/payment-success`,

            return_url:
              `${Deno.env.get(
                "SITE_URL"
              )}/payment-success`,
          }),
        }
      );

    const paychanguData =
      await paychanguResponse.json();

    if (!paychanguResponse.ok) {
      return new Response(
        JSON.stringify(paychanguData),
        {
          status: 400,
        }
      );
    }

    // -------------------------
    // SAVE PAYMENT
    // -------------------------

    const { error } =
      await supabase
        .from("payments")
        .insert({
          user_id,
          level_id,
          amount,
          transaction_ref,
          provider,
          phone,
          status: "pending",
          checkout_url:
            paychanguData.checkout_url,
        });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url:
          paychanguData.checkout_url,
        transaction_ref,
      }),
      {
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      }),
      {
        status: 500,
      }
    );
  }
});