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
  if (!level) return <Navigate to="/dashboard" replace />;

  // =========================
  // SUBSCRIPTION CHECK
  // =========================
  const isBeginner = level.name === "Beginner";

  const hasSubscription =
    isAdmin || user?.has_active_subscription === true;

  const isUnlocked = isBeginner || hasSubscription;

  if (!isUnlocked) {
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
            Premium Subscription Required
          </h1>

          <p className="text-3xl font-bold text-primary mb-3">
            MK5,000 / Month
          </p>

          <p className="text-muted-foreground mb-4">
            Subscribe to Premium to continue learning advanced content.
          </p>

          <Button asChild>
            <Link to="/upgrade">Subscribe Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  // =========================
  // STYLES
  // =========================
  const levelStyles =
    level.name === "Beginner"
      ? {
          text: "text-green-600",
          badge: "bg-green-100 text-green-700",
          card: "bg-green-50 border-green-200 hover:border-green-400",
        }
      : {
          text: "text-blue-600",
          badge: "bg-blue-100 text-blue-700",
          card: "bg-blue-50 border-blue-200 hover:border-blue-400",
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