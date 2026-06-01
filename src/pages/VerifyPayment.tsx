import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyPaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const ref = params.get("ref");
  const levelId = params.get("level");

  useEffect(() => {
    const verify = async () => {
      if (!ref) return;

      // 1. CHECK PAYMENT STATUS FROM DB
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("transaction_ref", ref)
        .single();

      if (data?.status === "confirmed") {
        navigate(`/level/${levelId}`);
      } else {
        navigate("/upgrade?error=payment_failed");
      }
    };

    verify();
  }, []);

  return (
    <div className="p-10 text-center">
      Verifying payment...
    </div>
  );
}