// User Types
export type UserRole = "admin" | "student";
export type SubscriptionType = "free" | "paid";
export type LevelType = "Beginner" | "Intermediate" | "Expert";

export interface User {
    id?: string; // Add id for database
    email: string;
    role: UserRole;
    subscription: SubscriptionType;
    name: string;
    created_at?: string; // Optional for new users
}

// Content Types (Updated to include database fields)
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    // Database fields
    quiz_id?: string;
    question_type?: 'multiple_choice' | 'true_false' | 'text';
    correct_answer?: string;
    points?: number;
    order_index?: number;
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
    // Database fields
    module_id?: string;
    video_url?: string;
    is_free_preview?: boolean;
    duration?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Module {
    id: string;
    title: string;
    courseId: string;
    lessons: Lesson[];
    order: number;
    // Database fields
    course_id?: string;
    order_index?: number;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    levelId: string;
    modules: Module[];
    category: "crypto" | "forex";
    thumbnail?: string;
    // Database fields
    level?: string;
    price?: number;
    duration?: number;
    instructor?: string;
    is_published?: boolean;
    created_at?: string;
    updated_at?: string;
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

// New types for database operations (if needed)
export interface CourseDB {
    id: string;
    title: string;
    description: string;
    level: string;
    price: number;
    duration: number;
    instructor: string;
    thumbnail?: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface ModuleDB {
    id: string;
    course_id: string;
    title: string;
    description?: string;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface LessonDB {
    id: string;
    module_id: string;
    title: string;
    content?: string;
    video_url?: string;
    duration?: number;
    order_index: number;
    is_free_preview: boolean;
    created_at: string;
    updated_at: string;
}

export interface QuizDB {
    id: string;
    lesson_id: string;
    title: string;
    description?: string;
    passing_score: number;
    time_limit?: number;
    created_at: string;
    updated_at: string;
}

export interface QuizQuestionDB {
    id: string;
    quiz_id: string;
    question: string;
    question_type: 'multiple_choice' | 'true_false' | 'text';
    options?: string[];
    correct_answer: string;
    points: number;
    order_index: number;
    created_at: string;
}