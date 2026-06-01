import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
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
  Check,
} from "lucide-react";

type PaymentMethod = "tnm" | "airtel" | null;

export default function UpgradePage() {
  const { levels } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "created" | "failed"
  >("idle");
  const [transactionRef, setTransactionRef] = useState<string | null>(null);

  const paidLevels = levels.filter(
    (l) => l.name !== "Beginner"
  );

  const currentLevel = levels.find((l) => l.id === selectedLevel);

  const getPrice = (name: string) => {
    if (name === "Intermediate") return "MK15,000";
    if (name === "Expert") return "MK30,000";
    return "Premium";
  };

  const handleBuyClick = (levelId: string) => {
    setSelectedLevel(levelId);
    setSelectedPaymentMethod(null);
    setPaymentPhone("");
    setPhoneError(null);
    setPaymentStatus("idle");
    setTransactionRef(null);
  };

  const validatePhone = () => {
    if (!selectedPaymentMethod) {
      setPhoneError("Please select a payment method first.");
      return false;
    }

    const phone = paymentPhone.trim();
    const regex =
      selectedPaymentMethod === "tnm"
        ? /^08\d{8}$/
        : /^09\d{8}$/;

    if (!regex.test(phone)) {
      setPhoneError(
        selectedPaymentMethod === "tnm"
          ? "TNM Mpamba phone numbers must start with 08 and contain 10 digits."
          : "Airtel Money phone numbers must start with 09 and contain 10 digits."
      );
      return false;
    }

    setPhoneError(null);
    return true;
  };

  const getAmount = (levelName: string | undefined) => {
    if (levelName === "Intermediate") return 15000;
    if (levelName === "Expert") return 30000;
    return 0;
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !currentLevel || !user) return;
    if (!validatePhone()) return;

    setPaymentStatus("processing");
    setPhoneError(null);

    try {
      const payment = await createPayment({
        userId: user.id,
        levelId: currentLevel.id,
        amount: getAmount(currentLevel.name),
        provider: selectedPaymentMethod,
        phone: paymentPhone,
      });

      setTransactionRef(payment.transaction_ref);
      setPaymentStatus("created");
    } catch (error) {
      setPaymentStatus("failed");
      setPhoneError("Unable to create payment record. Please try again.");
    }
  };

  const handleCloseDialog = () => {
    if (paymentStatus === "idle" || paymentStatus === "failed" || paymentStatus === "created") {
      setSelectedLevel(null);
      setSelectedPaymentMethod(null);
      setPaymentPhone("");
      setPhoneError(null);
      setPaymentStatus("idle");
      setTransactionRef(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Upgrade Packages
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {paidLevels.map((level) => (
          <div key={level.id} className="border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">
              {level.name}
            </h2>

            <p className="text-muted-foreground mb-3">
              {level.description}
            </p>

            <p className="font-bold mb-4">
              {getPrice(level.name)}
            </p>

            <Button
              onClick={() => handleBuyClick(level.id)}
              className="w-full"
            >
              Buy Access
            </Button>
          </div>
        ))}
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!selectedLevel} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Buy {currentLevel?.name}
            </DialogTitle>
            <DialogDescription>
              Complete your purchase to unlock {currentLevel?.name} courses
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Details */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Package:</span>
                <span className="font-semibold">{currentLevel?.name}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm text-muted-foreground">Price:</span>
                <span className="font-bold text-lg">
                  {getPrice(currentLevel?.name || "")}
                </span>
              </div>
            </div>

            {paymentStatus === "idle" && (
              <>
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Select Payment Method:</label>
                  
                  <button
                    onClick={() => setSelectedPaymentMethod("tnm")}
                    className={`w-full p-4 border-2 rounded-lg transition-all flex items-center justify-between ${
                      selectedPaymentMethod === "tnm"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">TNM Mpamba</p>
                      <p className="text-xs text-muted-foreground">Mobile money transfer</p>
                    </div>
                    {selectedPaymentMethod === "tnm" && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod("airtel")}
                    className={`w-full p-4 border-2 rounded-lg transition-all flex items-center justify-between ${
                      selectedPaymentMethod === "airtel"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">Airtel Money</p>
                      <p className="text-xs text-muted-foreground">Airtel mobile payment</p>
                    </div>
                    {selectedPaymentMethod === "airtel" && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold">Phone Number</label>
                    <Input
                      type="tel"
                      value={paymentPhone}
                      onChange={(event) => {
                        const value = event.target.value.replace(/\D/g, "");
                        setPaymentPhone(value.slice(0, 10));
                        if (phoneError) setPhoneError(null);
                      }}
                      placeholder={
                        selectedPaymentMethod === "airtel"
                          ? "09XXXXXXXX"
                          : "08XXXXXXXX"
                      }
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedPaymentMethod === "tnm"
                        ? "TNM Mpamba numbers must start with 08."
                        : selectedPaymentMethod === "airtel"
                        ? "Airtel Money numbers must start with 09."
                        : "Select a payment method to see the phone format."}
                    </p>
                    {phoneError && (
                      <p className="text-sm text-destructive mt-1">{phoneError}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-700">
                    Your payment details will be saved in the payments database and used for PayChangu processing.
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || paymentPhone.length === 0}
                  className="w-full"
                  size="lg"
                >
                  Proceed to Payment
                </Button>
              </>
            )}

            {paymentStatus === "processing" && (
              <div className="text-center py-6 space-y-2">
                <Loader2 className="animate-spin mx-auto h-8 w-8" />
                <p className="font-semibold">Creating Payment Request...</p>
                <p className="text-sm text-muted-foreground">
                  Saving your payment details for PayChangu processing.
                </p>
              </div>
            )}

            {paymentStatus === "created" && (
              <div className="space-y-3">
                <div className="text-center space-y-2">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-600" />
                  <p className="font-semibold text-green-600">Payment request created!</p>
                  <p className="text-sm text-muted-foreground">
                    Your {selectedPaymentMethod === "tnm" ? "TNM Mpamba" : "Airtel Money"} request has been recorded.
                  </p>
                </div>
                {transactionRef && (
                  <div className="rounded-lg border border-muted p-4 text-left text-sm">
                    <p className="font-semibold">Payment reference</p>
                    <p className="break-all">{transactionRef}</p>
                  </div>
                )}
                <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                  Complete your payment through PayChangu. Once the transaction is confirmed, your access will be unlocked.
                </div>
                <Button
                  onClick={handleCloseDialog}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="space-y-3">
                <div className="text-center space-y-2">
                  <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
                  <p className="font-semibold text-destructive">Payment failed</p>
                  <p className="text-sm text-muted-foreground">
                    {phoneError || "Unable to create payment record. Please try again."}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setPaymentStatus("idle");
                    setSelectedPaymentMethod(null);
                    setPaymentPhone("");
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}