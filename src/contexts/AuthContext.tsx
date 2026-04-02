import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { UserRole, SubscriptionType } from "@/types";
import { supabase } from "@/lib/supabaseClient";

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  subscription: SubscriptionType;
}

interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  upgradeSubscription: () => Promise<boolean>;
  isAdmin: boolean;
  isPaid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<ExtendedUser | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('name, role, subscription')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        if (error.code === '42P01') {
          return {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.email?.split('@')[0] || "User",
            role: "student" as UserRole,
            subscription: "free" as SubscriptionType,
          };
        }
        return null;
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: data.name || supabaseUser.email?.split('@')[0] || "User",
        role: data.role || "student",
        subscription: data.subscription || "free",
      };
    } catch (err) {
      console.error('fetchUserProfile catch:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const profile = await fetchUserProfile(session.user);
          if (profile) setUser(profile);
        } else if (mounted) {
          setUser(null);
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listener - NO async callback (this fixes the deadlock)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event, "User present:", !!session?.user);

        if (!mounted) return;

        if (session?.user) {
          // Fetch profile without making the callback async
          fetchUserProfile(session.user).then((profile) => {
            if (profile && mounted) {
              setUser(profile);
            }
          });
        } else if (mounted) {
          setUser(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: "Login failed" };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { success: false, error: error.message };

      if (data.user) {
        await supabase
          .from('user_profiles')
          .insert({ id: data.user.id, email: data.user.email, name, role: 'student', subscription: 'free' })
          .catch(console.error);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const upgradeSubscription = async (): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from('user_profiles')
      .update({ subscription: 'paid' })
      .eq('id', user.id);

    if (error) {
      console.error(error);
      return false;
    }
    setUser(prev => prev ? { ...prev, subscription: 'paid' } : null);
    return true;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    upgradeSubscription,
    isAdmin: user?.role === 'admin',
    isPaid: user?.subscription === 'paid',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}