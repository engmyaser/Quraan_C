import { useState } from "react";
import { BookOpen, Save, Trash2, Plus, ChevronDown, ChevronLeft, FileText, X } from "lucide-react";
import type { TafsirQuestion } from "../lib/types";
import { BRANCH_NAMES, BRANCH_TEMPLATES } from "../lib/questions";

interface Props {
  questions: TafsirQuestion[];
  loading: boolean;
  onUpsert: (q: Omit<TafsirQuestion, "id" | "created_at">) => Promise<TafsirQuestion>;
  onRemove: (id: string) => Promise<void>;
}

const emptyQ = (branch: number, templateNum: number, questionNum: number) => ({
  branch, template_num: templateNum, question_num: questionNum,
  question_text: "", reference: "", answer_notes: "",
});

export default function TafsirQuestions({ questions, loading, onUpsert, onRemove }: Props) {
  const [branch, setBranch] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [editing, setEditing] = useState<{ branch: number; template_num: number; question_num: number } | null>(null);
  const [form, setForm] = useState(emptyQ(1, 1, 1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openAdd = (templateNum: number, questionNum: number) => {
    setEditing({ branch, template_num: templateNum, question_num: questionNum });
    const existing = questions.find((q) => q.branch === branch && q.template_num === templateNum && q.question_num === questionNum);
    setForm(existing ? {
      branch, template_num: templateNum, question_num: questionNum,
      question_text: existing.question_text, reference: existing.reference || "", answer_notes: existing.answer_notes || "",
    } : emptyQ(branch, templateNum, questionNum));
  };

  const openEdit = (q: TafsirQuestion) => {
    setEditing({ branch: q.branch, template_num: q.template_num, question_num: q.question_num });
    setForm({ branch: q.branch, template_num: q.template_num, question_num: q.question_num, question_text: q.question_text, reference: q.reference || "", answer_notes: q.answer_notes || "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question_text.trim()) { setError("نص السؤال مطلوب"); return; }
    setSaving(true); setError("");
    try {
      await onUpsert(form);
      setEditing(null);
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    try { await onRemove(id); } catch { /* ignore */ }
  };

  const getQ = (tNum: number, qNum: number) => questions.find((q) => q.branch === branch && q.template_num === tNum && q.question_num === qNum);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">أسئلة التفسير</h1>
        <p className="text-gray-500 text-sm">إدارة 5 أسئلة تفسير لكل قالب في كل فرع</p>
      </div>

      {/* Branch selector */}
      <div className="flex gap-2">
        {[1, 2, 3].map((b) => (
          <button key={b} onClick={() => { setBranch(b); setExpanded(1); }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${branch === b ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300"}`}>
            {BRANCH_NAMES[b]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}</div>
      ) : (
        <div className="space-y-3">
          {BRANCH_TEMPLATES[branch].map((tNum) => {
            const isExpanded = expanded === tNum;
            const filled = [1, 2, 3, 4, 5].filter((qn) => getQ(tNum, qn)).length;
            return (
              <div key={tNum} className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
                <button onClick={() => setExpanded(isExpanded ? null : tNum)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-gray-800">قالب {tNum}</h3>
                      <p className="text-xs text-gray-500">{filled} / 5 أسئلة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((qn) => (
                        <div key={qn} className={`w-2.5 h-2.5 rounded-full ${getQ(tNum, qn) ? "bg-emerald-500" : "bg-gray-200"}`} />
                      ))}
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronLeft className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-2 animate-fade-in">
                    {[1, 2, 3, 4, 5].map((qn) => {
                      const q = getQ(tNum, qn);
                      return (
                        <div key={qn} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-colors group">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${q ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-400"}`}>
                            {qn}
                          </div>
                          <div className="flex-1 min-w-0">
                            {q ? (
                              <>
                                <p className="text-sm text-gray-800 font-medium">{q.question_text}</p>
                                {q.reference && <p className="text-xs text-gray-500 mt-0.5">المرجع: {q.reference}</p>}
                                {q.answer_notes && <p className="text-xs text-gray-400 mt-0.5">ملاحظات: {q.answer_notes}</p>}
                              </>
                            ) : (
                              <p className="text-sm text-gray-400">لم يتم إضافة سؤال بعد</p>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => q ? openEdit(q) : openAdd(tNum, qn)}
                              className="w-8 h-8 rounded-lg hover:bg-emerald-100 flex items-center justify-center">
                              {q ? <BookOpen className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                            </button>
                            {q && (
                              <button onClick={() => handleDelete(q.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Add modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">
                {getQ(editing.template_num, editing.question_num) ? "تعديل سؤال تفسير" : "إضافة سؤال تفسير"}
              </h2>
              <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">{BRANCH_NAMES[branch]}</span>
                <ChevronLeft className="w-4 h-4" />
                <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold">قالب {editing.template_num}</span>
                <ChevronLeft className="w-4 h-4" />
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold">سؤال {editing.question_num}</span>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">نص السؤال *</label>
                <textarea required value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">المرجع (السورة / الآية)</label>
                <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="مثال: البقرة : 255"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات الإجابة المتوقعة</label>
                <textarea value={form.answer_notes} onChange={(e) => setForm({ ...form, answer_notes: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all resize-none" />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button type="button" onClick={() => setEditing(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
