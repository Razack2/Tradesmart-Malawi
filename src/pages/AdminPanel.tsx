import { Link, Outlet, useLocation } from "react-router-dom";
import { BookOpen, Layers, FileText, HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const adminTabs = [
  { title: "Courses", path: "/admin", icon: BookOpen },
  { title: "Modules", path: "/admin/modules", icon: Layers },
  { title: "Lessons", path: "/admin/lessons", icon: FileText },
  { title: "Quizzes", path: "/admin/quizzes", icon: HelpCircle },
];

export default function AdminPanel() {
  const location = useLocation();

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage all learning content</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link>
        </Button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border pb-3 overflow-x-auto">
        {adminTabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <Link key={tab.path} to={tab.path}>
              <Button
                variant={active ? "default" : "ghost"}
                size="sm"
                className={active ? "gradient-primary border-0 text-primary-foreground" : ""}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.title}
              </Button>
            </Link>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
