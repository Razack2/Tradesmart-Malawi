import {
  LayoutDashboard,
  BookOpen,
  Crown,
  LogOut,
  Shield,
  Zap,
  Lock,
} from "lucide-react";

import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: Shield },
];

export function AppSidebar() {
  const { user, isAdmin, logout } = useAuth();
  const { levels } = useCourses();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // =========================
  // SUBSCRIPTION STATE
  // =========================
  const { isPaid } = useAuth();
  const hasSubscription = isAdmin || isPaid === true;

  const isBeginner = (name: string) =>
    name.toLowerCase() === "beginner";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          {!collapsed && (
            <div className="px-3 pb-4 mb-2 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    TradeSmart
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">
                    Malawi
                  </p>
                </div>
              </div>
            </div>
          )}

          <SidebarGroupLabel>Learning</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/dashboard"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* LEVELS (ONLY BEGINNER + PREMIUM) */}
              {levels.map((level) => {
                const locked =
                  !isBeginner(level.name) && !hasSubscription;

                return (
                  <SidebarMenuItem key={level.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={locked ? "/upgrade" : `/level/${level.id}`}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        {locked ? (
                          <Lock className="mr-2 h-4 w-4 text-red-500" />
                        ) : isBeginner(level.name) ? (
                          <BookOpen className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <Crown className="mr-2 h-4 w-4 text-blue-500" />
                        )}

                        {!collapsed && (
                          <span
                            className={
                              locked
                                ? "text-red-500"
                                : isBeginner(level.name)
                                ? "text-green-500"
                                : "text-blue-500"
                            }
                          >
                            {level.name}
                          </span>
                        )}

                        {/* Badge */}
                        {!collapsed && (
                          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {isBeginner(level.name)
                              ? "FREE"
                              : "PREMIUM"}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Upgrade */}
              {!hasSubscription && !isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/upgrade" className="hover:bg-yellow-500/10">
                      <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                      {!collapsed && (
                        <span className="text-yellow-600 font-medium">
                          Upgrade Premium
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ADMIN */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="mb-2 px-1">
            <p className="text-sm font-medium truncate">
              {user.name}
            </p>

            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user.email}
            </p>

            <span
              className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                hasSubscription
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {hasSubscription ? "Premium Active" : "Free Plan"}
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}