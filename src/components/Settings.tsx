import { useState } from "react";
import { Settings as SettingsIcon, Save, Check } from "lucide-react";
import type { BranchScore } from "../lib/types";
import { BRANCH_NAMES } from "../lib/questions";

interface Props {
  scores: BranchScore[];
  loading: boolean;
  onUpdate: (id: string, patch: Partial<BranchScore>) => Promise<void>;
}

export default function Settings({ scores, loading, onUpdate }: Props) {
  const [edits, setEdits] = useState<Record<string, BranchScore>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const getEdit = (s: BranchScore): BranchScore => edits[s.id] || s;

  const setField = (id: string, field: keyof BranchScore, value: number) => {
    setEdits((p) => ({
      ...p,
      [id]: { ...(p[id] || scores.find((s) => s.id === id)!), [field]: value },
    }));
  };

  const handleSave = async (s: BranchScore) => {
    const edit = edits[s.id];
    if (!edit) return;
    setSaving(s.id);
    try {
      await onUpdate(s.id, { score_h: edit.score_h, score_t: edit.score_t, score_l: edit.score_l, score_f: edit.score_f });
      setEdits((p) => { const n = { ...p }; delete n[s.id]; return n; });
      setSaved(s.id);
      setTimeout(() => setSaved(null), 2000);
    } catch { /* ignore */ }
    setSaving(null);
  };

  const fields: { key: keyof BranchScore; label: string; color: string }[] = [
    { key: "score_h", label: "الحفظ", color: "emerald" },
    { key: "score_t", label: "التجويد", color: "amber" },
    { key: "score_l", label: "التلاوة", color: "blue" },
    { key: "score_f", label: "التفسير", color: "purple" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">الإعدادات</h1>
        <p className="text-gray-500 text-sm">ضبط درجات التقييم لكل فرع</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}</div>
      ) : (
        <div className="space-y-4">
          {scores.sort((a, b) => a.branch - b.branch).map((s) => {
            const edit = getEdit(s);
            const total = edit.score_h + edit.score_t + edit.score_l + edit.score_f;
            const isDirty = !!edits[s.id];
            return (
              <div key={s.id} className="bg-white rounded-2xl p-6 card-shadow border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <SettingsIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{BRANCH_NAMES[s.branch]}</h3>
                      <p className="text-xs text-gray-500">الحد الأقصى للسؤال: {total} درجة</p>
                    </div>
                  </div>
                  {saved === s.id ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-semibold">
                      <Check className="w-4 h-4" /> تم الحفظ
                    </span>
                  ) : isDirty ? (
                    <button onClick={() => handleSave(s)} disabled={saving === s.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60">
                      <Save className="w-4 h-4" /> {saving === s.id ? "جاري الحفظ..." : "حفظ"}
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {fields.map((f) => {
                    const colorMap: Record<string, string> = {
                      emerald: "border-emerald-200 bg-emerald-50 focus:border-emerald-500",
                      amber: "border-amber-200 bg-amber-50 focus:border-amber-500",
                      blue: "border-blue-200 bg-blue-50 focus:border-blue-500",
                      purple: "border-purple-200 bg-purple-50 focus:border-purple-500",
                    };
                    return (
                      <div key={f.key} className={`p-4 rounded-xl border-2 ${colorMap[f.color]}`}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                        <input type="number" value={edit[f.key] as number} min={0} max={100}
                          onChange={(e) => setField(s.id, f.key, Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border-2 border-white bg-white/70 outline-none focus:ring-2 focus:ring-emerald-200 text-center font-bold text-lg" />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
