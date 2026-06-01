import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Level, Course, Module, Lesson, QuizQuestion } from "@/types";

interface CourseContextType {
  levels: Level[];
  setLevels: React.Dispatch<React.SetStateAction<Level[]>>;
  refreshContent: () => Promise<void>;
  addLevel: (level: Level) => void;
  updateLevel: (id: string, data: Partial<Level>) => void;
  deleteLevel: (id: string) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addModule: (mod: Module) => void;
  updateModule: (id: string, data: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  addLesson: (lesson: Lesson) => void;
  updateLesson: (id: string, data: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
  getLevelById: (id: string) => Level | undefined;
  getModuleById: (id: string) => Module | undefined;
  getLessonById: (id: string) => Lesson | undefined;
  getAllCourses: () => Course[];
  getAllModules: () => Module[];
  getAllLessons: () => Lesson[];
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [levels, setLevels] = useState<Level[]>([]);

  const refreshContent = async () => {
    try {
      const [levelsResponse, coursesResponse, modulesResponse, lessonsResponse, quizzesResponse, questionsResponse] =
        await Promise.all([
          supabase.from('levels').select('*').order('name', { ascending: true }),
          supabase.from('courses').select('*').order('created_at', { ascending: false }),
          supabase.from('modules').select('*').order('order_index', { ascending: true }),
          supabase.from('lessons').select('*').order('order_index', { ascending: true }),
          supabase.from('quizzes').select('*'),
          supabase.from('quiz_questions').select('*').order('order_index', { ascending: true }),
        ]);

      const levelsData = levelsResponse.data ?? [];
      const coursesData = coursesResponse.data ?? [];
      const modulesData = modulesResponse.data ?? [];
      const lessonsData = lessonsResponse.data ?? [];
      const quizData = quizzesResponse.data ?? [];
      const questionsData = questionsResponse.data ?? [];

      const questionsByQuiz = questionsData.reduce<Record<string, QuizQuestion[]>>((acc, question: any) => {
        const quizId = question.quiz_id || "";
        const mappedQuestion: QuizQuestion = {
          id: question.id,
          question: question.question,
          options: question.options || ["", "", "", ""],
          correctAnswer: Number(question.correct_answer) || 0,
        };
        acc[quizId] = acc[quizId] || [];
        acc[quizId].push(mappedQuestion);
        return acc;
      }, {});

      const quizByLessonId = quizData.reduce<Record<string, any>>((acc, quiz) => {
        if (quiz.lesson_id) acc[quiz.lesson_id] = quiz;
        return acc;
      }, {});

      const lessonsByModule = lessonsData.reduce<Record<string, Lesson[]>>((acc, lesson) => {
        const lessonItem: Lesson = {
          id: lesson.id,
          title: lesson.title,
          content: lesson.content || "",
          videoUrl: lesson.video_url || undefined,
          imageUrl: lesson.image_url || undefined,
          moduleId: lesson.module_id,
          order: lesson.order_index,
          quiz: [],
        };

        const quizRow = quizByLessonId[lessonItem.id];
        if (quizRow) {
          lessonItem.quiz = questionsByQuiz[quizRow.id] ?? [];
        }

        acc[lessonItem.moduleId] = acc[lessonItem.moduleId] || [];
        acc[lessonItem.moduleId].push(lessonItem);
        return acc;
      }, {});

      const modulesByCourse = modulesData.reduce<Record<string, Module[]>>((acc, module) => {
        const moduleItem: Module = {
          id: module.id,
          title: module.title,
          courseId: module.course_id,
          lessons: (lessonsByModule[module.id] || []).sort((a, b) => a.order - b.order),
          order: module.order_index,
        };

        acc[moduleItem.courseId] = acc[moduleItem.courseId] || [];
        acc[moduleItem.courseId].push(moduleItem);
        return acc;
      }, {});

      const coursesByLevel = coursesData.reduce<Record<string, Course[]>>((acc, course) => {
        const courseItem: Course = {
          id: course.id,
          title: course.title,
          description: course.description || "",
          levelId: course.level,
          category: course.category === 'crypto' ? 'crypto' : 'forex',
          modules: (modulesByCourse[course.id] || []).sort((a, b) => a.order - b.order),
          thumbnail: course.thumbnail,
        };

        acc[courseItem.levelId] = acc[courseItem.levelId] || [];
        acc[courseItem.levelId].push(courseItem);
        return acc;
      }, {});

      const levelOrder = ["Beginner", "Intermediate", "Expert"];
      const normalizedLevelsMap: Record<string, Level> = {};

      levelsData.forEach((level) => {
        const levelName = (level.name || "").trim() as Level['name'];
        if (!levelName) return;

        const levelCourses = (coursesByLevel[level.id] || []).sort((a, b) => a.title.localeCompare(b.title));
        const existing = normalizedLevelsMap[levelName];

        if (existing) {
          existing.courses = [...existing.courses, ...levelCourses].sort((a, b) => a.title.localeCompare(b.title));
          existing.isPaid = existing.isPaid || Boolean(level.isPaid);
          if (!existing.description && level.description) {
            existing.description = level.description;
          }
          return;
        }

        const normalizedIsPaid = Boolean(level.isPaid) || levelName !== "Beginner";
        normalizedLevelsMap[levelName] = {
          id: level.id,
          name: levelName,
          isPaid: normalizedIsPaid,
          description: level.description || "",
          courses: levelCourses,
        };
      });

      const normalizedLevels = Object.values(normalizedLevelsMap).sort((a, b) => {
        const aIndex = levelOrder.indexOf(a.name);
        const bIndex = levelOrder.indexOf(b.name);
        if (aIndex !== -1 || bIndex !== -1) {
          return aIndex - bIndex;
        }
        return a.name.localeCompare(b.name);
      });

      setLevels(normalizedLevels);
    } catch (error) {
      console.error("Error loading course content:", error);
      setLevels([]);
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  const addLevel = (level: Level) => setLevels((prev) => [...prev, level]);
  const updateLevel = (id: string, data: Partial<Level>) =>
    setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  const deleteLevel = (id: string) => setLevels((prev) => prev.filter((l) => l.id !== id));

  const addCourse = (course: Course) =>
    setLevels((prev) =>
      prev.map((l) => (l.id === course.levelId ? { ...l, courses: [...l.courses, course] } : l))
    );
  const updateCourse = (id: string, data: Partial<Course>) =>
    setLevels((prev) =>
      prev.map((l) => ({
        ...l,
        courses: l.courses.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }))
    );
  const deleteCourse = (id: string) =>
    setLevels((prev) =>
      prev.map((l) => ({ ...l, courses: l.courses.filter((c) => c.id !== id) }))
    );

  const addModule = (mod: Module) =>
    setLevels((prev) =>
      prev.map((l) => ({
        ...l,
        courses: l.courses.map((c) =>
          c.id === mod.courseId ? { ...c, modules: [...c.modules, mod] } : c
        ),
      }))
    );
  const updateModule = (id: string, data: Partial<Module>) =>
    setLevels((prev) =>
      prev.map((l) => ({
        ...l,
        courses: l.courses.map((c) => ({
          ...c,
          modules: c.modules.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),
      }))
    );
  const deleteModule = (id: string) =>
    setLevels((prev) =>
      prev.map((l) => ({
        ...l,
        courses: l.courses.map((c) => ({
          ...c,
          modules: c.modules.filter((m) => m.id !== id),
        })),
      }))
    );

  const addLesson = (lesson: Lesson) =>
    setLevels((prev) =>
      prev.map((l) => ({
        ...l,
        courses: l.courses.map((c) => ({
          ...c,
          modules: c.modules.map((m) =>
            m.id === lesson.moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m
          ),
        })),
      }))
    );
  const updateLesson = (id: string, data: Partial<Lesson>) =>
    setLevels((prev) =>
      prev.map((l) => ({
        ...l,
        courses: l.courses.map((c) => ({
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((ls) => (ls.id === id ? { ...ls, ...data } : ls)),
          })),
        })),
      }))
    );
  const deleteLesson = (id: string) =>
    setLevels((prev) =>
      prev.map((l) => ({
        ...l,
        courses: l.courses.map((c) => ({
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            lessons: m.lessons.filter((ls) => ls.id !== id),
          })),
        })),
      }))
    );

  const getAllCourses = () => levels.flatMap((l) => l.courses);
  const getAllModules = () => getAllCourses().flatMap((c) => c.modules);
  const getAllLessons = () => getAllModules().flatMap((m) => m.lessons);

  const getCourseById = (id: string) => getAllCourses().find((c) => c.id === id);
  const getLevelById = (id: string) => levels.find((l) => l.id === id);
  const getModuleById = (id: string) => getAllModules().find((m) => m.id === id);
  const getLessonById = (id: string) => getAllLessons().find((l) => l.id === id);

  return (
    <CourseContext.Provider
      value={{
        levels,
        setLevels,
        refreshContent,
        addLevel,
        updateLevel,
        deleteLevel,
        addCourse,
        updateCourse,
        deleteCourse,
        addModule,
        updateModule,
        deleteModule,
        addLesson,
        updateLesson,
        deleteLesson,
        getCourseById,
        getLevelById,
        getModuleById,
        getLessonById,
        getAllCourses,
        getAllModules,
        getAllLessons,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used within CourseProvider");
  return ctx;
}
