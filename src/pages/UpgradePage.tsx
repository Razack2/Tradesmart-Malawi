import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createPayment, cancelSubscription } from "@/services/PaymentService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

type PaymentMethod = "tnm" | "airtel" | null;

export default function UpgradePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(null);

  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] =
    useState<"idle" | "processing" | "success" | "failed">(
      "idle"
    );

  const [ref, setRef] = useState<string | null>(null);

  // =========================
  // VALIDATION
  // =========================
  const validate = () => {
    if (!paymentMethod) {
      setError("Select a payment method");
      return false;
    }

    const regex =
      paymentMethod === "tnm"
        ? /^08\d{8}$/
        : /^09\d{8}$/;

    if (!regex.test(phone)) {
      setError(
        paymentMethod === "tnm"
          ? "TNM number must start with 08 and be 10 digits"
          : "Airtel number must start with 09 and be 10 digits"
      );
      return false;
    }

    setError(null);
    return true;
  };

  // =========================
  // PAYMENT
  // =========================
  const handlePayment = async () => {
    if (!user) return;
    if (!validate()) return;

    setStatus("processing");

    try {
      const res = await createPayment({
        userId: user.id,
        amount: 5000, // monthly subscription
        provider: paymentMethod!,
        phone,
      });

      setRef(res.transaction_ref);
      setStatus("success");
    } catch (err) {
      setStatus("failed");
      setError("Payment failed. Try again.");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        Premium Subscription
      </h1>

      <p className="text-muted-foreground mb-6">
        Unlock all advanced lessons for MK5,000 per month.
        Get access to expert level content for free after subscribing.
         You can cancel your subscription at any time.
      </p>

      <p className="text-sm text-muted-foreground mb-6">
        Please note that this is a monthly subscription. You will be charged MK5,000 every month until you cancel your subscription.
      </p>

        <div className="text-sm text-muted-foreground mb-6">
         <p>Payment feature is currently done by contacting the administrator via WhatsApp.
           You will be provided with a reference number to confirm your payment.</p> 
          <p>Payment is processed via TNM Mpamba or Airtel Money.</p>
          <p>After payment, your Premium access will be activated within 24 hours.</p>
        </div>
      {/* CARD */}
      <div className="border rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          Monthly Plan
        </h2>

        <p className="text-2xl font-bold text-primary">
          MK10,000 / month
        </p>

        {/* PAYMENT METHOD */}
        <div className="space-y-2">
          <label className="font-medium text-sm">
            Payment Method
          </label>

          <div className="flex gap-3">
            <button
              onClick={() => setPaymentMethod("tnm")}
              className={`flex-1 p-3 border rounded-lg ${
                paymentMethod === "tnm"
                  ? "border-green-600 bg-green-50"
                  : ""
              }`}
            >
              TNM Mpamba
            </button>

            <button
              onClick={() => setPaymentMethod("airtel")}
              className={`flex-1 p-3 border rounded-lg ${
                paymentMethod === "airtel"
                  ? "border-green-600 bg-green-50"
                  : ""
              }`}
            >
              Airtel Money
            </button>
          </div>
        </div>

        {/* PHONE */}
        <div>
          <label className="text-sm font-medium">
            Phone Number
          </label>

          <Input
            maxLength={10}
            value={phone}

            onChange={(e) =>
              setPhone(
                e.target.value.replace(/\D/g, "")
              )
            }
            placeholder={
              paymentMethod === "tnm"
                ? "08XXXXXXXX"
                : "09XXXXXXXX"
            }
          />

          {error && (
            <p className="text-red-500 text-sm mt-1">
              {error}
            </p>
          )}
        </div>

        {user?.subscription === "paid" ? (
          <Button
            onClick={async () => {
              const ok = window.confirm("Cancel your subscription? This will revoke premium access.");
              if (!ok) return;

              setStatus("processing");
              try {
                await cancelSubscription({ userId: user.id });
                setStatus("success");
                // allow polling/realtime to refresh auth state; navigate back to dashboard
                setTimeout(() => navigate("/dashboard"), 700);
              } catch (err) {
                console.error(err);
                setStatus("failed");
                setError("Cancellation failed. Try again later.");
              }
            }}
            className="w-full"
          >
            Cancel Subscription
          </Button>
        ) : (
          <Button
            onClick={handlePayment}
            className="w-full"
            disabled={status === "processing"}
          >
            {status === "processing" ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Subscribe Now"
            )}
          </Button>
        )}
      </div>

      {/* SUCCESS DIALOG */}
      <Dialog open={status === "success"}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="text-green-600" />
              Subscription Created
            </DialogTitle>

            <DialogDescription>
  Your payment request has been created. Once payment is confirmed, your Premium access will be activated.

  <br />
  <br />

  You may also contact the administrator to confirm your subscription immediately.
</DialogDescription>
          </DialogHeader>

          {ref && (
            <div className="text-sm bg-muted p-3 rounded">
              Reference: {ref}
            </div>
          )}

      <div className="space-y-3 mt-4">

  {/* PRIMARY ACTION */}
  <Button
    onClick={() => navigate("/dashboard")}
    className="w-full flex items-center justify-center gap-2"
  >
    <CheckCircle className="w-4 h-4" />
    Go to Dashboard
  </Button>

  {/* SECONDARY ACTION */}
  <Button
    variant="outline"
    onClick={() =>
      window.open(
        `https://wa.me/26589606833?text=${encodeURIComponent(
          `Hello Admin, I have submitted a subscription request.\nReference: ${ref}\nUser: ${user?.email}`
        )}`,
        "_blank"
      )
    }
    className="w-full flex items-center justify-center gap-2 border-green-500 text-green-700 hover:bg-green-50"
  >
    <MessageCircle className="w-4 h-4" />
    Contact Administrator on WhatsApp
  </Button>

</div>

        </DialogContent>
      </Dialog>

      {/* ERROR */}
      {status === "failed" && (
        <div className="mt-4 text-red-600 flex items-center gap-2">
          <AlertCircle />
          Payment failed. Try again.
        </div>
      )}
    </div>
  );
}