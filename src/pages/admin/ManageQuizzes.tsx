import { useState, useEffect } from "react";
import { useCourses } from "@/contexts/CourseContext";
import { QuizQuestion, Lesson, Module, Course } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface QuizItem extends QuizQuestion {
  question_type: string;
  lessonId: string;
  lessonTitle: string;
}

export default function ManageQuizzes() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizItem[]>([]);
  const { refreshContent } = useCourses();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [questionType, setQuestionType] = useState<"multiple_choice" | "true_false">("multiple_choice");

  // Fetch data from Supabase
  useEffect(() => {
    fetchCourses();
    fetchModules();
    fetchLessons();
    fetchQuizzes();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at');

      if (error) throw error;

      const transformedCourses: Course[] = (data || []).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        levelId: course.level,
        category: course.category || "forex",
        modules: [],
        thumbnail: course.thumbnail,
      }));

      setCourses(transformedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('order_index');

      if (error) throw error;

      const transformedModules: Module[] = (data || []).map(module => ({
        id: module.id,
        title: module.title,
        courseId: module.course_id,
        lessons: [],
        order: module.order_index,
        description: module.description,
      }));

      setModules(transformedModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index');

      if (error) throw error;

      const transformedLessons: Lesson[] = (data || []).map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content || '',
        videoUrl: lesson.video_url,
        imageUrl: lesson.image_url,
        moduleId: lesson.module_id,
        order: lesson.order_index,
        quiz: [],
      }));

      setLessons(transformedLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          quizzes:quiz_id(
            lesson_id,
            title
          )
        `)
        .order('order_index');

      if (error) throw error;

      const transformedQuizzes: QuizItem[] = (data || []).map(quiz => {
        const lesson = lessons.find(l => l.id === quiz.quizzes?.lesson_id);
        return {
          id: quiz.id,
          question: quiz.question,
          options: quiz.options || ["", "", "", ""],
          correctAnswer: parseInt(quiz.correct_answer) || 0,
          lessonId: quiz.quizzes?.lesson_id || "",
          lessonTitle: lesson?.title || "Unknown Lesson",
          quiz_id: quiz.quiz_id,
          question_type: quiz.question_type,
          correct_answer: quiz.correct_answer,
          points: quiz.points,
          order_index: quiz.order_index,
        };
      });

      setQuizQuestions(transformedQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setLessonId("");
    setQuestionType("multiple_choice");
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (item: QuizItem) => {
    setEditId(item.id);
    setLessonId(item.lessonId);
    setQuestion(item.question);
    setOptions(item.options.length === 4 ? [...item.options] : ["", "", "", ""]);
    setCorrectAnswer(item.correctAnswer);
    setQuestionType(
      item.question_type === "true_false" ? "true_false" : "multiple_choice"
    );
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!question || !lessonId) return;

    // For true/false questions, only need 2 options
    const finalOptions = questionType === "true_false"
      ? ["True", "False"]
      : options;

    if (finalOptions.some((o) => !o)) return;

    try {
      // First, check if a quiz exists for this lesson
      let quizId = null;

      const { data: existingQuiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .single();

      if (quizError && quizError.code !== 'PGRST116') {
        throw quizError;
      }

      if (existingQuiz) {
        quizId = existingQuiz.id;
      } else {
        // Create a new quiz for this lesson
        const { data: newQuiz, error: createError } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: lessonId,
            title: `Quiz for ${lessons.find(l => l.id === lessonId)?.title || 'Lesson'}`,
            passing_score: 70,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        quizId = newQuiz.id;
      }

      if (editId) {
        // Update existing question
        const { error } = await supabase
          .from('quiz_questions')
          .update({
            question,
            options: finalOptions,
            correct_answer: correctAnswer.toString(),
            question_type: questionType,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId);

        if (error) throw error;
      } else {
        // Get current max order index
        const { data: maxOrder } = await supabase
          .from('quiz_questions')
          .select('order_index')
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: false })
          .limit(1);

        const nextOrder = (maxOrder && maxOrder[0]?.order_index + 1) || 0;

        // Create new question
        const { error } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quizId,
            question,
            options: finalOptions,
            correct_answer: correctAnswer.toString(),
            question_type: questionType,
            points: 1,
            order_index: nextOrder,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      await fetchQuizzes(); // Refresh the list
      await refreshContent();
      resetForm();
    } catch (error) {
      console.error('Error saving quiz question:', error);
      alert('Failed to save quiz question. Please try again.');
    }
  };

  const handleDelete = async (quizId: string, lessonId: string) => {
    if (!confirm("Delete this quiz question?")) return;

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      // Check if there are any remaining questions for this quiz
      const { data: remainingQuestions, error: checkError } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quizId);

      if (checkError) throw checkError;

      // If no questions left, delete the quiz
      if (remainingQuestions.length === 0) {
        await supabase
          .from('quizzes')
          .delete()
          .eq('lesson_id', lessonId);
      }

      await fetchQuizzes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting quiz question:', error);
      alert('Failed to delete quiz question. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading quiz questions...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-semibold text-foreground">
          Quiz Questions ({quizQuestions.length})
        </h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gradient-primary border-0 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> New Question
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-6 space-y-4">
          <h3 className="font-display font-semibold text-card-foreground">
            {editId ? "Edit Question" : "New Question"}
          </h3>
          <div className="space-y-2">
            <Label>Lesson</Label>
            <Select value={lessonId} onValueChange={setLessonId}>
              <SelectTrigger>
                <SelectValue placeholder="Select lesson" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((l) => {
                  const mod = modules.find((m) => m.id === l.moduleId);
                  const course = mod ? courses.find((c) => c.id === mod.courseId) : undefined;
                  return (
                    <SelectItem key={l.id} value={l.id}>
                      {course?.title || "Unknown Course"} → {l.title}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={questionType} onValueChange={(v: any) => {
              setQuestionType(v);
              if (v === "true_false") {
                setOptions(["True", "False"]);
              } else {
                setOptions(["", "", "", ""]);
              }
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter question"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {options.map((opt, i) => (
              <div key={i} className="space-y-1">
                <Label className="flex items-center gap-2">
                  Option {i + 1}
                  {correctAnswer === i && (
                    <span className="text-xs text-trading-green font-bold">✓ Correct</span>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`Option ${i + 1}`}
                    disabled={questionType === "true_false"}
                  />
                  <Button
                    type="button"
                    variant={correctAnswer === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCorrectAnswer(i)}
                    className={correctAnswer === i ? "gradient-primary border-0 text-primary-foreground" : ""}
                  >
                    ✓
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="gradient-primary border-0 text-primary-foreground">
              <Check className="mr-2 h-4 w-4" /> {editId ? "Update" : "Create"}
            </Button>
            <Button onClick={resetForm} variant="ghost" size="sm">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Question</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Lesson</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Options</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quizQuestions.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="p-3 text-sm font-medium text-card-foreground max-w-xs truncate">
                  {item.question}
                </td>
                <td className="p-3 text-sm text-muted-foreground">{item.lessonTitle}</td>
                <td className="p-3 text-sm text-muted-foreground">{item.options.length}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id, item.lessonId)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {quizQuestions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  No quiz questions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}