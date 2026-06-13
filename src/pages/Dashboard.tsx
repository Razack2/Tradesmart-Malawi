import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { useProgress } from "@/contexts/ProgressContext";
import {
  BookOpen,
  Lock,
  TrendingUp,
  Crown,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { levels } = useCourses();
  const { getLessonProgress } = useProgress();

  // =========================
  // SUBSCRIPTION STATE
  // =========================
  const hasSubscription =
    isAdmin || user?.has_active_subscription === true;

  // =========================
  // LESSONS
  // =========================
  const allLessons = levels.flatMap((l) =>
    l.courses.flatMap((c) =>
      c.modules.flatMap((m) => m.lessons)
    )
  );

  const overallProgress = getLessonProgress(
    allLessons.map((l) => l.id)
  );

  // =========================
  // ICONS + STYLES
  // =========================
  const levelIcons = {
    Beginner: BookOpen,
    Intermediate: TrendingUp,
    Expert: Crown,
  };

  const levelStyles = {
    Beginner: {
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-500",
      badge: "text-emerald-600",
      border: "border-emerald-200/50",
    },
    Intermediate: {
      iconBg: "bg-amber-500/10",
      iconText: "text-amber-500",
      badge: "text-amber-600",
      border: "border-amber-200/50",
    },
    Expert: {
      iconBg: "bg-red-500/10",
      iconText: "text-red-500",
      badge: "text-red-600",
      border: "border-red-200/50",
    },
  } as const;

  const getLevelStyles = (name: string) =>
    levelStyles[name as keyof typeof levelStyles] || levelStyles.Beginner;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Continue your trading education
        </p>
      </div>

      {/* OVERALL PROGRESS */}
      <div className="bg-card rounded-xl p-6 shadow-card border mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            Overall Progress
          </h2>
          <span className="text-sm font-medium text-primary">
            {overallProgress}%
          </span>
        </div>

        <Progress value={overallProgress} className="h-3" />
      </div>

      {/* UPGRADE BANNER */}
      {!hasSubscription && !isAdmin && (
        <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/10 rounded-xl p-6 mb-8 flex items-center justify-between border">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Upgrade to Premium
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Unlock Intermediate & Expert levels
            </p>
          </div>

          <Button asChild>
            <Link to="/upgrade">
              Upgrade Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* LEVELS */}
      <h2 className="text-xl font-semibold mb-4">
        Learning Levels
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {levels.map((level) => {
          const Icon = levelIcons[level.name] || BookOpen;

          const isBeginner =
            level.name.toLowerCase() === "beginner";

          const locked =
            !isBeginner && !hasSubscription;

          const lessonIds = level.courses.flatMap((c) =>
            c.modules.flatMap((m) =>
              m.lessons.map((l) => l.id)
            )
          );

          const progress = locked
            ? 0
            : getLessonProgress(lessonIds);

          const courseCount = level.courses.length;

          return (
            <Link
              key={level.id}
              to={locked ? "/upgrade" : `/level/${level.id}`}
              className="group"
            >
              <div
                className={`bg-card rounded-xl p-6 border shadow-card hover:shadow-lg transition ${
                  locked
                    ? "opacity-70"
                    : getLevelStyles(level.name).border
                }`}
              >
                {/* ICON */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      locked
                        ? "bg-muted"
                        : getLevelStyles(level.name).iconBg
                    }`}
                  >
                    {locked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Icon
                        className={`h-5 w-5 ${
                          getLevelStyles(level.name).iconText
                        }`}
                      />
                    )}
                  </div>

                  <span
                    className={`text-xs font-bold uppercase ${
                      getLevelStyles(level.name).badge
                    }`}
                  >
                    {isBeginner ? "FREE" : "PREMIUM"}
                  </span>
                </div>

                {/* TITLE */}
                <h3 className="text-lg font-semibold mb-1">
                  {level.name}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  {courseCount} courses
                </p>

                {/* PROGRESS */}
                {!locked && (
                  <>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </>
                )}

                {/* LOCK TEXT */}
                {locked && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Premium required
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