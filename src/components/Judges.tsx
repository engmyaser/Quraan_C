import { useState } from "react";
import { UserPlus, Search, Edit2, Trash2, X, Phone, Award, BookOpen, Scale } from "lucide-react";
import type { Judge } from "../lib/types";

interface Props {
  judges: Judge[];
  loading: boolean;
  onAdd: (j: Omit<Judge, "id" | "created_at">) => Promise<Judge>;
  onUpdate: (id: string, patch: Partial<Judge>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const empty = { name: "", qualification: "", specialty: "", phone: "", pin: "", notes: "" };

export default function Judges({ judges, loading, onAdd, onUpdate, onRemove }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Judge | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openAdd = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (j: Judge) => {
    setEditing(j);
    setForm({ name: j.name, qualification: j.qualification || "", specialty: j.specialty || "", phone: j.phone || "", pin: j.pin || "", notes: j.notes || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (editing) await onUpdate(editing.id, form);
      else await onAdd(form);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المحكم؟")) return;
    try { await onRemove(id); } catch { /* ignore */ }
  };

  const filtered = judges.filter((j) => j.name.includes(search) || (j.specialty || "").includes(search));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">المحكمون</h1>
          <p className="text-gray-500 text-sm">{judges.length} محكم مسجل</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20">
          <UserPlus className="w-5 h-5" />
          إضافة محكم
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو التخصص..."
          className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all bg-white" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl card-shadow border border-gray-100">
          <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">لا يوجد محكمون</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((j) => (
            <div key={j.id} className="bg-white rounded-2xl p-5 card-shadow border border-gray-100 hover:card-shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-lg">
                    {j.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{j.name}</h3>
                    {j.specialty && <span className="text-xs text-gray-500">{j.specialty}</span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(j)} className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button onClick={() => handleDelete(j.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                {j.qualification && <div className="flex items-center gap-2"><Award className="w-4 h-4" /> {j.qualification}</div>}
                {j.specialty && <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> {j.specialty}</div>}
                {j.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {j.phone}</div>}
                {j.pin && <div className="flex items-center gap-2"><Scale className="w-4 h-4" /> الرمز: <span className="font-mono">{j.pin}</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{editing ? "تعديل محكم" : "إضافة محكم"}</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">المؤهل</label>
                  <input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">التخصص</label>
                  <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الهاتف</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الرمز التعريفي</label>
                  <input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none transition-all font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none transition-all resize-none" />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors disabled:opacity-60">
                  {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
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
