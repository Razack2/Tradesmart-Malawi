import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "processing" | "failed"
  >("idle");

  const { login, user, isLoading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      navigate(
        user.role === "admin"
          ? "/admin"
          : "/dashboard",
        { replace: true }
      );
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setStatus("processing");

      const result = await login(
        email,
        password
      );

      if (!result.success) {
        setStatus("failed");
        setError(
          result.error ||
            "Invalid email or password."
        );
        return;
      }

      navigate(
        result.role === "admin"
          ? "/admin"
          : "/dashboard"
      );
    } catch (err) {
      setStatus("failed");
      setError(
        "An unexpected error occurred."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>

            <span className="text-2xl font-display font-bold text-foreground">
              TradeSmart Malawi
            </span>
          </Link>

          <h1 className="text-2xl font-display font-bold">
            Welcome Back
          </h1>

          <p className="text-muted-foreground mt-1">
            Sign in to continue learning
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl p-6 shadow-card border border-border space-y-4"
        >
          {/* Success Message */}
          {location.state?.message && (
            <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg">
              {(location.state as any).message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password
            </Label>

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={
              status === "processing"
            }
            className="w-full gradient-primary border-0 text-primary-foreground"
          >
            {status ===
            "processing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}