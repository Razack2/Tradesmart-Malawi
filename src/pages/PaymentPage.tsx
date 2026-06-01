import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const paymentOptions = [
  {
    value: "tnm",
    label: "TNM Mpamba",
    prefix: "08",
    hint: "Starts with 08 and must contain exactly 10 digits.",
  },
  {
    value: "airtel",
    label: "Airtel Money",
    prefix: "09",
    hint: "Starts with 09 and must contain exactly 10 digits.",
  },
];

function getPhoneValidationMessage(provider: string, phone: string) {
  if (!phone) return "Enter your mobile money phone number.";
  if (!/^[0-9]+$/.test(phone)) return "Phone number can only contain digits.";
  if (phone.length !== 10) return "Phone number must be exactly 10 digits.";

  const option = paymentOptions.find((p) => p.value === provider);
  if (!option) return "Select a valid payment method.";
  if (!phone.startsWith(option.prefix)) {
    return `${option.label} numbers must start with ${option.prefix}.`;
  }

  return "";
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { levels } = useCourses();
  const { upgradeSubscription } = useAuth();

  const level = searchParams.get("level") ?? "selected";
  const statusParam = searchParams.get("status");

  const [paymentProvider, setPaymentProvider] = useState("tnm");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [paymentOutcome, setPaymentOutcome] = useState<
    "" | "success" | "failure"
  >("");

  const selectedProvider = paymentOptions.find(
    (p) => p.value === paymentProvider
  );

  const changuGatewayUrl = "https://pay.changu.com/checkout";

  const returnUrl = `${window.location.origin}/upgrade?level=${encodeURIComponent(
    level
  )}&status=success`;

  // ✅ MATCH LEVEL (critical fix)
  const matchedLevel = levels.find((l) => {
    const normalized = level.toLowerCase();
    return (
      l.id.toLowerCase() === normalized ||
      l.name.toLowerCase() === normalized ||
      l.name.toLowerCase().replace(/\s+/g, "") === normalized
    );
  });

  const packageRoute = matchedLevel
    ? `/level/${matchedLevel.id}`
    : "/dashboard";

  const packageName = matchedLevel?.name || level;

  const isSuccess =
    paymentOutcome === "success" || statusParam === "success";

  const isFailure =
    paymentOutcome === "failure" || statusParam === "failure";

  // ✅ UNLOCK PACKAGE ON SUCCESS
  useEffect(() => {
    if (!isSuccess) return;
    if (!matchedLevel) return;

    const unlockAndRedirect = async () => {
      const unlocked = await upgradeSubscription();
      
      if (unlocked) {
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
      }
    };

    unlockAndRedirect();
  }, [isSuccess, matchedLevel, upgradeSubscription, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const msg = getPhoneValidationMessage(
      paymentProvider,
      phoneNumber.trim()
    );

    if (msg) {
      setError(msg);
      return;
    }

    setError("");

    const params = new URLSearchParams({
      provider: paymentProvider,
      phone: phoneNumber.trim(),
      level,
      returnUrl,
    }).toString();

    window.location.href = `${changuGatewayUrl}?${params}`;
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-card border rounded-xl p-8 shadow-card text-center">
        <CreditCard className="h-12 w-12 mx-auto text-primary mb-4" />

        <h1 className="text-2xl font-bold mb-2">Make Payments</h1>

        <p className="text-muted-foreground mb-6">
          Pay to unlock the {level} Premium Package
        </p>

        {/* RESULT VIEW */}
        {isSuccess || isFailure ? (
          <div className="space-y-5 text-left">
            {isSuccess ? (
              <Alert className="border-green-500 bg-green-50 text-green-800">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle>Payment Successful</AlertTitle>
                <AlertDescription>
                  🎉 The <strong>{packageName}</strong> package has been unlocked.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-500 bg-red-50 text-red-700">
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertTitle>Payment Failed</AlertTitle>
                <AlertDescription>
                  Transaction failed. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full"
              variant={isSuccess ? "default" : "destructive"}
              onClick={() => {
                if (isSuccess && matchedLevel) {
                  navigate(`/level/${matchedLevel.id}`, {
                    state: {
                      unlocked: true,
                      packageName: matchedLevel.name,
                    },
                  });
                } else {
                  setPaymentOutcome("");
                  navigate(`/upgrade?level=${encodeURIComponent(level)}`, {
                    replace: true,
                  });
                }
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isSuccess
                ? `Continue to ${packageName}`
                : "Return to payment"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* PAYMENT METHOD */}
            <div className="space-y-2">
              <Label>Payment Method</Label>

              <Select
                value={paymentProvider}
                onValueChange={(v) => {
                  setPaymentProvider(v);
                  setError("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>

                <SelectContent>
                  {paymentOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-sm text-muted-foreground">
                {selectedProvider?.hint}
              </p>
            </div>

            {/* PHONE */}
            <div className="space-y-2">
              <Label>Mobile Number</Label>

              <Input
                type="tel"
                maxLength={10}
                placeholder={`${selectedProvider?.prefix}XXXXXXXX`}
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setError("");
                }}
              />
            </div>

            {/* ERROR */}
            {error && (
              <Alert className="border-red-500 bg-red-50 text-red-700">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* PAY */}
            <Button type="submit" className="w-full">
              Pay Now
            </Button>

            {/* SIMULATION */}
            <div className="border border-dashed p-4 rounded-xl bg-muted/10">
              <p className="text-sm mb-3 text-muted-foreground">
                Test simulation:
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setError("");
                    setPaymentOutcome("success");
                  }}
                >
                  Simulate Success
                </Button>

                <Button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    setError("");
                    setPaymentOutcome("failure");
                  }}
                >
                  Simulate Failure
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}