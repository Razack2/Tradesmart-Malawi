import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Loader2 } from "lucide-react";


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

   if (!name.trim()) {
  setError("Full name is required");
  return;
}

if (name.trim().length < 3) {
  setError(
    "Name must be at least 3 characters long"
  );
  return;
}

if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
  setError(
    "Name can only contain letters, spaces, apostrophes, and hyphens"
  );
  return;
}

if (!email.trim()) {
  setError("Email address is required");
  return;
}

if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
) {
  setError(
    "Please enter a valid email address"
  );
  return;
}

if (!password) {
  setError("Password is required");
  return;
}

if (password.length < 8) {
  setError(
    "Password must be at least 8 characters long"
  );
  return;
}

if (!/[A-Z]/.test(password)) {
  setError(
    "Password must contain at least one uppercase letter"
  );
  return;
}

if (!/[a-z]/.test(password)) {
  setError(
    "Password must contain at least one lowercase letter"
  );
  return;
}

if (!/[0-9]/.test(password)) {
  setError(
    "Password must contain at least one number"
  );
  return;
}

if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  setError(
    "Password must contain at least one special character"
  );
  return;
}

try {
  setStatus("processing");

  const res = await register(
    email.trim().toLowerCase(),
    password,
    name.trim()
  );

      if (!res.success) {
        setStatus("failed");
        setError(
          res.error ||
            "Registration failed"
        );
        return;
      }

      setStatus("success");

      navigate("/verify-email", {
        state: {
          email,
        },
        replace: true,
      });
    } catch (err) {
      console.error(err);

      setStatus("failed");

      setError(
        "Registration failed. Please try again."
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

          <h1 className="text-2xl font-display font-bold text-foreground">
            Create your account
          </h1>

          <p className="text-muted-foreground mt-1">
            Start your trading journey today
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl p-6 shadow-card border border-border space-y-4"
        >
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name
            </Label>

            <Input
              id="name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="John Banda"
            />
          </div>

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
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}