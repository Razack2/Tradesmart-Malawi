import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, BookOpen, Shield, Zap, ArrowRight, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">TradeSmart Malawi</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-trading-green text-sm font-medium mb-6">
            <Zap className="h-4 w-4" /> Built for Malawian Traders
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Master <span className="text-trading-green">Crypto</span> &{" "}
            <span className="text-trading-gold">Forex</span> Trading
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
            A structured learning platform designed for Malawian traders. From beginner
            fundamentals to expert strategies — learn at your own pace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gradient-primary border-0 text-primary-foreground px-8 text-base" asChild>
              <Link to="/register">Start Learning Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 text-base" asChild>
              <Link to="/login">I have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-12 text-foreground">
            Why TradeSmart Malawi?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "Structured Learning",
                desc: "Beginner → Intermediate → Expert levels with courses, modules, and lessons.",
              },
              {
                icon: BarChart3,
                title: "Track Your Progress",
                desc: "Monitor completed lessons and courses with visual progress tracking.",
              },
              {
                icon: Shield,
                title: "Local Context",
                desc: "Content tailored for Malawian traders with relevant examples and strategies.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2 text-card-foreground">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-12 text-foreground">Learning Levels</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Beginner", tag: "FREE", color: "text-trading-green", desc: "Forex & Crypto fundamentals" },
              { name: "Intermediate", tag: "PREMIUM", color: "text-trading-gold", desc: "Candlestick patterns & indicators" },
              { name: "Expert", tag: "PREMIUM", color: "text-trading-gold", desc: "Advanced strategies & risk management" },
            ].map((l, i) => (
              <div key={i} className="bg-card rounded-xl p-6 shadow-card border border-border text-center">
                <span className={`text-xs font-bold uppercase ${l.color}`}>{l.tag}</span>
                <h3 className="text-xl font-display font-bold mt-2 mb-2 text-card-foreground">{l.name}</h3>
                <p className="text-muted-foreground text-sm">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2026 TradeSmart Malawi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
