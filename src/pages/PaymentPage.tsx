import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";


import {
  CreditCard,
  Loader2,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PaymentPage() {
  const { levelId } = useParams();
  const { levels } = useCourses();
  const { user, upgradeSubscription } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] =
    useState<"idle" | "success" | "loading" | "failed">("idle");

  const level = levels.find((l) => l.id === levelId);

  const price =
    level?.name === "Intermediate"
      ? "MK15,000"
      : "MK30,000";

  const handleFakePayment = () => {
    setStatus("loading");

    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  // 🔥 UNLOCK AFTER PAYMENT SUCCESS
  useEffect(() => {
    if (status !== "success" || !level) return;

    const unlock = async () => {
      const ok = await upgradeSubscription(level.id);

      if (ok) {
        setTimeout(() => {
          navigate(`/level/${level.id}`, {
            state: { unlocked: true },
          });
        }, 1200);
      } else {
        setStatus("failed");
      }
    };

    unlock();
  }, [status]);

  if (!level) {
    return (
      <div className="p-6 text-center">
        Invalid package
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="border rounded-xl p-6 text-center">
        <CreditCard className="mx-auto mb-3" />

        <h1 className="text-2xl font-bold mb-2">
          Buy {level.name}
        </h1>

        <p className="text-muted-foreground mb-4">
          Price: {price}
        </p>

        {status === "idle" && (
          <Button onClick={handleFakePayment}>
            Pay Now
          </Button>
        )}

        {status === "loading" && (
          <div className="py-6">
            <Loader2 className="animate-spin mx-auto mb-2" />
            Processing payment...
          </div>
        )}

        {status === "success" && (
          <div className="text-green-600">
            <CheckCircle className="mx-auto mb-2" />
            Payment successful
          </div>
        )}

        {status === "failed" && (
          <div className="text-red-600">
            Payment failed
          </div>
        )}
      </div>
    </div>
  );
}