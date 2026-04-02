import { supabase } from '@/lib/supabaseClient';
import { Course, Module, Lesson, Quiz, QuizQuestion } from '@/types/content';

// Courses CRUD
export const courseService = {
  async getAll() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Course[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Course;
  },

  async create(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('courses')
      .insert([course])
      .select()
      .single();
    if (error) throw error;
    return data as Course;
  },

  async update(id: string, updates: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Course;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Modules CRUD
export const moduleService = {
  async getByCourse(courseId: string) {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data as Module[];
  },

  async create(module: Omit<Module, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('modules')
      .insert([module])
      .select()
      .single();
    if (error) throw error;
    return data as Module;
  },

  async update(id: string, updates: Partial<Module>) {
    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Module;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Lessons CRUD
export const lessonService = {
  async getByModule(moduleId: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data as Lesson[];
  },

  async create(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lesson])
      .select()
      .single();
    if (error) throw error;
    return data as Lesson;
  },

  async update(id: string, updates: Partial<Lesson>) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Lesson;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Quizzes CRUD
export const quizService = {
  async getByLesson(lessonId: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as Quiz | null;
  },

  async create(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quiz])
      .select()
      .single();
    if (error) throw error;
    return data as Quiz;
  },

  async update(id: string, updates: Partial<Quiz>) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Quiz;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Quiz Questions CRUD
export const questionService = {
  async getByQuiz(quizId: string) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data as QuizQuestion[];
  },

  async create(question: Omit<QuizQuestion, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert([question])
      .select()
      .single();
    if (error) throw error;
    return data as QuizQuestion;
  },

  async update(id: string, updates: Partial<QuizQuestion>) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as QuizQuestion;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};