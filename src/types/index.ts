export type UserRole = "admin" | "student";
export type SubscriptionType = "free" | "paid";
export type LevelType = "Beginner" | "Intermediate" | "Expert";

export interface User {
  email: string;
  role: UserRole;
  subscription: SubscriptionType;
  name: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  quiz?: QuizQuestion[];
  moduleId: string;
  order: number;
}

export interface Module {
  id: string;
  title: string;
  courseId: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  levelId: string;
  modules: Module[];
  category: "crypto" | "forex";
  thumbnail?: string;
}

export interface Level {
  id: string;
  name: LevelType;
  isPaid: boolean;
  description: string;
  courses: Course[];
}

export interface ProgressData {
  completedLessons: string[];
}
