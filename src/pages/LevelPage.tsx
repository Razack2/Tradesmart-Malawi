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
  const { isAdmin } = useAuth();
  const { getLessonProgress } = useProgress();

  const level = getLevelById(levelId || "");

  if (!level) {
    return <Navigate to="/dashboard" replace />;
  }

  // Role-based restriction
  const isStudent = !isAdmin;

  const restrictedLevel =
    isStudent &&
    (
      level.name.toLowerCase() === "intermediate" ||
      level.name.toLowerCase() === "expert"
    );

  // Level Colors
  const levelStyles =
    level.name.toLowerCase() === "beginner"
      ? {
          text: "text-green-600",
          badge: "bg-green-100 text-green-700",
          card: "bg-green-50 border-green-200 hover:border-green-400",
        }
      : level.name.toLowerCase() === "intermediate"
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

  // Upgrade Screen for Students
  if (restrictedLevel) {
    const price =
      level.name.toLowerCase() === "intermediate"
        ? "MK15,000"
        : level.name.toLowerCase() === "expert"
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

        <div className="bg-card rounded-2xl border border-border shadow-card p-8 text-center">
          <Lock className={`h-12 w-12 mx-auto mb-4 ${levelStyles.text}`} />

          <h1 className="text-2xl font-bold mb-2">Upgrade Required</h1>

          <p className={`text-3xl font-display font-bold mb-3 ${levelStyles.text}`}>
            {price}
          </p>

          <p className="text-muted-foreground mb-4">
            Upgrade to the <span className={`font-semibold ${levelStyles.text}`}>{level.name} Premium Package</span> to access this level.
          </p>

          <Button asChild className="inline-flex items-center gap-3">
            <Link to="/upgrade">Upgrade to {level.name} — {price}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Level Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${levelStyles.badge}`}
          >
            {level.name} Level
          </span>
        </div>

        <h1
          className={`text-3xl font-display font-bold ${levelStyles.text}`}
        >
          {level.name}
        </h1>

        <p className="text-muted-foreground mt-1">
          {level.description}
        </p>
      </div>

      {/* Courses */}
      <div className="grid md:grid-cols-2 gap-6">
        {level.courses.map((course) => {
          const lessonIds = course.modules.flatMap((m) =>
            m.lessons.map((l) => l.id)
          );

          const progress = getLessonProgress(lessonIds);

          return (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="group"
            >
              <div
                className={`rounded-xl p-6 shadow-card border transition-all hover:shadow-elevated h-full ${levelStyles.card}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
                    {course.category}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {course.modules.length} modules · {lessonIds.length} lessons
                  </span>
                </div>

                <h3 className="text-xl font-display font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  {course.description}
                </p>

                <div className="flex justify-between text-xs text-muted-foreground mb-1">
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