import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { ArrowLeft, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { getLessonById, getModuleById, getCourseById, getLevelById } = useCourses();
  const { isPaid, isAdmin } = useAuth();
  const { isCompleted, markComplete } = useProgress();

  const lesson = getLessonById(lessonId || "");
  if (!lesson) return <Navigate to="/dashboard" replace />;

  const mod = getModuleById(lesson.moduleId);
  const course = mod ? getCourseById(mod.courseId) : undefined;
  const level = course ? getLevelById(course.levelId) : undefined;

  if (level?.isPaid && !isPaid && !isAdmin) return <Navigate to="/upgrade" replace />;

  const done = isCompleted(lesson.id);

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to={course ? `/course/${course.id}` : "/dashboard"}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to {course?.title || "Dashboard"}
        </Link>
      </Button>

      <div className="mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {level?.name} → {course?.title} → {mod?.title}
        </p>
        <h1 className="text-3xl font-display font-bold text-foreground">{lesson.title}</h1>
      </div>

      {/* Video */}
      {lesson.videoUrl && (
        <div className="mb-8 rounded-xl overflow-hidden bg-foreground/5 aspect-video">
          <iframe
            src={lesson.videoUrl}
            className="w-full h-full"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-sm max-w-none mb-8 text-foreground 
          prose-headings:font-display prose-headings:text-foreground
          prose-strong:text-foreground prose-li:text-foreground
          prose-p:text-foreground/85"
        dangerouslySetInnerHTML={{ __html: lesson.content }}
      />

      {/* Image */}
      {lesson.imageUrl && (
        <div className="mb-8">
          <img src={lesson.imageUrl} alt={lesson.title} className="rounded-xl max-w-full" />
        </div>
      )}

      {/* Quiz */}
      {lesson.quiz && lesson.quiz.length > 0 && <QuizSection quiz={lesson.quiz} />}

      {/* Mark Complete */}
      <div className="mt-8 pt-6 border-t border-border">
        {done ? (
          <div className="flex items-center gap-2 text-trading-green">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Lesson completed!</span>
          </div>
        ) : (
          <Button onClick={() => markComplete(lesson.id)} className="gradient-primary border-0 text-primary-foreground">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizSection({ quiz }: { quiz: { id: string; question: string; options: string[]; correctAnswer: number }[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qId: string, idx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
  };

  const score = quiz.filter((q) => answers[q.id] === q.correctAnswer).length;

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border">
      <h2 className="text-xl font-display font-semibold text-card-foreground mb-4">📝 Quiz</h2>
      <div className="space-y-6">
        {quiz.map((q, qi) => (
          <div key={q.id}>
            <p className="font-medium text-card-foreground mb-2">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                const isCorrect = q.correctAnswer === oi;
                let cls = "border border-border rounded-lg p-3 text-sm cursor-pointer transition-colors ";
                if (submitted) {
                  if (isCorrect) cls += "bg-trading-green/10 border-trading-green text-foreground";
                  else if (selected) cls += "bg-destructive/10 border-destructive text-foreground";
                  else cls += "text-muted-foreground";
                } else {
                  cls += selected
                    ? "bg-primary/10 border-primary text-foreground"
                    : "hover:bg-muted text-foreground";
                }
                return (
                  <div key={oi} className={cls} onClick={() => handleSelect(q.id, oi)}>
                    {opt}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        {!submitted ? (
          <Button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < quiz.length}
            className="gradient-primary border-0 text-primary-foreground"
          >
            Submit Quiz
          </Button>
        ) : (
          <div className="text-lg font-display font-semibold text-card-foreground">
            Score: {score}/{quiz.length} ({Math.round((score / quiz.length) * 100)}%)
          </div>
        )}
      </div>
    </div>
  );
}
