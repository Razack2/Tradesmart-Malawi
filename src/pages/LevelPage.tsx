import { useParams, Link, Navigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>();

  const { getLevelById } = useCourses();
  const { user, isAdmin } = useAuth();
  const { getLessonProgress } = useProgress();

  const level = getLevelById(levelId || "");

  if (!level) {
    return <Navigate to="/dashboard" replace />;
  }

  // =========================
  // ACCESS CONTROL (FIXED)
  // =========================
  const isBeginner = level.name === "Beginner";

  const isUnlocked =
    isAdmin ||
    isBeginner ||
    user?.unlocked_levels?.includes(level.id);

  // ❌ BLOCK ACCESS
  if (!isUnlocked) {
    const price =
      level.name === "Intermediate"
        ? "MK15,000"
        : level.name === "Expert"
        ? "MK30,000"
        : "Premium";

    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="bg-card rounded-2xl border p-8 text-center shadow-card">
          <Lock className="h-12 w-12 mx-auto mb-4 text-red-500" />

          <h1 className="text-2xl font-bold mb-2">
            Upgrade Required
          </h1>

          <p className="text-3xl font-bold text-red-600 mb-3">
            {price}
          </p>

          <p className="text-muted-foreground mb-4">
            You need to unlock the{" "}
            <span className="font-semibold">
              {level.name}
            </span>{" "}
            package to access this content.
          </p>

          <Button asChild>
            <Link to={`/upgrade`}>
              Upgrade Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // =========================
  // LEVEL STYLES
  // =========================
  const levelStyles =
    level.name === "Beginner"
      ? {
          text: "text-green-600",
          badge: "bg-green-100 text-green-700",
          card: "bg-green-50 border-green-200 hover:border-green-400",
        }
      : level.name === "Intermediate"
      ? {
          text: "text-amber-600",
          badge: "bg-amber-100 text-amber-700",
          card: "bg-amber-50 border-amber-200 hover:border-amber-400",
        }
      : {
          text: "text-red-600",
          badge: "bg-red-100 text-red-700",
          card: "bg-red-50 border-red-200 hover:border-red-400",
        };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {/* HEADER */}
      <div className="mb-8">
        <span className={`text-xs px-3 py-1 rounded-full ${levelStyles.badge}`}>
          {level.name} Level
        </span>

        <h1 className={`text-3xl font-bold mt-2 ${levelStyles.text}`}>
          {level.name}
        </h1>

        <p className="text-muted-foreground mt-1">
          {level.description}
        </p>
      </div>

      {/* COURSES */}
      <div className="grid md:grid-cols-2 gap-6">
        {level.courses.map((course) => {
          const lessonIds = course.modules.flatMap((m) =>
            m.lessons.map((l) => l.id)
          );

          const progress = getLessonProgress(lessonIds);

          return (
            <Link key={course.id} to={`/course/${course.id}`}>
              <div
                className={`p-6 border rounded-xl shadow-card transition hover:shadow-lg ${levelStyles.card}`}
              >
                <div className="flex justify-between text-xs mb-3 text-muted-foreground">
                  <span>{course.category}</span>
                  <span>
                    {course.modules.length} modules · {lessonIds.length} lessons
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  {course.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  {course.description}
                </p>

                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>

                <Progress value={progress} className="h-2" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}