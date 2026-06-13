import { useParams, Link, Navigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();

  const courseContext = useCourses();
  const { getLessonById, getLevelById } = courseContext;
  const courses = (courseContext as any).courses;

  const { user, isAdmin } = useAuth();

  const lesson = getLessonById(lessonId || "");
  if (!lesson) return <Navigate to="/dashboard" replace />;

  const course =
    courses?.find((c) =>
      c.modules.some((m) =>
        m.lessons.some((l) => l.id === lesson.id)
      )
    ) || null;
  const level = getLevelById(course?.levelId || "");

  const levelName = level?.name?.toLowerCase();

  const hasSubscription =
    isAdmin || user?.has_active_subscription === true;

  const FREE_LIMIT = 4;

  // Find lesson index in course (GLOBAL ORDER, not module order)
  const allLessons =
    course?.modules.flatMap((m) => m.lessons) || [];

  const lessonIndex =
    allLessons.findIndex((l) => l.id === lesson.id);

  const isBeginner = levelName === "beginner";

  const isLocked =
    isBeginner &&
    !hasSubscription &&
    lessonIndex >= FREE_LIMIT;

  // =========================
  // BLOCK ACCESS (CRITICAL SECURITY)
  // =========================
  if (isLocked) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in text-center">
        <Lock className="h-12 w-12 mx-auto mb-4 text-red-500" />

        <h1 className="text-2xl font-bold mb-2">
          Premium Subscription Required
        </h1>

        <p className="text-muted-foreground mb-4">
          You’ve reached the free learning limit.
          Subscribe to continue.
        </p>

        <Button asChild>
          <Link to="/upgrade">
            Subscribe Now
          </Link>
        </Button>

        <div className="mt-4">
          <Button variant="ghost" asChild>
            <Link to={`/course/${course?.id}`}>
              Back to Course
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // =========================
  // NORMAL LESSON VIEW
  // =========================
  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to={`/course/${course?.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-2">
        {lesson.title}
      </h1>

      <p className="text-muted-foreground mb-6">
        {lesson.description}
      </p>

      {/* CONTENT */}
      <div className="bg-card border rounded-xl p-6">
        <p className="text-sm leading-relaxed">
          {lesson.content}
        </p>
      </div>
    </div>
  );
}