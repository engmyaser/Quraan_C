import { useState } from "react";
import { UserPlus, Search, Edit2, Trash2, X, Phone, CreditCard, MapPin, Users as UsersIcon } from "lucide-react";
import type { Contestant } from "../lib/types";
import { BRANCH_NAMES } from "../lib/questions";

interface Props {
  contestants: Contestant[];
  loading: boolean;
  onAdd: (c: Omit<Contestant, "id" | "created_at">) => Promise<Contestant>;
  onUpdate: (id: string, patch: Partial<Contestant>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const empty = { name: "", national_id: "", phone: "", nationality: "", branch: 1, institution: "", notes: "" };

export default function Contestants({ contestants, loading, onAdd, onUpdate, onRemove }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contestant | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openAdd = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (c: Contestant) => {
    setEditing(c);
    setForm({ name: c.name, national_id: c.national_id || "", phone: c.phone || "", nationality: c.nationality || "", branch: c.branch, institution: c.institution || "", notes: c.notes || "" });
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
    if (!confirm("هل أنت متأكد من حذف هذا المتسابق؟")) return;
    try { await onRemove(id); } catch { /* ignore */ }
  };

  const filtered = contestants.filter((c) =>
    c.name.includes(search) || (c.national_id || "").includes(search) || (c.institution || "").includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">المتسابقون</h1>
          <p className="text-gray-500 text-sm">{contestants.length} متسابق مسجل</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <UserPlus className="w-5 h-5" />
          إضافة متسابق
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الرقم الوطني أو المؤسسة..."
          className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl card-shadow border border-gray-100">
          <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">لا يوجد متسابقون</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 card-shadow border border-gray-100 hover:card-shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{c.name}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                      {BRANCH_NAMES[c.branch]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                {c.national_id && <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> {c.national_id}</div>}
                {c.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {c.phone}</div>}
                {c.nationality && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {c.nationality}</div>}
                {c.institution && <div className="flex items-center gap-2"><UsersIcon className="w-4 h-4" /> {c.institution}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{editing ? "تعديل متسابق" : "إضافة متسابق"}</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم الكامل *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الرقم الوطني</label>
                  <input value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الهاتف</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الجنسية</label>
                  <input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الفرع *</label>
                  <select value={form.branch} onChange={(e) => setForm({ ...form, branch: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all bg-white">
                    <option value={1}>الفرع الأول</option>
                    <option value={2}>الفرع الثاني</option>
                    <option value={3}>الفرع الثالث</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">المؤسسة</label>
                <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all resize-none" />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60">
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
