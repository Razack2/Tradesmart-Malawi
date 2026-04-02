import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { useProgress } from "@/contexts/ProgressContext";
import { BookOpen, Lock, TrendingUp, Crown, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user, isPaid } = useAuth();
  const { levels } = useCourses();
  const { getLessonProgress } = useProgress();

  const allLessons = levels.flatMap((l) =>
    l.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons))
  );
  const accessibleLessons = levels
    .filter((l) => !l.isPaid || isPaid)
    .flatMap((l) => l.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons)));

  const overallProgress = getLessonProgress(accessibleLessons.map((l) => l.id));

  const levelIcons = { Beginner: BookOpen, Intermediate: TrendingUp, Expert: Crown };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Continue your trading education</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-semibold text-card-foreground">Overall Progress</h2>
          <span className="text-sm font-medium text-primary">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          {accessibleLessons.filter((l) => getLessonProgress([l.id]) === 100).length} of{" "}
          {accessibleLessons.length} lessons completed
        </p>
      </div>

      {!isPaid && (
        <div className="gradient-gold rounded-xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-accent-foreground flex items-center gap-2">
              <Zap className="h-5 w-5" /> Upgrade to Premium
            </h3>
            <p className="text-accent-foreground/80 text-sm mt-1">
              Unlock Intermediate & Expert courses
            </p>
          </div>
          <Button asChild variant="secondary" className="font-semibold">
            <Link to="/upgrade">Upgrade Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      )}

      {/* Levels */}
      <h2 className="text-xl font-display font-semibold text-foreground mb-4">Learning Levels</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {levels.map((level) => {
          const Icon = levelIcons[level.name] || BookOpen;
          const locked = level.isPaid && !isPaid;
          const lessonIds = level.courses.flatMap((c) =>
            c.modules.flatMap((m) => m.lessons.map((l) => l.id))
          );
          const progress = locked ? 0 : getLessonProgress(lessonIds);
          const courseCount = level.courses.length;

          return (
            <Link
              key={level.id}
              to={locked ? "/upgrade" : `/level/${level.id}`}
              className="group"
            >
              <div
                className={`bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-all ${
                  locked ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      locked ? "bg-muted" : "gradient-primary"
                    }`}
                  >
                    {locked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold uppercase ${
                      level.isPaid ? "text-trading-gold" : "text-trading-green"
                    }`}
                  >
                    {level.isPaid ? "Premium" : "Free"}
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold text-card-foreground mb-1">
                  {level.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{courseCount} courses</p>
                {!locked && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
                {locked && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Upgrade to access
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
