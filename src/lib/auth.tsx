import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "./supabase";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (specialId: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "qc_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const login = async (specialId: string) => {
    const code = specialId.trim();
    if (!code) return { ok: false, error: "أدخل المعرف الخاص" };

    const { data, error } = await supabase
      .from("users")
      .select("id, special_id, name, role, created_at")
      .eq("special_id", code)
      .maybeSingle();

    if (error) return { ok: false, error: "خطأ في الاتصال بقاعدة البيانات" };
    if (!data) return { ok: false, error: "المعرف الخاص غير صحيح" };

    setUser(data);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
