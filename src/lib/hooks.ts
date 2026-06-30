import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import type { Contestant, Judge, SessionRow, BranchScore, TafsirQuestion, QuranQuestion, User } from "./types";

export function useContestants() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contestants")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setContestants(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (c: Omit<Contestant, "id" | "created_at">) => {
    const { data, error } = await supabase.from("contestants").insert(c).select().single();
    if (error) throw error;
    if (data) setContestants((p) => [data, ...p]);
    return data;
  };

  const update = async (id: string, patch: Partial<Contestant>) => {
    const { error } = await supabase.from("contestants").update(patch).eq("id", id);
    if (error) throw error;
    setContestants((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("contestants").delete().eq("id", id);
    if (error) throw error;
    setContestants((p) => p.filter((c) => c.id !== id));
  };

  return { contestants, loading, add, update, remove, reload: load };
}

export function useJudges() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("judges")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setJudges(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (j: Omit<Judge, "id" | "created_at">) => {
    const { data, error } = await supabase.from("judges").insert(j).select().single();
    if (error) throw error;
    if (data) setJudges((p) => [data, ...p]);
    return data;
  };

  const update = async (id: string, patch: Partial<Judge>) => {
    const { error } = await supabase.from("judges").update(patch).eq("id", id);
    if (error) throw error;
    setJudges((p) => p.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("judges").delete().eq("id", id);
    if (error) throw error;
    setJudges((p) => p.filter((j) => j.id !== id));
  };

  return { judges, loading, add, update, remove, reload: load };
}

export function useSessions() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("completed_at", { ascending: false });
    if (!error && data) setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (s: Omit<SessionRow, "id" | "completed_at">) => {
    const { data, error } = await supabase.from("sessions").insert(s).select().single();
    if (error) throw error;
    if (data) setSessions((p) => [data, ...p]);
    return data;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) throw error;
    setSessions((p) => p.filter((s) => s.id !== id));
  };

  return { sessions, loading, add, remove, reload: load };
}

export function useBranchScores() {
  const [scores, setScores] = useState<BranchScore[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("branch_scores")
      .select("*")
      .order("branch", { ascending: true });
    if (!error && data) setScores(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (id: string, patch: Partial<BranchScore>) => {
    const { error } = await supabase.from("branch_scores").update(patch).eq("id", id);
    if (error) throw error;
    setScores((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  return { scores, loading, update, reload: load };
}

export function useTafsirQuestions() {
  const [questions, setQuestions] = useState<TafsirQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tafsir_questions")
      .select("*")
      .order("branch", { ascending: true })
      .order("template_num", { ascending: true })
      .order("question_num", { ascending: true });
    if (!error && data) setQuestions(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const upsert = async (q: Omit<TafsirQuestion, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("tafsir_questions")
      .upsert(q, { onConflict: "branch,template_num,question_num" })
      .select().single();
    if (error) throw error;
    setQuestions((prev) => {
      const idx = prev.findIndex((x) => x.branch === q.branch && x.template_num === q.template_num && x.question_num === q.question_num);
      if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
      return [...prev, data].sort((a, b) => a.branch - b.branch || a.template_num - b.template_num || a.question_num - b.question_num);
    });
    return data;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("tafsir_questions").delete().eq("id", id);
    if (error) throw error;
    setQuestions((p) => p.filter((q) => q.id !== id));
  };

  return { questions, loading, upsert, remove, reload: load };
}

export function useQuranQuestions() {
  const [questions, setQuestions] = useState<QuranQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quran_questions")
      .select("*")
      .order("branch", { ascending: true })
      .order("template_num", { ascending: true })
      .order("question_num", { ascending: true });
    if (!error && data) setQuestions(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const upsert = async (q: Omit<QuranQuestion, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("quran_questions")
      .upsert(q, { onConflict: "branch,template_num,question_num" })
      .select().single();
    if (error) throw error;
    setQuestions((prev) => {
      const idx = prev.findIndex((x) => x.branch === q.branch && x.template_num === q.template_num && x.question_num === q.question_num);
      if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
      return [...prev, data].sort((a, b) => a.branch - b.branch || a.template_num - b.template_num || a.question_num - b.question_num);
    });
    return data;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("quran_questions").delete().eq("id", id);
    if (error) throw error;
    setQuestions((p) => p.filter((q) => q.id !== id));
  };

  return { questions, loading, upsert, remove, reload: load };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, special_id, name, role, phone, notes, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setUsers(data as User[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (u: { special_id: string; name: string; role: User["role"]; phone?: string; notes?: string }) => {
    const { data, error } = await supabase
      .from("users")
      .insert({ special_id: u.special_id, name: u.name, role: u.role, phone: u.phone || null, notes: u.notes || null })
      .select("id, special_id, name, role, phone, notes, created_at")
      .single();
    if (error) throw error;
    setUsers((p) => [data as User, ...p]);
    return data as User;
  };

  const update = async (id: string, u: Partial<Pick<User, "name" | "role" | "phone" | "notes" | "special_id">>) => {
    const { data, error } = await supabase
      .from("users")
      .update(u)
      .eq("id", id)
      .select("id, special_id, name, role, phone, notes, created_at")
      .single();
    if (error) throw error;
    setUsers((p) => p.map((x) => (x.id === id ? (data as User) : x)));
    return data as User;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    setUsers((p) => p.filter((x) => x.id !== id));
  };

  return { users, loading, add, update, remove, reload: load };
}
