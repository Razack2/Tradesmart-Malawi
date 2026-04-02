import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Loading } from "../App";   // ← Import the same Loading component you have in App.tsx

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute → isLoading:", isLoading, "| hasUser:", !!user); // ← Debug (remove later)

  // 1. Always show loading while auth is initializing
  if (isLoading) {
    return <Loading />;
  }

  // 2. If no user → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. User is logged in → render children
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  console.log("AdminRoute → isLoading:", isLoading, "| isAdmin:", isAdmin); // ← Debug

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function PaidContentGuard({ children, levelIsPaid }: {
  children: ReactNode;
  levelIsPaid: boolean
}) {
  const { isPaid, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (levelIsPaid && !isPaid) {
    return <Navigate to="/upgrade" replace />;
  }

  return <>{children}</>;
}