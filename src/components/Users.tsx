import { useState } from "react";
import { Users as UsersIcon, Plus, Search, Trash2, Edit, X, Save, Shield, Scale, UserCircle, Briefcase, KeyRound, Phone, StickyNote } from "lucide-react";
import type { User } from "../lib/types";

interface Props {
  users: User[];
  loading: boolean;
  onAdd: (u: { special_id: string; name: string; role: User["role"]; phone?: string; notes?: string }) => Promise<User>;
  onUpdate: (id: string, u: Partial<Pick<User, "name" | "role" | "phone" | "notes" | "special_id">>) => Promise<User>;
  onRemove: (id: string) => Promise<void>;
}

const ROLE_CONFIG: Record<User["role"], { label: string; icon: typeof Shield; color: string; bg: string; border: string }> = {
  admin:      { label: "ادمن",    icon: Shield,      color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200" },
  judge:      { label: "محكم",    icon: Scale,      color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  contestant: { label: "متسابق",  icon: UserCircle,  color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
  manager:    { label: "إداري",   icon: Briefcase,   color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
};

const ROLES = Object.entries(ROLE_CONFIG) as [User["role"], typeof ROLE_CONFIG[User["role"]]][];

export default function Users({ users, loading, onAdd, onUpdate, onRemove }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<User["role"] | "all">("all");
  const [editing, setEditing] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ special_id: "", name: "", role: "judge" as User["role"], phone: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.includes(search) || u.special_id.includes(search);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    judge: users.filter((u) => u.role === "judge").length,
    contestant: users.filter((u) => u.role === "contestant").length,
    manager: users.filter((u) => u.role === "manager").length,
  };

  const openAdd = () => {
    setForm({ special_id: "", name: "", role: "judge", phone: "", notes: "" });
    setError("");
    setShowAdd(true);
  };

  const openEdit = (u: User) => {
    setForm({ special_id: u.special_id, name: u.name, role: u.role, phone: u.phone || "", notes: u.notes || "" });
    setError("");
    setEditing(u);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.special_id.trim() || !form.name.trim()) { setError("المعرف الخاص والاسم مطلوبان"); return; }
    setSaving(true); setError("");
    try {
      if (editing) {
        await onUpdate(editing.id, { special_id: form.special_id, name: form.name, role: form.role, phone: form.phone, notes: form.notes });
        setEditing(null);
      } else {
        await onAdd({ special_id: form.special_id, name: form.name, role: form.role, phone: form.phone, notes: form.notes });
        setShowAdd(false);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try { await onRemove(id); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">إدارة المستخدمين</h1>
          <p className="text-gray-500 text-sm">إضافة وإدارة المحكمين والمتسابقين والإداريين والمشرفين</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
          <Plus className="w-5 h-5" /> إضافة مستخدم
        </button>
      </div>

      {/* Role filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button onClick={() => setRoleFilter("all")}
          className={`p-4 rounded-2xl border-2 transition-all text-right ${roleFilter === "all" ? "border-gray-800 bg-gray-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
          <div className="flex items-center justify-between mb-1">
            <UsersIcon className="w-5 h-5 text-gray-600" />
            <span className="text-2xl font-bold text-gray-800">{counts.all}</span>
          </div>
          <p className="text-sm font-semibold text-gray-600">الكل</p>
        </button>
        {ROLES.map(([role, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button key={role} onClick={() => setRoleFilter(role)}
              className={`p-4 rounded-2xl border-2 transition-all text-right ${roleFilter === role ? `${cfg.border} ${cfg.bg}` : "border-gray-100 bg-white hover:border-gray-200"}`}>
              <div className="flex items-center justify-between mb-1">
                <Icon className={`w-5 h-5 ${cfg.color}`} />
                <span className={`text-2xl font-bold ${cfg.color}`}>{counts[role]}</span>
              </div>
              <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو المعرف الخاص..."
          className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
      </div>

      {/* Users list */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>لا يوجد مستخدمون مطابقون</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((u) => {
            const cfg = ROLE_CONFIG[u.role];
            const Icon = cfg.icon;
            return (
              <div key={u.id} className="bg-white rounded-2xl card-shadow border border-gray-100 p-4 flex items-center gap-4 group hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-800 truncate">{u.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} ${cfg.border} border`}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><KeyRound className="w-3 h-3" /> {u.special_id}</span>
                    {u.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {u.phone}</span>}
                  </div>
                  {u.notes && <p className="text-xs text-gray-400 mt-1 truncate"><StickyNote className="w-3 h-3 inline" /> {u.notes}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(u)} className="w-9 h-9 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      {(showAdd || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{editing ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</h2>
              <button onClick={() => { setShowAdd(false); setEditing(null); }} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">المعرف الخاص *</label>
                <input required value={form.special_id} onChange={(e) => setForm({ ...form, special_id: e.target.value })}
                  placeholder="مثال: JUDGE001"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all font-mono" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الدور *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(([role, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={role} type="button" onClick={() => setForm({ ...form, role })}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.role === role ? `${cfg.border} ${cfg.bg}` : "border-gray-200 hover:border-gray-300"}`}>
                        <Icon className={`w-5 h-5 ${form.role === role ? cfg.color : "text-gray-400"}`} />
                        <span className={`font-semibold text-sm ${form.role === role ? cfg.color : "text-gray-600"}`}>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الجسم (اختياري)</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات (اختياري)</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all resize-none" />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button type="button" onClick={() => { setShowAdd(false); setEditing(null); }}
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
