import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Level, Course, Module, Lesson, QuizQuestion } from "@/types";
import { defaultLevels } from "@/data/mockData";

interface CourseContextType {
  levels: Level[];
  setLevels: React.Dispatch<React.SetStateAction<Level[]>>;
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
const LEVELS_KEY = "tradesmart_levels";

export function CourseProvider({ children }: { children: ReactNode }) {
  const [levels, setLevels] = useState<Level[]>(() => {
    const stored = localStorage.getItem(LEVELS_KEY);
    return stored ? JSON.parse(stored) : defaultLevels;
  });

  useEffect(() => {
    localStorage.setItem(LEVELS_KEY, JSON.stringify(levels));
  }, [levels]);

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
        levels, setLevels,
        addLevel, updateLevel, deleteLevel,
        addCourse, updateCourse, deleteCourse,
        addModule, updateModule, deleteModule,
        addLesson, updateLesson, deleteLesson,
        getCourseById, getLevelById, getModuleById, getLessonById,
        getAllCourses, getAllModules, getAllLessons,
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
