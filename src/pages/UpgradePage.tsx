import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2, Crown, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UpgradePage() {
  const { user, isPaid, upgradeSubscription } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    upgradeSubscription();
    navigate("/dashboard");
  };

  if (isPaid) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center animate-fade-in">
        <div className="bg-card rounded-xl p-10 shadow-card border border-border">
          <CheckCircle2 className="h-16 w-16 text-trading-green mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-card-foreground mb-2">You're Premium!</h1>
          <p className="text-muted-foreground mb-6">You have full access to all content.</p>
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
      </Button>

      <div className="bg-card rounded-xl p-8 shadow-card border border-border text-center">
        <div className="h-16 w-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6">
          <Crown className="h-8 w-8 text-accent-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold text-card-foreground mb-2">Upgrade to Premium</h1>
        <p className="text-muted-foreground mb-8">Unlock all Intermediate & Expert courses</p>

        <div className="space-y-3 text-left max-w-sm mx-auto mb-8">
          {[
            "Candlestick Pattern Mastery",
            "Technical Indicators Deep Dive",
            "Advanced Trading Strategies",
            "Risk Management Systems",
            "All future premium content",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-trading-green flex-shrink-0" />
              <span className="text-sm text-card-foreground">{f}</span>
            </div>
          ))}
        </div>

        <Button onClick={handleUpgrade} size="lg" className="gradient-gold border-0 text-accent-foreground font-bold px-10">
          <Zap className="mr-2 h-5 w-5" /> Upgrade Now (Simulated)
        </Button>
        <p className="text-xs text-muted-foreground mt-3">No real payment required — this is a simulation</p>
      </div>
    </div>
  );
}
