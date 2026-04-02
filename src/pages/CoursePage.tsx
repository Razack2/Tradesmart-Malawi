import { useParams, Link, Navigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { ArrowLeft, CheckCircle2, Circle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { getCourseById, getLevelById } = useCourses();
  const { isPaid } = useAuth();
  const { isCompleted, getLessonProgress } = useProgress();

  const course = getCourseById(courseId || "");
  if (!course) return <Navigate to="/dashboard" replace />;

  const level = getLevelById(course.levelId);
  if (level?.isPaid && !isPaid) return <Navigate to="/upgrade" replace />;

  const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progress = getLessonProgress(allLessonIds);

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to={`/level/${course.levelId}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to {level?.name}</Link>
      </Button>

      <div className="mb-8">
        <span className="text-xs font-medium uppercase text-muted-foreground tracking-wide">{course.category}</span>
        <h1 className="text-3xl font-display font-bold text-foreground mt-1">{course.title}</h1>
        <p className="text-muted-foreground mt-1">{course.description}</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-sm font-medium text-primary">{progress}%</span>
        </div>
      </div>

      <div className="space-y-6">
        {course.modules.map((mod) => (
          <div key={mod.id} className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-display font-semibold text-card-foreground">{mod.title}</h2>
              <p className="text-xs text-muted-foreground">{mod.lessons.length} lessons</p>
            </div>
            <div className="divide-y divide-border">
              {mod.lessons.map((lesson) => {
                const done = isCompleted(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    to={`/lesson/${lesson.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-trading-green flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={`text-sm ${done ? "text-muted-foreground" : "text-card-foreground"}`}>
                      {lesson.title}
                    </span>
                    {lesson.quiz && lesson.quiz.length > 0 && (
                      <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Quiz</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
