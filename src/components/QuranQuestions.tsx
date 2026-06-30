import { useState } from "react";
import { BookOpen, Save, Trash2, Plus, ChevronDown, ChevronLeft, X, FileText } from "lucide-react";
import type { QuranQuestion } from "../lib/types";
import { BRANCH_NAMES, BRANCH_TEMPLATES } from "../lib/questions";
import QuranModal from "./QuranModal";

interface Props {
  questions: QuranQuestion[];
  loading: boolean;
  onUpsert: (q: Omit<QuranQuestion, "id" | "created_at">) => Promise<QuranQuestion>;
  onRemove: (id: string) => Promise<void>;
}

const emptyQ = (branch: number, templateNum: number, questionNum: number) => ({
  branch, template_num: templateNum, question_num: questionNum,
  surah: "", verse: 1, page: 1, question_text: "",
});

export default function QuranQuestions({ questions, loading, onUpsert, onRemove }: Props) {
  const [branch, setBranch] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [editing, setEditing] = useState<{ branch: number; template_num: number; question_num: number } | null>(null);
  const [form, setForm] = useState(emptyQ(1, 1, 1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [quranPage, setQuranPage] = useState<number | null>(null);

  const openAdd = (templateNum: number, questionNum: number) => {
    const existing = questions.find((q) => q.branch === branch && q.template_num === templateNum && q.question_num === questionNum);
    setEditing({ branch, template_num: templateNum, question_num: questionNum });
    setForm(existing ? {
      branch, template_num: templateNum, question_num: questionNum,
      surah: existing.surah, verse: existing.verse, page: existing.page, question_text: existing.question_text || "",
    } : emptyQ(branch, templateNum, questionNum));
  };

  const openEdit = (q: QuranQuestion) => {
    setEditing({ branch: q.branch, template_num: q.template_num, question_num: q.question_num });
    setForm({ branch: q.branch, template_num: q.template_num, question_num: q.question_num, surah: q.surah, verse: q.verse, page: q.page, question_text: q.question_text || "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.surah.trim()) { setError("اسم السورة مطلوب"); return; }
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

  const maxQForTemplate = (tNum: number) => {
    const count = questions.filter((q) => q.branch === branch && q.template_num === tNum).length;
    return Math.max(5, count + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">أسئلة القرآن الإضافية</h1>
        <p className="text-gray-500 text-sm">إدارة أسئلة التلاوة والحفظ لكل قالب في كل فرع</p>
      </div>

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
            const tQuestions = questions.filter((q) => q.branch === branch && q.template_num === tNum);
            return (
              <div key={tNum} className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
                <button onClick={() => setExpanded(isExpanded ? null : tNum)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-gray-800">قالب {tNum}</h3>
                      <p className="text-xs text-gray-500">{tQuestions.length} سؤال</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{tQuestions.length} أسئلة</span>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronLeft className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-2 animate-fade-in">
                    {tQuestions.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">لا توجد أسئلة في هذا القالب</p>
                    )}
                    {tQuestions.sort((a, b) => a.question_num - b.question_num).map((q) => (
                      <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {q.question_num}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-quran text-base text-gray-800">{q.surah} : {q.verse}</span>
                            <button onClick={() => setQuranPage(q.page)} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> صفحة {q.page}
                            </button>
                          </div>
                          {q.question_text && <p className="text-sm text-gray-500 mt-1 font-quran">{q.question_text}</p>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(q)} className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-500" />
                          </button>
                          <button onClick={() => handleDelete(q.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => openAdd(tNum, maxQForTemplate(tNum))}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors text-sm font-semibold">
                      <Plus className="w-4 h-4" /> إضافة سؤال جديد
                    </button>
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
                {getQ(editing.template_num, editing.question_num) ? "تعديل سؤال قرآني" : "إضافة سؤال قرآني"}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم السورة *</label>
                  <input required value={form.surah} onChange={(e) => setForm({ ...form, surah: e.target.value })}
                    placeholder="مثال: البقرة"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الآية</label>
                  <input type="number" value={form.verse} min={1} onChange={(e) => setForm({ ...form, verse: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الصفحة</label>
                <div className="flex gap-2">
                  <input type="number" value={form.page} min={1} max={604} onChange={(e) => setForm({ ...form, page: Number(e.target.value) })}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
                  <button type="button" onClick={() => setQuranPage(form.page)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> عرض
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">نص الآية (اختياري)</label>
                <textarea value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all resize-none font-quran" />
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

      {quranPage !== null && <QuranModal page={quranPage} onClose={() => setQuranPage(null)} />}
    </div>
  );
}
