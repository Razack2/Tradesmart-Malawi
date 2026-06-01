import { useState, useEffect } from "react";
import { useCourses } from "@/contexts/CourseContext";
import { Course, Module } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ManageModules() {
  const { refreshContent } = useCourses();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [order, setOrder] = useState(1);

  useEffect(() => {
    fetchCourses();
    fetchModules();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCourses(
        (data || []).map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          levelId: course.level,
          category: course.category || "forex",
          modules: [],
          thumbnail: course.thumbnail,
        }))
      );
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('modules')
        .select('*, lessons:lessons(id)')
        .order('order_index', { ascending: true });

      if (error) throw error;

      setModules(
        (data || []).map((module) => ({
          id: module.id,
          title: module.title,
          courseId: module.course_id,
          lessons: module.lessons || [],
          order: module.order_index,
          description: module.description,
          course_id: module.course_id,
          order_index: module.order_index,
        }))
      );
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCourseId("");
    setOrder(1);
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (m: Module) => {
    setEditId(m.id);
    setTitle(m.title);
    setCourseId(m.courseId);
    setOrder(m.order);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title || !courseId) return;

    try {
      if (editId) {
        const { error } = await supabase
          .from('modules')
          .update({
            title,
            course_id: courseId,
            order_index: order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('modules')
          .insert({
            title,
            course_id: courseId,
            order_index: order,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      await fetchModules();
      await refreshContent();
      resetForm();
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchModules();
      await refreshContent();
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading modules...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-semibold text-foreground">Modules ({modules.length})</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gradient-primary border-0 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> New Module
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-6 space-y-4">
          <h3 className="font-display font-semibold text-card-foreground">{editId ? "Edit Module" : "New Module"}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Module title" />
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={1} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="gradient-primary border-0 text-primary-foreground">
              <Check className="mr-2 h-4 w-4" /> {editId ? "Update" : "Create"}
            </Button>
            <Button onClick={resetForm} variant="ghost" size="sm"><X className="mr-2 h-4 w-4" /> Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Course</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Order</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Lessons</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {modules.map((m) => {
              const course = courses.find((c) => c.id === m.courseId);
              return (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="p-3 text-sm font-medium text-card-foreground">{m.title}</td>
                  <td className="p-3 text-sm text-muted-foreground">{course?.title || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{m.order}</td>
                  <td className="p-3 text-sm text-muted-foreground">{m.lessons.length}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              );
            })}
            {modules.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No modules yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
