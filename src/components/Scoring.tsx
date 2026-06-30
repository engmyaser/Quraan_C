import { useState } from "react";
import { ClipboardList, BookOpen, ChevronLeft, Check, Save, Users, FileText, Calculator, BookText } from "lucide-react";
import type { Contestant, Judge, BranchScore, SessionRow, TafsirQuestion } from "../lib/types";
import { supabase } from "../lib/supabase";
import { QUESTIONS, BRANCH_NAMES, BRANCH_TEMPLATES } from "../lib/questions";
import QuranModal from "./QuranModal";

interface Props {
  contestants: Contestant[];
  judges: Judge[];
  branchScores: BranchScore[];
  tafsirQuestions: TafsirQuestion[];
  onSave: (s: Omit<SessionRow, "id" | "completed_at">) => Promise<SessionRow>;
}

interface ScoreCell { h: number; t: number; l: number; f: number; total: number }

export default function Scoring({ contestants, judges, branchScores, tafsirQuestions, onSave }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [contestantId, setContestantId] = useState("");
  const [branch, setBranch] = useState(1);
  const [templateNum, setTemplateNum] = useState(1);
  const [selectedJudges, setSelectedJudges] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreCell[]>>({});
  const [quranPage, setQuranPage] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const templateKey = `${branch}_${templateNum}`;
  const questions = QUESTIONS[templateKey] || [];
  const tafsirQs = tafsirQuestions.filter((q) => q.branch === branch && q.template_num === templateNum).sort((a, b) => a.question_num - b.question_num);
  const totalQCount = questions.length + tafsirQs.length;
  const bs = branchScores.find((b) => b.branch === branch) || { score_h: 60, score_t: 20, score_l: 10, score_f: 10 };
  const maxPerQ = bs.score_h + bs.score_t + bs.score_l + bs.score_f;

  const reset = () => {
    setStep(1); setContestantId(""); setBranch(1); setTemplateNum(1);
    setSelectedJudges([]); setScores({}); setError(""); setSuccess(false);
  };

  const startScoring = () => {
    if (!contestantId) { setError("اختر متسابقاً"); return; }
    if (selectedJudges.length === 0) { setError("اختر محكماً واحداً على الأقل"); return; }
    setError("");
    const init: Record<string, ScoreCell[]> = {};
    selectedJudges.forEach((jid) => {
      init[jid] = Array.from({ length: totalQCount }, () => ({ h: 0, t: 0, l: 0, f: 0, total: 0 }));
    });
    setScores(init);
    setStep(3);
  };

  const updateScore = (jid: string, qIdx: number, field: "h" | "t" | "l" | "f", value: number) => {
    setScores((prev) => {
      const next = { ...prev };
      const cell = { ...next[jid][qIdx] };
      const max = field === "h" ? bs.score_h : field === "t" ? bs.score_t : field === "l" ? bs.score_l : bs.score_f;
      cell[field] = Math.min(max, Math.max(0, value));
      cell.total = cell.h + cell.t + cell.l + cell.f;
      next[jid] = [...next[jid]];
      next[jid][qIdx] = cell;
      return next;
    });
  };

  const computeResults = () => {
    const qAvgs: number[] = [];
    for (let qi = 0; qi < totalQCount; qi++) {
      const sum = selectedJudges.reduce((acc, jid) => acc + (scores[jid]?.[qi]?.total || 0), 0);
      qAvgs.push(sum / selectedJudges.length);
    }
    const grandSum = qAvgs.reduce((a, b) => a + b, 0);
    const score100 = totalQCount > 0 ? (grandSum / (maxPerQ * totalQCount)) * 100 : 0;
    const judgeDetails = selectedJudges.map((jid) => {
      const j = judges.find((x) => x.id === jid);
      const total = (scores[jid] || []).reduce((acc, c) => acc + c.total, 0);
      return { name: j?.name || "", total };
    });
    return { grandSum, score100, judgeDetails };
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const { grandSum, score100, judgeDetails } = computeResults();
      const contestant = contestants.find((c) => c.id === contestantId);
      if (!contestant) throw new Error("المتسابق غير موجود");
      const session = await onSave({
        contestant_id: contestantId,
        branch,
        template_key: templateKey,
        template_num: templateNum,
        judges_count: selectedJudges.length,
        grand_sum: Math.round(grandSum * 100) / 100,
        score_100: Math.round(score100 * 100) / 100,
        max_per_q: maxPerQ,
        q_count: totalQCount,
        judge_details: judgeDetails,
        completed: true,
      });
      // Save detailed scores
      const rows = selectedJudges.flatMap((jid) =>
        (scores[jid] || []).map((cell, qi) => ({
          session_id: session.id,
          judge_id: jid,
          q_index: qi,
          score_h: cell.h, score_t: cell.t, score_l: cell.l, score_f: cell.f,
          total: cell.total,
        }))
      );
      if (rows.length) await supabase.from("session_scores").insert(rows);
      setSuccess(true);
      setTimeout(reset, 2000);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  const toggleJudge = (id: string) => {
    setSelectedJudges((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const branchContestants = contestants.filter((c) => c.branch === branch);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">جلسة تقييم</h1>
        <p className="text-gray-500 text-sm">تقييم متسابق بواسطة لجنة المحكمين</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "المتسابق والقالب", icon: Users },
          { n: 2, label: "المحكمون", icon: FileText },
          { n: 3, label: "التقييم", icon: Calculator },
        ].map((s, i) => {
          const Icon = s.icon;
          const active = step >= s.n;
          return (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                <Icon className="w-4 h-4" />
                {s.label}
              </div>
              {i < 2 && <ChevronLeft className={`w-4 h-4 ${step > s.n ? "text-emerald-600" : "text-gray-300"}`} />}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <Check className="w-5 h-5" /> تم حفظ نتائج التقييم بنجاح
        </div>
      )}

      {/* Step 1: Contestant + Template */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 card-shadow border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الفرع</label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((b) => (
                <button key={b} onClick={() => { setBranch(b); setTemplateNum(1); setContestantId(""); }}
                  className={`py-3 rounded-xl font-semibold transition-all ${branch === b ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {BRANCH_NAMES[b]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">المتسابق</label>
            <select value={contestantId} onChange={(e) => setContestantId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all bg-white">
              <option value="">-- اختر متسابقاً --</option>
              {branchContestants.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {branchContestants.length === 0 && <p className="text-xs text-gray-400 mt-1">لا يوجد متسابقون في هذا الفرع</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">القالب</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {BRANCH_TEMPLATES[branch].map((t) => (
                <button key={t} onClick={() => setTemplateNum(t)}
                  className={`py-2.5 rounded-xl font-semibold text-sm transition-all ${templateNum === t ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  قالب {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => { setStep(2); setError(""); }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
              التالي <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Judges */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 card-shadow border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اختر المحكمين ({selectedJudges.length} مختار)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {judges.map((j) => {
                const sel = selectedJudges.includes(j.id);
                return (
                  <button key={j.id} onClick={() => toggleJudge(j.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right ${sel ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${sel ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {sel ? <Check className="w-5 h-5" /> : j.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{j.name}</p>
                      {j.specialty && <p className="text-xs text-gray-500">{j.specialty}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
            {judges.length === 0 && <p className="text-gray-400 text-sm text-center py-4">لا يوجد محكمون مسجلون</p>}
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
              السابق
            </button>
            <button onClick={startScoring}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
              ابدأ التقييم <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Scoring */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 card-shadow border border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-bold text-gray-800">{contestants.find((c) => c.id === contestantId)?.name}</p>
                <p className="text-xs text-gray-500">{BRANCH_NAMES[branch]} • قالب {templateNum} • {totalQCount} أسئلة ({questions.length} قرآن + {tafsirQs.length} تفسير) • {selectedJudges.length} محكم</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                رجوع
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ النتائج"}
              </button>
            </div>
          </div>

          {/* Scoring table per judge */}
          {selectedJudges.map((jid) => {
            const judge = judges.find((j) => j.id === jid);
            return (
              <div key={jid} className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-l from-emerald-700 to-emerald-600 px-5 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    {judge?.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-white">{judge?.name}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600">
                        <th className="px-3 py-2.5 text-right font-semibold w-12">السؤال</th>
                        <th className="px-3 py-2.5 font-semibold">النص / المرجع</th>
                        <th className="px-3 py-2.5 font-semibold w-20">الحفظ<br /><span className="text-xs text-gray-400">/{bs.score_h}</span></th>
                        <th className="px-3 py-2.5 font-semibold w-20">التجويد<br /><span className="text-xs text-gray-400">/{bs.score_t}</span></th>
                        <th className="px-3 py-2.5 font-semibold w-20">التلاوة<br /><span className="text-xs text-gray-400">/{bs.score_l}</span></th>
                        <th className="px-3 py-2.5 font-semibold w-20">التفسير<br /><span className="text-xs text-gray-400">/{bs.score_f}</span></th>
                        <th className="px-3 py-2.5 font-semibold w-20">المجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Quran questions section header */}
                      {questions.length > 0 && (
                        <tr className="bg-emerald-50/60">
                          <td colSpan={7} className="px-3 py-2">
                            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                              <BookOpen className="w-4 h-4" />
                              أسئلة القرآن الكريم ({questions.length})
                            </div>
                          </td>
                        </tr>
                      )}
                      {questions.map((q, qi) => {
                        const cell = scores[jid]?.[qi] || { h: 0, t: 0, l: 0, f: 0, total: 0 };
                        return (
                          <tr key={`q-${qi}`} className="border-t border-gray-100 hover:bg-gray-50/50">
                            <td className="px-3 py-2 font-semibold text-gray-700">{q.q}</td>
                            <td className="px-3 py-2">
                              <button onClick={() => setQuranPage(q.page)} className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700">
                                <BookOpen className="w-4 h-4" />
                                <span className="font-quran">{q.surah} : {q.verse}</span>
                                <span className="text-xs text-gray-400">ص{q.page}</span>
                              </button>
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={cell.h || ""} max={bs.score_h} min={0}
                                onChange={(e) => updateScore(jid, qi, "h", Number(e.target.value))}
                                className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-center" />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={cell.t || ""} max={bs.score_t} min={0}
                                onChange={(e) => updateScore(jid, qi, "t", Number(e.target.value))}
                                className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-center" />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={cell.l || ""} max={bs.score_l} min={0}
                                onChange={(e) => updateScore(jid, qi, "l", Number(e.target.value))}
                                className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-center" />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={cell.f || ""} max={bs.score_f} min={0}
                                onChange={(e) => updateScore(jid, qi, "f", Number(e.target.value))}
                                className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-center" />
                            </td>
                            <td className="px-3 py-2 font-bold text-emerald-700">{cell.total}</td>
                          </tr>
                        );
                      })}
                      {/* Tafsir questions section header */}
                      {tafsirQs.length > 0 && (
                        <tr className="bg-amber-50/60">
                          <td colSpan={7} className="px-3 py-2">
                            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                              <BookText className="w-4 h-4" />
                              أسئلة التفسير ({tafsirQs.length})
                            </div>
                          </td>
                        </tr>
                      )}
                      {tafsirQs.map((tq, ti) => {
                        const qi = questions.length + ti;
                        const cell = scores[jid]?.[qi] || { h: 0, t: 0, l: 0, f: 0, total: 0 };
                        return (
                          <tr key={`t-${ti}`} className="border-t border-gray-100 hover:bg-amber-50/30">
                            <td className="px-3 py-2 font-semibold text-amber-700">{tq.question_num}</td>
                            <td className="px-3 py-2">
                              <div className="max-w-md">
                                <p className="text-sm text-gray-800 font-medium leading-snug">{tq.question_text}</p>
                                {tq.reference && <p className="text-xs text-gray-400 mt-0.5">المرجع: {tq.reference}</p>}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={cell.h || ""} max={bs.score_h} min={0}
                                onChange={(e) => updateScore(jid, qi, "h", Number(e.target.value))}
                                className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-amber-500 outline-none text-center" />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={cell.t || ""} max={bs.score_t} min={0}
                                onChange={(e) => updateScore(jid, qi, "t", Number(e.target.value))}
                                className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-amber-500 outline-none text-center" />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={cell.l || ""} max={bs.score_l} min={0}
                                onChange={(e) => updateScore(jid, qi, "l", Number(e.target.value))}
                                className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-amber-500 outline-none text-center" />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={cell.f || ""} max={bs.score_f} min={0}
                                onChange={(e) => updateScore(jid, qi, "f", Number(e.target.value))}
                                className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 focus:border-amber-500 outline-none text-center" />
                            </td>
                            <td className="px-3 py-2 font-bold text-amber-700">{cell.total}</td>
                          </tr>
                        );
                      })}
                      <tr className="border-t-2 border-gray-200 bg-gray-50">
                        <td colSpan={6} className="px-3 py-2.5 text-left font-bold text-gray-700">المجموع الكلي:</td>
                        <td className="px-3 py-2.5 font-bold text-lg text-emerald-700">
                          {(scores[jid] || []).reduce((a, c) => a + c.total, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Live result preview */}
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-6 text-white card-shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm opacity-80 mb-1">النتيجة المبدئية</p>
                <p className="text-4xl font-bold">{computeResults().score100.toFixed(1)}<span className="text-lg opacity-70">/100</span></p>
              </div>
              <div className="text-left">
                <p className="text-sm opacity-80 mb-1">المجموع الكلي</p>
                <p className="text-2xl font-bold">{computeResults().grandSum.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {quranPage !== null && <QuranModal page={quranPage} onClose={() => setQuranPage(null)} />}
    </div>
  );
}
