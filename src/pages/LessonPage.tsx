import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import {
  Lock,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const location = useLocation();

  const { getLevelById } = useCourses();

  const {
    isAdmin,
    hasUnlockedLevel,
  } = useAuth();

  const { getLessonProgress } =
    useProgress();

  const level = getLevelById(
    levelId || ""
  );

  if (!level) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const levelName =
    level.name.toLowerCase();

  // BEGINNER ALWAYS OPEN
  const isBeginner =
    levelName === "beginner";

  // spinner after payment redirect
  const openingPackage =
    location.state?.unlocked === true;

  // LOCK LOGIC
  const restrictedLevel =
    !isBeginner &&
    !isAdmin &&
    !hasUnlockedLevel(level.id);

  // Level Colors
  const levelStyles =
    levelName === "beginner"
      ? {
          text: "text-green-600",
          badge:
            "bg-green-100 text-green-700",
          card:
            "bg-green-50 border-green-200 hover:border-green-400",
        }
      : levelName ===
        "intermediate"
      ? {
          text: "text-amber-600",
          badge:
            "bg-amber-100 text-amber-700",
          card:
            "bg-amber-50 border-amber-200 hover:border-amber-400",
        }
      : {
          text: "text-red-600",
          badge:
            "bg-red-100 text-red-700",
          card:
            "bg-red-50 border-red-200 hover:border-red-400",
        };

  // Pricing
  const price =
    levelName === "intermediate"
      ? "MK15,000"
      : levelName === "expert"
      ? "MK30,000"
      : "Free";

  // LOCKED PAGE
  if (restrictedLevel) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4"
        >
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="bg-card rounded-2xl border border-border shadow-card p-8 text-center">
          <Lock
            className={`h-12 w-12 mx-auto mb-4 ${levelStyles.text}`}
          />

          <h1 className="text-2xl font-bold mb-2">
            Package Locked
          </h1>

          <p
            className={`text-3xl font-display font-bold mb-3 ${levelStyles.text}`}
          >
            {price}
          </p>

          <p className="text-muted-foreground mb-4">
            Purchase the{" "}
            <span
              className={`font-semibold ${levelStyles.text}`}
            >
              {level.name}
            </span>{" "}
            package to access this
            level.
          </p>

          <Button asChild>
            <Link
              to={`/upgrade?level=${encodeURIComponent(
                level.id
              )}`}
            >
              Unlock {level.name} —{" "}
              {price}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // OPENING SPINNER
  if (openingPackage) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">
        <Loader2 className="h-14 w-14 animate-spin text-primary mb-4" />

        <h2 className="text-2xl font-bold mb-2">
          Opening {level.name}
        </h2>

        <p className="text-muted-foreground">
          Preparing your premium
          package...
        </p>
      </div>
    );
  }

  // NORMAL PAGE
  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="mb-4"
      >
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${levelStyles.badge}`}
          >
            {level.name} Level
          </span>

          {isBeginner && (
            <span className="text-xs px-3 py-1 rounded-full bg-green-600 text-white font-semibold">
              FREE
            </span>
          )}
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
        {level.courses.map(
          (course) => {
            const lessonIds =
              course.modules.flatMap(
                (m) =>
                  m.lessons.map(
                    (l) => l.id
                  )
              );

            const progress =
              getLessonProgress(
                lessonIds
              );

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
                      {
                        course.modules
                          .length
                      }{" "}
                      modules ·{" "}
                      {lessonIds.length}{" "}
                      lessons
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4">
                    {
                      course.description
                    }
                  </p>

                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>
                      Progress
                    </span>

                    <span>
                      {progress}%
                    </span>
                  </div>

                  <Progress
                    value={progress}
                    className="h-2"
                  />
                </div>
              </Link>
            );
          }
        )}
      </div>
    </div>
  );
}