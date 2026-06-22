import { useState, useEffect } from "react";
import { useCourses } from "@/contexts/CourseContext";
import { Lesson, Module, Course } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ManageLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { refreshContent } = useCourses();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [order, setOrder] = useState(1);

  // Fetch data from Supabase
  useEffect(() => {
    fetchCourses();
    fetchModules();
    fetchLessons();
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
      setLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          quizzes:quizzes(*)
        `)
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
        quiz: (lesson.quizzes || []).map(quiz => ({
          id: quiz.id,
          question: quiz.title,
          options: [],
          correctAnswer: 0,
        })),
      }));

      setLessons(transformedLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setVideoUrl("");
    setImageUrl("");
    setModuleId("");
    setOrder(1);
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (l: Lesson) => {
    setEditId(l.id);
    setTitle(l.title);
    setContent(l.content);
    setVideoUrl(l.videoUrl || "");
    setImageUrl(l.imageUrl || "");
    setModuleId(l.moduleId);
    setOrder(l.order);
    setShowForm(true);
  };

const convertYoutubeUrl = (url: string) => {
  try {
    if (url.includes("youtube.com/watch")) {
      const videoId =
        new URL(url).searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (url.includes("youtu.be/")) {
      const videoId =
        url.split("youtu.be/")[1];

      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  } catch {
    return url;
  }
};
  const handleSave = async () => {
    if (!title || !moduleId) return;

    try {
      if (editId) {
        // Update existing lesson
        const { error } = await supabase
          .from('lessons')
          .update({
            title,
            content,
            video_url: convertYoutubeUrl(videoUrl) || null,
            image_url: imageUrl || null,
            module_id: moduleId,
            order_index: order,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId);

        if (error) throw error;
      } else {
        // Create new lesson
        const { error } = await supabase
          .from('lessons')
          .insert({
            title,
            content,
            video_url: convertYoutubeUrl(videoUrl) || null,
            image_url: imageUrl || null,
            module_id: moduleId,
            order_index: order,
            is_free_preview: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      await fetchLessons(); // Refresh the list
      await refreshContent();
      resetForm();
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Failed to save lesson. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this lesson? This will also delete any associated quizzes.")) {
      try {
        const { error } = await supabase
          .from('lessons')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await fetchLessons(); // Refresh the list
        await refreshContent();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        alert('Failed to delete lesson. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-semibold text-foreground">Lessons ({lessons.length})</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gradient-primary border-0 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> New Lesson
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-6 space-y-4">
          <h3 className="font-display font-semibold text-card-foreground">
            {editId ? "Edit Lesson" : "New Lesson"}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" />
            </div>
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={moduleId} onValueChange={setModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((m) => {
                    const c = courses.find((co) => co.id === m.courseId);
                    return (
                      <SelectItem key={m.id} value={m.id}>
                        {c?.title || "Unknown Course"} → {m.title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Content (HTML)</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="<h2>Lesson content...</h2>"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Video URL (optional)</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/embed/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL (optional)</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
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
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Module</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Has Video</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Quiz</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lessons.map((l) => {
              const mod = modules.find((m) => m.id === l.moduleId);
              return (
                <tr key={l.id} className="hover:bg-muted/30">
                  <td className="p-3 text-sm font-medium text-card-foreground">{l.title}</td>
                  <td className="p-3 text-sm text-muted-foreground">{mod?.title || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{l.videoUrl ? "Yes" : "No"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{l.quiz?.length || 0} questions</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(l)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(l.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No lessons yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}