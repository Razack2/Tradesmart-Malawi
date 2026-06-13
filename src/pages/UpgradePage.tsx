import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createPayment } from "@/services/PaymentService";

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
      </p>

      {/* CARD */}
      <div className="border rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          Monthly Plan
        </h2>

        <p className="text-2xl font-bold text-primary">
          MK5,000 / month
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
              Your payment request has been created.
              Once confirmed, your Premium access
              will be activated.
            </DialogDescription>
          </DialogHeader>

          {ref && (
            <div className="text-sm bg-muted p-3 rounded">
              Reference: {ref}
            </div>
          )}

          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full"
          >
            Go to Dashboard
          </Button>
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