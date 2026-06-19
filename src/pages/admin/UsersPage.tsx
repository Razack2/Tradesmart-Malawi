import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

const LEVELS = [
  { id: "intermediate", label: "Intermediate" },
  { id: "expert", label: "Expert" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First try an RPC that returns auth.users LEFT JOIN user_profiles
      // (create this function in the DB if you want a single endpoint that returns
      // all users and profiles). If it doesn't exist or fails, fall back to
      // selecting from `user_profiles` directly.
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc(
          "admin_get_all_users"
        );

        if (!rpcErr && Array.isArray(rpcData) && rpcData.length > 0) {
          setUsers(rpcData as any[]);
          setLoading(false);
          return;
        }

        if (rpcErr) {
          console.debug("RPC admin_get_all_users not available or failed:", rpcErr.message || rpcErr);
        }

        // Try a JSON-returning RPC fallback which is less strict about column signatures.
        try {
          const { data: rpcJsonData, error: rpcJsonErr } = await supabase.rpc(
            "admin_get_all_users_json"
          );

          if (!rpcJsonErr && Array.isArray(rpcJsonData) && rpcJsonData.length > 0) {
            setUsers(rpcJsonData as any[]);
            setLoading(false);
            return;
          }

          if (rpcJsonErr) {
            console.debug("RPC admin_get_all_users_json not available or failed:", rpcJsonErr.message || rpcJsonErr);
          }
        } catch (e) {
          console.debug("RPC admin_get_all_users_json call threw:", e);
        }
      } catch (e) {
        console.debug("RPC admin_get_all_users call threw:", e);
      }

      // Try to order by `created_at` if the column exists; if it fails, retry without order.
      let resp = await supabase
        .from("user_profiles")
        .select("id, name, email, subscription, unlocked_levels")
        .order("created_at", { ascending: false });

      if (resp.error) {
        console.warn("Ordering by created_at failed, retrying without order:", resp.error.message || resp.error);
        resp = await supabase
          .from("user_profiles")
          .select("id, name, email, subscription, unlocked_levels");
      }

      setUsers(resp.data || []);
    } catch (err) {
      console.error("Failed to fetch user_profiles:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const unlockLevel = async (userId: string, level: string) => {
    // normalize level name
    const levelName = level.toLowerCase();

    // get current profile (optional: could rely on UI state)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("unlocked_levels")
      .eq("id", userId)
      .single();

    const current = (profile?.unlocked_levels as string[]) || [];
    const updated = Array.from(new Set([...current, levelName]));

    const { error } = await supabase
      .from("user_profiles")
      .update({
        unlocked_levels: updated,
        subscription: "paid",
        has_active_subscription: true,
      })
      .eq("id", userId);

    if (error) {
      console.error("Failed to unlock level:", error);
      return;
    }

    // Try to mark subscription active in subscriptions table if exists
    try {
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingSub) {
        await supabase
          .from("subscriptions")
          .update({ status: "active", package: "premium", starts_at: new Date().toISOString() })
          .eq("user_id", userId);
      } else {
        await supabase.from("subscriptions").insert({
          user_id: userId,
          status: "active",
          package: "premium",
          starts_at: new Date().toISOString(),
          expires_at: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      // ignore subscription table errors
      console.debug("subscriptions table update/insert failed:", err);
    }

    fetchUsers();
  };

  const unsubscribeUser = async (userId: string) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        subscription: "free",
        has_active_subscription: false,
        unlocked_levels: [],
      })
      .eq("id", userId);

    if (error) {
      console.error("Failed to unsubscribe user:", error);
      return;
    }

    // also try to update subscriptions table
    try {
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingSub) {
        await supabase
          .from("subscriptions")
          .update({ status: "inactive", package: null, expires_at: new Date().toISOString() })
          .eq("user_id", userId);
      } else {
        await supabase.from("subscriptions").insert({
          user_id: userId,
          status: "inactive",
          package: null,
          created_at: new Date().toISOString(),
          expires_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.debug("subscriptions table update/insert failed:", err);
    }

    fetchUsers();
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">User Subscriptions</h2>

      {loading && <p>Loading...</p>}

      {users.map((u) => (
        <div
          key={u.id}
          className="border p-4 rounded-lg flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{u.name || u.email}</p>
            <p className="text-sm text-muted-foreground">
              Status: {u.subscription || "free"}
            </p>

            {u.unlocked_levels && u.unlocked_levels.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Unlocked: {u.unlocked_levels.join(", ")}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {LEVELS.map((lvl) => (
              <Button
                key={lvl.id}
                size="sm"
                variant="outline"
                onClick={() => unlockLevel(u.id, lvl.label)}
              >
                Unlock {lvl.label}
              </Button>
            ))}

            <Button
              size="sm"
              variant="destructive"
              onClick={() => unsubscribeUser(u.id)}
            >
              Unsubscribe
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}