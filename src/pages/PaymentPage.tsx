import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";


import {
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PaymentPage() {
  const { levelId } = useParams();
  const { levels } = useCourses();
  const { user, upgradeSubscription } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] =
    useState<"idle" | "success" | "loading" | "failed">("idle");
  const [unlocking, setUnlocking] = useState(false);

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

  const handleBack = () => {
    navigate(-1);
  };

  //  UNLOCK AFTER PAYMENT SUCCESS
  useEffect(() => {
    if (status !== "success" || !level || unlocking) return;

    console.log("Payment success triggered, user:", user);
    setUnlocking(true);

    const unlock = async () => {
      console.log("Attempting to unlock level:", level.id);
      const ok = await upgradeSubscription(level.id);
      console.log("Unlock result:", ok);

      if (ok) {
        console.log("Unlock successful, navigating...");
        setTimeout(() => {
          navigate(`/level/${level.id}`, {
            state: { unlocked: true },
          });
        }, 1500);
      } else {
        console.log("Unlock failed");
        setStatus("failed");
        setUnlocking(false);
      }
    };

    unlock();
  }, [status, level, navigate, upgradeSubscription, user, unlocking]);

  if (!level) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <p className="text-destructive font-semibold">Invalid package</p>
        <Button onClick={handleBack} className="mt-4" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="border rounded-xl p-6 text-center">
        <CreditCard className="mx-auto mb-3 h-8 w-8" />

        <h1 className="text-2xl font-bold mb-2">
          Buy {level.name}
        </h1>

        <p className="text-muted-foreground mb-4">
          Price: {price}
        </p>

        {status === "idle" && (
          <>
            <div className="bg-muted p-4 rounded-lg mb-4 text-sm text-muted-foreground">
              Click "Pay Now" to complete your purchase. This is a test payment.
            </div>
            <Button 
              onClick={handleFakePayment}
              className="w-full"
              size="lg"
            >
              Pay Now
            </Button>
          </>
        )}

        {status === "loading" && (
          <div className="py-6">
            <Loader2 className="animate-spin mx-auto mb-3 h-8 w-8" />
            <p className="font-semibold mb-2">Processing payment...</p>
            <p className="text-sm text-muted-foreground">Please wait while we process your payment and unlock your access.</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-green-600 py-6">
            <CheckCircle className="mx-auto mb-3 h-8 w-8" />
            <p className="font-semibold mb-2">Payment successful!</p>
            <p className="text-sm text-green-600/80">Unlocking your {level.name} access...</p>
          </div>
        )}

        {status === "failed" && (
          <div className="py-6">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
            <p className="font-semibold text-destructive mb-2">Payment failed</p>
            <p className="text-sm text-muted-foreground mb-4">Unable to unlock your access. Please try again.</p>
            <Button 
              onClick={() => setStatus("idle")}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}