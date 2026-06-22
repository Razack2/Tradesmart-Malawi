import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, password } = await req.json();

    // 1. CREATE USER
    const { data, error } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      });

    console.log("CREATE USER:", { data, error });

    if (error || !data?.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error?.message || "User creation failed",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const user = data.user;

    // 2. CREATE PROFILE (DO NOT CRASH FUNCTION IF THIS FAILS)
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: user.id,
        email: user.email,
        name,
        role: "student",
        subscription: "free",
        unlocked_levels: [],
        has_active_subscription: false,
      });

    if (profileError) {
      console.log("PROFILE ERROR:", profileError);
    }

    // 3. SEND EMAIL (DON'T BLOCK FUNCTION IF IT FAILS)
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Welcome to TradeSmart Malawi",
        html: `
          <h2>Welcome ${name}</h2>
          <p>Your account has been created successfully. You can now log in to your account.</p>

          <p style="margin-top: 24px;">
            <a href="https://tradesmartmw.netlify.app">
              <button style="padding: 12px 24px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Go to TradeSmart
              </button>
            </a>
          </p>
        `,
      });
    } catch (emailErr) {
      console.log("EMAIL ERROR:", emailErr);
    }

    // 4. RETURN SUCCESS
    return new Response(
      JSON.stringify({
        success: true,
        user,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("FATAL ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: String(err),
      }),
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