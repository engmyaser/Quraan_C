import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";

interface Props {
  onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: Props) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    setLeaving(true);
    setTimeout(onEnter, 600);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${leaving ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
      style={{ background: "linear-gradient(160deg, #0a4d38 0%, #0f6b4f 40%, #145c41 70%, #0a3d2c 100%)" }}
    >
      {/* Decorative background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gold geometric arcs */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10%" cy="20%" r="320" fill="none" stroke="#c9a227" strokeWidth="1.5" />
          <circle cx="90%" cy="80%" r="280" fill="none" stroke="#c9a227" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="500" fill="none" stroke="#c9a227" strokeWidth="0.8" />
          <circle cx="85%" cy="15%" r="180" fill="none" stroke="#c9a227" strokeWidth="1.2" />
          <circle cx="15%" cy="85%" r="200" fill="none" stroke="#c9a227" strokeWidth="1" />
        </svg>
        {/* Soft radial glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #c9a22740 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, #16a34a50 0%, transparent 70%)" }} />
      </div>

      {/* Gold top border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-3xl mx-4 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Card container */}
        <div className="rounded-3xl overflow-hidden" style={{ boxShadow: "0 32px 80px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,162,39,0.3)" }}>

          {/* Header: logos */}
          <div className="bg-white px-6 py-5 flex items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-emerald-700 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-amber-400" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-800 text-sm leading-tight">المملكة العربية السعودية</p>
                <p className="text-xs text-gray-500">إمارة منطقة المدينة المنورة</p>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <p className="font-quran text-emerald-800 text-lg font-bold leading-tight">مسابقة القرآن الكريم</p>
              <p className="text-xs text-gray-500">حفظاً وتلاوة وتفسيراً</p>
            </div>
          </div>

          {/* Gold divider */}
          <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          {/* Body */}
          <div
            className="px-8 py-10 text-center"
            style={{ background: "linear-gradient(180deg, #0f6b4f 0%, #0d5c44 100%)" }}
          >
            {/* Bismillah ornament */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-400/50" />
              <span className="font-quran text-amber-300 text-2xl tracking-widest">بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-400/50" />
            </div>

            {/* Patronage line */}
            <p className="text-amber-200/80 text-base mb-3 leading-relaxed">
              برعاية كريمة من صاحب السمو الملكي الأمير
            </p>
            <h2 className="font-quran text-amber-300 text-3xl sm:text-4xl font-bold mb-2 leading-tight"
              style={{ textShadow: "0 2px 20px rgba(201,162,39,0.4)" }}>
              سلمان بن سلطان بن عبدالعزيز آل سعود
            </h2>
            <p className="text-amber-200/70 text-base mb-8">أمير منطقة المدينة المنورة</p>

            {/* Gold separator ornament */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rotate-45 bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            {/* Competition title card */}
            <div className="relative inline-block mb-6">
              {/* Arrow decorations */}
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0"
                style={{ borderTop: "22px solid transparent", borderBottom: "22px solid transparent", borderLeft: "14px solid #c9a227" }} />
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0"
                style={{ borderTop: "22px solid transparent", borderBottom: "22px solid transparent", borderRight: "14px solid #c9a227" }} />
              <div className="px-10 py-4 rounded-lg border-2 border-amber-400/60"
                style={{ background: "rgba(201,162,39,0.12)", boxShadow: "inset 0 0 30px rgba(201,162,39,0.1)" }}>
                <h1 className="font-quran text-white text-2xl sm:text-3xl font-bold leading-snug"
                  style={{ textShadow: "0 2px 16px rgba(201,162,39,0.3)" }}>
                  مسابقة حفظ القرآن الكريم وتلاوته وتفسيره
                </h1>
              </div>
            </div>

            {/* Subtitle lines */}
            <p className="text-amber-100/80 text-lg mb-2">لموظفي وموظفات الإدارات الحكومية</p>
            <p className="text-amber-200/70 text-base mb-2">بمنطقة المدينة المنورة</p>
            <p className="text-amber-300/80 text-base font-semibold mb-10">
              "الدورة الحادية عشرة" 1448هـ - 2026م
            </p>

            {/* Enter button */}
            <button
              onClick={handleEnter}
              className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #c9a227, #e6c558, #c9a227)",
                boxShadow: "0 8px 32px -8px rgba(201,162,39,0.6), 0 0 0 1px rgba(201,162,39,0.4)",
                color: "#0a3d2c",
              }}
            >
              <span>دخول المنصة</span>
              <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              {/* Shimmer overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", transform: "skewX(-20deg)" }} />
            </button>
          </div>

          {/* Footer */}
          <div className="bg-emerald-950/60 px-6 py-3 flex items-center justify-center border-t border-amber-400/10">
            <p className="text-amber-200/40 text-xs">منصة إدارة وتقييم المسابقة القرآنية</p>
          </div>
        </div>
      </div>
    </div>
  );
}
