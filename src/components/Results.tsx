import { useState } from "react";
import { Trophy, Trash2, Search, Award, Users, X } from "lucide-react";
import type { Contestant, SessionRow } from "../lib/types";
import { BRANCH_NAMES } from "../lib/questions";

interface Props {
  sessions: SessionRow[];
  contestants: Contestant[];
  loading: boolean;
  onRemove: (id: string) => Promise<void>;
}

export default function Results({ sessions, contestants, loading, onRemove }: Props) {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState(0);
  const [detail, setDetail] = useState<SessionRow | null>(null);

  const contestantName = (id: string) => contestants.find((c) => c.id === id)?.name || "غير معروف";

  const filtered = sessions
    .filter((s) => branchFilter === 0 || s.branch === branchFilter)
    .filter((s) => contestantName(s.contestant_id).includes(search))
    .sort((a, b) => Number(b.score_100) - Number(a.score_100));

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الجلسة؟")) return;
    try { await onRemove(id); } catch { /* ignore */ }
  };

  const medal = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">النتائج</h1>
        <p className="text-gray-500 text-sm">{sessions.length} جلسة تقييم مسجلة</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم المتسابق..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all bg-white" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBranchFilter(0)}
            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${branchFilter === 0 ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border-2 border-gray-200"}`}>
            الكل
          </button>
          {[1, 2, 3].map((b) => (
            <button key={b} onClick={() => setBranchFilter(b)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${branchFilter === b ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border-2 border-gray-200"}`}>
              {BRANCH_NAMES[b]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 rounded-2xl shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl card-shadow border border-gray-100">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="px-4 py-3 text-right font-semibold">الترتيب</th>
                <th className="px-4 py-3 text-right font-semibold">المتسابق</th>
                <th className="px-4 py-3 text-right font-semibold">الفرع</th>
                <th className="px-4 py-3 text-right font-semibold">القالب</th>
                <th className="px-4 py-3 text-right font-semibold">المحكمون</th>
                <th className="px-4 py-3 text-right font-semibold">الدرجة /100</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50/50 group">
                  <td className="px-4 py-3">
                    <span className="font-bold text-lg">{medal(i) || `${i + 1}`}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{contestantName(s.contestant_id)}</td>
                  <td className="px-4 py-3 text-gray-600">{BRANCH_NAMES[s.branch]}</td>
                  <td className="px-4 py-3 text-gray-600">{s.template_num}</td>
                  <td className="px-4 py-3 text-gray-600">{s.judges_count}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-base ${Number(s.score_100) >= 80 ? "text-emerald-600" : Number(s.score_100) >= 60 ? "text-amber-600" : "text-red-500"}`}>
                      {Number(s.score_100).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setDetail(s)} className="w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center">
                        <Award className="w-4 h-4 text-emerald-500" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">تفاصيل الجلسة</h2>
              <button onClick={() => setDetail(null)} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center py-4 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">{contestantName(detail.contestant_id)}</p>
                <p className="text-4xl font-bold text-emerald-700">{Number(detail.score_100).toFixed(1)}</p>
                <p className="text-sm text-gray-400">من 100</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-400 text-xs mb-1">الفرع</p>
                  <p className="font-semibold text-gray-700">{BRANCH_NAMES[detail.branch]}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-400 text-xs mb-1">القالب</p>
                  <p className="font-semibold text-gray-700">قالب {detail.template_num}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-400 text-xs mb-1">عدد الأسئلة</p>
                  <p className="font-semibold text-gray-700">{detail.q_count}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-400 text-xs mb-1">عدد المحكمين</p>
                  <p className="font-semibold text-gray-700">{detail.judges_count}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-400 text-xs mb-1">المجموع الكلي</p>
                  <p className="font-semibold text-gray-700">{Number(detail.grand_sum).toFixed(1)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-400 text-xs mb-1">الحد الأقصى للسؤال</p>
                  <p className="font-semibold text-gray-700">{detail.max_per_q}</p>
                </div>
              </div>
              {detail.judge_details && detail.judge_details.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">تفاصيل المحكمين</p>
                  <div className="space-y-2">
                    {detail.judge_details.map((jd, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{jd.name}</span>
                        </div>
                        <span className="font-bold text-emerald-600">{jd.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
