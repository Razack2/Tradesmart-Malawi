import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  UserRole,
  SubscriptionType,
} from "@/types";
import { supabase } from "@/lib/supabaseClient";

interface ExtendedUser {
  has_active_subscription: boolean;
  id: string;
  email: string;
  name: string;
  role: UserRole;
  subscription: SubscriptionType;
  unlocked_levels: string[];
}


interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    role?: UserRole;
  }>;

  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  logout: () => Promise<void>;

  // unlock selected package
  upgradeSubscription: (
    levelId: string,
    paymentRef?: string
  ) => Promise<boolean>;

  hasUnlockedLevel: (
    levelId: string
  ) => boolean;

  isAdmin: boolean;
  isPaid: boolean;
  canAccessPremium: boolean;
}

const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<ExtendedUser | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(true);

  // Fetch Profile
  const fetchUserProfile = async (
    supabaseUser: SupabaseUser
  ): Promise<ExtendedUser | null> => {
    try {
      const { data, error } =
        await supabase
          .from("user_profiles")
          .select(
            `
            name,
            role,
            subscription,
            unlocked_levels
          `
          )
          .eq("id", supabaseUser.id)
          .single();

      if (error) {
        console.error(
          "Profile fetch error:",
          error
        );

        // table missing
        if (
          error.code === "42P01"
        ) {
          return {
            id: supabaseUser.id,
            email:
              supabaseUser.email!,
            name:
              supabaseUser.email?.split(
                "@"
              )[0] || "User",
            role:
              "student" as UserRole,
            subscription:
              "free" as SubscriptionType,
            unlocked_levels: [],
            has_active_subscription: false,
          };
        }

        // no row
        if (
          error.code ===
          "PGRST116"
        ) {
          return {
            id: supabaseUser.id,
            email:
              supabaseUser.email!,
            name:
              supabaseUser.email?.split(
                "@"
              )[0] || "User",
            role:
              "student" as UserRole,
            subscription:
              "free" as SubscriptionType,
            unlocked_levels: [],
            has_active_subscription: false,
          };
        }

        return null;
      }

      return {
        id: supabaseUser.id,
        email:
          supabaseUser.email!,
        name:
          data.name ||
          supabaseUser.email?.split(
            "@"
          )[0] ||
          "User",
        role:
          data.role || "student",
        subscription:
          data.subscription ||
          "free",
        unlocked_levels:
          data.unlocked_levels ||
          [],
        has_active_subscription:
          // prefer explicit field from DB if present, otherwise default to false
          (data as any)?.has_active_subscription || false,
      };
    } catch (err) {
      console.error(
        "fetchUserProfile catch:",
        err
      );
      return null;
    }
  };

  // Auth Init
  useEffect(() => {
    let mounted = true;

    const initializeAuth =
      async () => {
        try {
          const {
            data: { session },
          } =
            await supabase.auth.getSession();

          if (
            session?.user &&
            mounted
          ) {
            const profile =
              await fetchUserProfile(
                session.user
              );

            if (profile)
              setUser(profile);
          } else if (
            mounted
          ) {
            setUser(null);
          }
        } catch (err) {
          console.error(
            "Init error:",
            err
          );
        } finally {
          if (mounted)
            setIsLoading(false);
        }
      };

    initializeAuth();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          session
        ) => {
          console.log(
            "Auth event:",
            event
          );

          if (!mounted)
            return;

          if (
            session?.user
          ) {
            fetchUserProfile(
              session.user
            ).then(
              (
                profile
              ) => {
                if (
                  profile &&
                  mounted
                ) {
                  setUser(
                    profile
                  );
                }
              }
            );
          } else {
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

  // Login
  const login = async (
    email: string,
    password: string
  ) => {
    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          }
        );

      if (error) {
        return {
          success: false,
          error:
            error.message,
        };
      }

      if (
        data?.user
      ) {
        const profile =
          await fetchUserProfile(
            data.user
          );

        if (profile)
          setUser(
            profile
          );

        return {
          success: true,
          role:
            profile?.role ||
            "student",
        };
      }

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        error:
          "Login failed",
      };
    }
  };

  // Register
  const register = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signUp(
          {
            email,
            password,
          }
        );

      if (error) {
        return {
          success: false,
          error:
            error.message,
        };
      }

      if (
        data.user
      ) {
        const {
          error:
            profileError,
        } =
          await supabase
            .from(
              "user_profiles"
            )
            .insert({
              id:
                data.user.id,
              email:
                data.user
                  .email,
              name,
              role:
                "student",
              subscription:
                "free",
              unlocked_levels:
                [],
            });

        if (
          profileError
        ) {
          console.error(
            profileError
          );
        }
      }

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        error:
          "Registration failed",
      };
    }
  };

  // Logout
  const logout =
    async () => {
      await supabase.auth.signOut();
      setUser(null);
    };

  // Unlock Package
  const upgradeSubscription = async (
    levelId: string,
    paymentRef?: string
  ) => {
    console.log("upgradeSubscription called with levelId:", levelId, "paymentRef:", paymentRef);
    if (!user) {
      console.log("No user found");
      return false;
    }

    // If a payment reference is provided, require the payment to be confirmed.
    if (paymentRef) {
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("transaction_ref", paymentRef)
        .eq("status", "confirmed")
        .single();

      if (!payment) {
        console.log("Payment not confirmed");
        return false;
      }
    }

    const updatedLevels = Array.from(
      new Set([...(user.unlocked_levels || []), levelId])
    );
    console.log("Updated levels:", updatedLevels);

    const { error } = await supabase
      .from("user_profiles")
      .update({
        unlocked_levels: updatedLevels,
        subscription: "paid",
      })
      .eq("id", user.id);

    if (error) {
      console.error("Failed to unlock package:", error);
      return false;
    }

    console.log("Database updated successfully");
    setUser((prev) => {
      console.log("Updating user state, prev:", prev);
      return prev
        ? {
            ...prev,
            unlocked_levels: updatedLevels,
            subscription: "paid",
          }
        : prev;
    });

    return true;
  };
  // Access Check
  const hasUnlockedLevel =
    (
      levelId: string
    ) => {
      if (!user)
        return false;

      // beginner always free
      if (
        levelId.toLowerCase() ===
        "beginner"
      ) {
        return true;
      }

      return (
        user.unlocked_levels?.includes(
          levelId
        ) ||
        user.role ===
          "admin"
      );
    };

  const value: AuthContextType =
    {
      user,
      isLoading,
      login,
      register,
      logout,
      upgradeSubscription,
      hasUnlockedLevel,

      isAdmin:
        user?.role ===
        "admin",

      isPaid:
        user?.subscription ===
        "paid",

      canAccessPremium:
        user?.subscription ===
          "paid" ||
        user?.role ===
          "admin",
    };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (
    context ===
    undefined
  ) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}