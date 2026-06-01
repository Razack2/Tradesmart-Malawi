import { useState, useEffect } from "react";
import { useCourses } from "@/contexts/CourseContext";
import { Course, LevelType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Define the Level interface for your app
interface Level {
  id: string;
  name: LevelType;
  isPaid: boolean;
  description: string;
}

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [levelId, setLevelId] = useState("");
  const [category, setCategory] = useState<"crypto" | "forex">("forex");
  const { refreshContent } = useCourses();

  // Fetch levels and courses from Supabase
  useEffect(() => {
    fetchLevels();
    fetchCourses();
  }, []);

  const fetchLevels = async () => {
    try {
      // First, check if levels table exists, if not, create default levels
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching levels:', error);
        // Create default levels if table doesn't exist or is empty
        if (error.code === '42P01') {
          await createDefaultLevels();
        }
        return;
      }

      if (data && data.length > 0) {
        setLevels(data);
      } else {
        await createDefaultLevels();
      }
    } catch (error) {
      console.error('Error in fetchLevels:', error);
      await createDefaultLevels();
    }
  };

  const createDefaultLevels = async () => {
    const defaultLevels = [
      { name: "Beginner", isPaid: false, description: "Perfect for newcomers" },
      { name: "Intermediate", isPaid: true, description: "For those with basic knowledge" },
      { name: "Expert", isPaid: true, description: "Advanced strategies and techniques" }
    ];

    const levelsToInsert = defaultLevels.map(level => ({
      ...level,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('levels')
      .insert(levelsToInsert)
      .select();

    if (!error && data) {
      setLevels(data);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules:modules(
            id,
            title,
            order_index,
            lessons:lessons(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database courses to match your Course interface
      const transformedCourses: Course[] = (data || []).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        levelId: course.level, // Map level string to levelId
        category: course.category || "forex",
        thumbnail: course.thumbnail,
        modules: (course.modules || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map(module => ({
            id: module.id,
            title: module.title,
            courseId: course.id,
            lessons: (module.lessons || [])
              .sort((a, b) => a.order_index - b.order_index)
              .map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                content: lesson.content || '',
                videoUrl: lesson.video_url,
                moduleId: module.id,
                order: lesson.order_index,
                quiz: [] // You can fetch quizzes separately if needed
              })),
            order: module.order_index
          }))
      }));

      setCourses(transformedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLevelId("");
    setCategory("forex");
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (c: Course) => {
    setEditId(c.id);
    setTitle(c.title);
    setDescription(c.description);
    setLevelId(c.levelId);
    setCategory(c.category);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title || !levelId) return;

    try {
      if (editId) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update({
            title,
            description,
            level: levelId, // Store the level string
            category,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId);

        if (error) throw error;
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert({
            title,
            description,
            level: levelId, // Store the level string
            category,
            is_published: false,
            price: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      await fetchCourses(); // Refresh the list
      await refreshContent();
      resetForm();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this course and all its modules/lessons?")) {
      try {
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await fetchCourses(); // Refresh the list
        await refreshContent();
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading courses...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-semibold text-foreground">Courses ({courses.length})</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gradient-primary border-0 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> New Course
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-6 space-y-4">
          <h3 className="font-display font-semibold text-card-foreground">
            {editId ? "Edit Course" : "New Course"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course title" />
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={levelId} onValueChange={setLevelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as "crypto" | "forex")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Course description" rows={3} />
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
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Level</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Modules</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.map((c) => {
              const level = levels.find((l) => l.id === c.levelId);
              return (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="p-3 text-sm font-medium text-card-foreground">{c.title}</td>
                  <td className="p-3 text-sm text-muted-foreground">{level?.name || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground capitalize">{c.category}</td>
                  <td className="p-3 text-sm text-muted-foreground">{c.modules?.length || 0}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">No courses yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}