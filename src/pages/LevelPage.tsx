import { useParams, Link, Navigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const { getLevelById } = useCourses();
  const { isPaid } = useAuth();
  const { getLessonProgress } = useProgress();

  const level = getLevelById(levelId || "");
  if (!level) return <Navigate to="/dashboard" replace />;
  if (level.isPaid && !isPaid) return <Navigate to="/upgrade" replace />;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold uppercase ${level.isPaid ? "text-trading-gold" : "text-trading-green"}`}>
            {level.isPaid ? "Premium" : "Free"} Level
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">{level.name}</h1>
        <p className="text-muted-foreground mt-1">{level.description}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {level.courses.map((course) => {
          const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
          const progress = getLessonProgress(lessonIds);

          return (
            <Link key={course.id} to={`/course/${course.id}`} className="group">
              <div className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-all h-full">
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
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
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
