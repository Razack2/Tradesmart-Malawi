import { useLocation, Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const location = useLocation();

  const email =
    (location.state as any)?.email || "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center border rounded-xl p-8">
        <Mail className="mx-auto h-16 w-16 mb-4" />

        <h1 className="text-2xl font-bold mb-2">
          Verify Your Email
        </h1>

        <p className="text-muted-foreground mb-4">
          We've sent a verification link to:
        </p>

        <p className="font-semibold mb-6">
          {email}
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Please open your email and click the
          verification link before logging in.
        </p>

        <Button asChild className="w-full">
          <Link to="/login">
            Back to Login
          </Link>
        </Button>
      </div>
    </div>
  );
}