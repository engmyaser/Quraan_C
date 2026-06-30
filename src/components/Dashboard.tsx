import { Users, Scale, Trophy, BarChart3, TrendingUp, Award } from "lucide-react";
import type { Contestant, Judge, SessionRow } from "../lib/types";
import { BRANCH_NAMES } from "../lib/questions";

interface Props {
  contestants: Contestant[];
  judges: Judge[];
  sessions: SessionRow[];
}

export default function Dashboard({ contestants, judges, sessions }: Props) {
  const branchCounts = [1, 2, 3].map((b) => ({
    branch: b,
    count: contestants.filter((c) => c.branch === b).length,
    sessions: sessions.filter((s) => s.branch === b).length,
  }));

  const avgScore = sessions.length
    ? (sessions.reduce((sum, s) => sum + Number(s.score_100), 0) / sessions.length).toFixed(1)
    : "0";

  const topScore = sessions.length
    ? Math.max(...sessions.map((s) => Number(s.score_100))).toFixed(1)
    : "0";

  const recentSessions = sessions.slice(0, 5);
  const contestantName = (id: string) => contestants.find((c) => c.id === id)?.name || "غير معروف";

  const stats = [
    { label: "المتسابقون", value: contestants.length, icon: Users, color: "emerald" },
    { label: "المحكمون", value: judges.length, icon: Scale, color: "amber" },
    { label: "جلسات التقييم", value: sessions.length, icon: Trophy, color: "blue" },
    { label: "متوسط الدرجات", value: avgScore, icon: TrendingUp, color: "purple" },
  ];

  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
    amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
    blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/20",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm">نظرة عامة على مسابقة القرآن الكريم</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
              <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[stat.color]} items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Branch overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {branchCounts.map((b) => (
          <div key={b.branch} className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">{BRANCH_NAMES[b.branch]}</h3>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {b.count} متسابق
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>الجلسات المنجزة</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{b.sessions}</p>
              </div>
              <div className="w-px h-12 bg-gray-100" />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span>المتسابقون</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{b.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top score + recent sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-6 text-white card-shadow-lg">
          <Award className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-sm opacity-80 mb-1">أعلى درجة</p>
          <p className="text-4xl font-bold mb-1">{topScore}</p>
          <p className="text-sm opacity-80">من 100</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-5 card-shadow border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">آخر جلسات التقييم</h3>
          {recentSessions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">لا توجد جلسات بعد</p>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{contestantName(s.contestant_id)}</p>
                      <p className="text-xs text-gray-500">{BRANCH_NAMES[s.branch]} • قالب {s.template_num}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-emerald-600">{Number(s.score_100).toFixed(1)}</p>
                    <p className="text-xs text-gray-400">من 100</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
