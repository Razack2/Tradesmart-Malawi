import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface ProgressContextType {
  completedLessons: string[];
  markComplete: (lessonId: string) => void;
  isCompleted: (lessonId: string) => boolean;
  getLessonProgress: (lessonIds: string[]) => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = user ? `tradesmart_progress_${user.email}` : null;

  const [completedLessons, setCompleted] = useState<string[]>(() => {
    if (!key) return [];
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (key) {
      const stored = localStorage.getItem(key);
      setCompleted(stored ? JSON.parse(stored) : []);
    } else {
      setCompleted([]);
    }
  }, [key]);

  useEffect(() => {
    if (key) localStorage.setItem(key, JSON.stringify(completedLessons));
  }, [completedLessons, key]);

  const markComplete = (lessonId: string) => {
    setCompleted((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
  };

  const isCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  const getLessonProgress = (lessonIds: string[]) => {
    if (lessonIds.length === 0) return 0;
    const done = lessonIds.filter((id) => completedLessons.includes(id)).length;
    return Math.round((done / lessonIds.length) * 100);
  };

  return (
    <ProgressContext.Provider value={{ completedLessons, markComplete, isCompleted, getLessonProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
