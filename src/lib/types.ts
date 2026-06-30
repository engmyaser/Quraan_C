export interface User {
  id: string;
  special_id: string;
  name: string;
  role: "admin" | "judge" | "contestant" | "manager";
  phone?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Contestant {
  id: string;
  name: string;
  national_id: string | null;
  phone: string | null;
  nationality: string | null;
  branch: number;
  institution: string | null;
  notes: string | null;
  created_at: string;
}

export interface Judge {
  id: string;
  name: string;
  qualification: string | null;
  specialty: string | null;
  phone: string | null;
  pin: string | null;
  notes: string | null;
  created_at: string;
}

export interface SessionRow {
  id: string;
  contestant_id: string;
  branch: number;
  template_key: string;
  template_num: number;
  judges_count: number;
  grand_sum: number;
  score_100: number;
  max_per_q: number;
  q_count: number;
  judge_details: { name: string; total: number }[] | null;
  completed: boolean;
  completed_at: string;
}

export interface BranchScore {
  id: string;
  branch: number;
  score_h: number;
  score_t: number;
  score_l: number;
  score_f: number;
}

export interface Question {
  q: number;
  surah: string;
  verse: number;
  page: number;
  text: string;
}

export interface TafsirQuestion {
  id: string;
  branch: number;
  template_num: number;
  question_num: number;
  question_text: string;
  reference: string | null;
  answer_notes: string | null;
  created_at: string;
}

export interface QuranQuestion {
  id: string;
  branch: number;
  template_num: number;
  question_num: number;
  surah: string;
  verse: number;
  page: number;
  question_text: string | null;
  created_at: string;
}
