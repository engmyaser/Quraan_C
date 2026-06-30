import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface Props {
  page: number;
  onClose: () => void;
}

export default function QuranModal({ page, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(page);

  const imageUrl = `https://www.muqri.com/jpg/${currentPage}.jpg`;

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [currentPage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            صفحة <span className="text-emerald-600">{currentPage}</span>
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="relative flex-1 overflow-auto bg-gray-50 flex items-center justify-center min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-64 rounded-lg shimmer" />
            </div>
          )}
          {error ? (
            <div className="text-center p-8 text-gray-500">
              <p className="mb-2">تعذر تحميل الصفحة</p>
              <p className="text-sm">رقم الصفحة: {currentPage}</p>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={`صفحة ${currentPage}`}
              className="max-w-full max-h-[70vh] object-contain"
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
              style={{ display: loading ? "none" : "block" }}
            />
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors text-sm font-semibold"
          >
            <ChevronRight className="w-4 h-4" />
            السابقة
          </button>
          <span className="text-sm text-gray-500 font-mono">{currentPage} / 604</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(604, p + 1))}
            disabled={currentPage >= 604}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors text-sm font-semibold"
          >
            التالية
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
