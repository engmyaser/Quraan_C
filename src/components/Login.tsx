import { useState } from "react";
import { BookOpen, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const [specialId, setSpecialId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(specialId);
    if (!result.ok) setError(result.error || "فشل تسجيل الدخول");
    setLoading(false);
  };

  return (
    <div className="min-h-screen pattern-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 shadow-xl mb-4">
            <BookOpen className="w-10 h-10 text-emerald-900" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">منصة مسابقة القرآن الكريم</h1>
          <p className="text-amber-200/80 text-sm">منصة إدارة وتقييم مسابقات حفظ وتلاوة القرآن الكريم</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-2xl card-shadow-lg p-8 border border-amber-200/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">تسجيل الدخول</h2>
              <p className="text-xs text-gray-500">أدخل المعرف الخاص للدخول إلى المنصة</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">المعرف الخاص</label>
              <input
                type="text"
                value={specialId}
                onChange={(e) => setSpecialId(e.target.value)}
                placeholder="مثال: QC-ADMIN-001"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-center font-mono tracking-wider"
                dir="ltr"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-l from-emerald-700 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:from-emerald-800 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? "جاري التحقق..." : "دخول"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              المعرف الافتراضي للتجربة: <span className="font-mono font-bold text-emerald-600">QC-ADMIN-001</span>
            </p>
          </div>
        </div>

        <p className="text-center text-amber-200/60 text-xs mt-6">
          © 2026 منصة مسابقة القرآن الكريم
        </p>
      </div>
    </div>
  );
}
