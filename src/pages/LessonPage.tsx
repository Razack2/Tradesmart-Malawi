import { useParams, Link, Navigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function LessonPage() {
  
  const { lessonId } = useParams<{ lessonId: string }>();
const [answers, setAnswers] = useState<Record<string, number>>({});
const [results, setResults] = useState<Record<string, boolean>>({});
  const courseContext = useCourses();
  const { getLessonById, getLevelById } = courseContext;
  const courses = (courseContext as any).courses;


  const { user, isAdmin } = useAuth();
  const { markComplete, isCompleted } = useProgress();

  const lesson = getLessonById(lessonId || "");
// ADD IT HERE
if (!lesson) {
  return <Navigate to="/dashboard" replace />;
}

useEffect(() => {
  if (!lesson) return;

  const hasNoQuiz =
    !lesson.quiz || lesson.quiz.length === 0;

  if (hasNoQuiz) {
    markComplete(lesson.id);
  }
}, [lesson?.id, lesson?.quiz, markComplete]);

<Button onClick={() => markComplete(lesson.id)}>
  Mark Lesson Complete
</Button>

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
{isCompleted && (
  <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
    ✓ Completed
  </div>
)}
      <p className="text-muted-foreground mb-6">
        {lesson.description}
      </p>
{/* VIDEO */}
{lesson.videoUrl && (
  <div className="mb-6">
    <div className="aspect-video overflow-hidden rounded-xl border">
      <iframe
        src={lesson.videoUrl}
        title={lesson.title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </div>
)}

{/* IMAGE */}
{lesson.imageUrl && (
  <div className="mb-6">
    <img
      src={lesson.imageUrl}
      alt={lesson.title}
      className="w-full rounded-xl border"
    />
  </div>
)}
{/* CONTENT */}
<div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
  <div
    className="prose max-w-none"
    dangerouslySetInnerHTML={{
      __html: lesson.content || "",
    }}
  />
</div>
{/* QUIZ */}
{lesson.quiz && lesson.quiz.length > 0 && (
  <div className="mt-8 bg-card border rounded-xl p-6">
    <h2 className="text-2xl font-bold mb-6 border-b pb-2 bg-red-100/10 text-red-700 rounded-t-lg px-4 py-2">
      Quiz
    </h2>

    <div className="space-y-6">
      {lesson.quiz.map((question, index) => (
        <div
          key={question.id}
          className="border rounded-lg p-4"
        >
          <h3 className="font-semibold mb-4">
            {index + 1}. {question.question}
          </h3>

          {/* OPTIONS */}
          <div className="space-y-2">
            {question.options?.map(
              (option, optionIndex) => (
                <label
                  key={optionIndex}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={
                      answers[question.id] ===
                      optionIndex
                    }
                    onChange={() => {
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]:
                          optionIndex,
                      }));

                      setResults((prev) => ({
                        ...prev,
                        [question.id]:
                          optionIndex ===
                          question.correctAnswer,
                      }));
                    }}
                  />

                  <span>{option}</span>
                </label>
              )
            )}
          </div>

          {/* FEEDBACK */}
          {results[question.id] !==
            undefined && (
            <div className="mt-4">
              {results[
                question.id
              ] ? (
                <p className="text-green-600 font-medium">
                  ✅ Correct Answer
                </p>
              ) : (
                <>
                  <p className="text-red-600 font-medium">
                    ❌ Incorrect Answer
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    Correct answer:{" "}
                    {
                      question.options[
                        question
                          .correctAnswer
                      ]
                    }
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>

    {/* QUIZ SCORE */}
    <div className="mt-6">
     <Button
  onClick={() => {
    const score =
      lesson.quiz.filter(
        (q) =>
          answers[q.id] ===
          q.correctAnswer
      ).length;

    const percentage =
      Math.round(
        (score /
          lesson.quiz.length) *
          100
      );

    if (percentage >= 70) {
      markComplete(lesson.id);

      alert(
        `🎉 Passed! Score: ${score}/${lesson.quiz.length}`
      );
    } else {
      alert(
        `❌ Failed. Score: ${score}/${lesson.quiz.length}. You need 70% to pass.`
      );
    }
  }}
>
  Submit Quiz
</Button>
    </div>
  </div>
)}
</div>
  );
}