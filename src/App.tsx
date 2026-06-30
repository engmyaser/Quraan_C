import { useState } from "react";
import { LayoutDashboard, Users as UsersIcon, Scale, ClipboardList, Trophy, Settings as SettingsIcon, LogOut, BookOpen, Menu, X, FileText, BookText, UserCog } from "lucide-react";
import { useAuth } from "./lib/auth";
import { useContestants, useJudges, useSessions, useBranchScores, useTafsirQuestions, useQuranQuestions, useUsers } from "./lib/hooks";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Contestants from "./components/Contestants";
import Judges from "./components/Judges";
import Scoring from "./components/Scoring";
import Results from "./components/Results";
import Settings from "./components/Settings";
import TafsirQuestions from "./components/TafsirQuestions";
import QuranQuestions from "./components/QuranQuestions";
import WelcomeScreen from "./components/WelcomeScreen";
import Users from "./components/Users";

type View = "dashboard" | "contestants" | "judges" | "scoring" | "results" | "settings" | "tafsir" | "quran" | "users";

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { id: "contestants", label: "المتسابقون", icon: UsersIcon },
  { id: "judges", label: "المحكمون", icon: Scale },
  { id: "scoring", label: "جلسة تقييم", icon: ClipboardList },
  { id: "tafsir", label: "أسئلة التفسير", icon: FileText },
  { id: "quran", label: "أسئلة القرآن", icon: BookText },
  { id: "results", label: "النتائج", icon: Trophy },
  { id: "users", label: "المستخدمون", icon: UserCog },
  { id: "settings", label: "الإعدادات", icon: SettingsIcon },
];

function App() {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem("qc_welcome_seen"));
  
  const contestantsHook = useContestants();
  const judgesHook = useJudges();
  const sessionsHook = useSessions();
  const branchScoresHook = useBranchScores();
  const tafsirHook = useTafsirQuestions();
  const quranHook = useQuranQuestions();
  const usersHook = useUsers();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5ec]">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-emerald-600 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <WelcomeScreen
        onEnter={() => {
          sessionStorage.setItem("qc_welcome_seen", "1");
          setShowWelcome(false);
        }}
      />
    );
  }

  if (!user) return <Login />;

  const renderView = () => {
    switch (view) {
      case "dashboard":
        return <Dashboard contestants={contestantsHook.contestants} judges={judgesHook.judges} sessions={sessionsHook.sessions} />;
      case "contestants":
        return <Contestants contestants={contestantsHook.contestants} loading={contestantsHook.loading} onAdd={contestantsHook.add} onUpdate={contestantsHook.update} onRemove={contestantsHook.remove} />;
      case "judges":
        return <Judges judges={judgesHook.judges} loading={judgesHook.loading} onAdd={judgesHook.add} onUpdate={judgesHook.update} onRemove={judgesHook.remove} />;
      case "scoring":
        return <Scoring contestants={contestantsHook.contestants} judges={judgesHook.judges} branchScores={branchScoresHook.scores} tafsirQuestions={tafsirHook.questions} onSave={sessionsHook.add} />;
      case "results":
        return <Results sessions={sessionsHook.sessions} contestants={contestantsHook.contestants} loading={sessionsHook.loading} onRemove={sessionsHook.remove} />;
      case "settings":
        return <Settings scores={branchScoresHook.scores} loading={branchScoresHook.loading} onUpdate={branchScoresHook.update} />;
      case "tafsir":
        return <TafsirQuestions questions={tafsirHook.questions} loading={tafsirHook.loading} onUpsert={tafsirHook.upsert} onRemove={tafsirHook.remove} />;
      case "quran":
        return <QuranQuestions questions={quranHook.questions} loading={quranHook.loading} onUpsert={quranHook.upsert} onRemove={quranHook.remove} />;
      case "users":
        return <Users users={usersHook.users} loading={usersHook.loading} onAdd={usersHook.add} onUpdate={usersHook.update} onRemove={usersHook.remove} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5ec] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-gradient-to-b from-emerald-800 to-emerald-900 text-white z-40 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-900" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-bold text-white">مسابقة القرآن</h1>
              <p className="text-xs text-amber-200/70">منصة الإدارة والتقييم</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active ? "bg-white/15 text-white shadow-lg" : "text-emerald-100/70 hover:bg-white/10 hover:text-white"}`}>
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-emerald-200/60 font-mono truncate">{user.special_id}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-sm font-semibold transition-colors">
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-emerald-800 text-white px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm">مسابقة القرآن</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
