"use client";

import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { Category, SUGGESTED_ITEMS } from "@/lib/types";

interface SuggestionsModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onAddItem: (name: string, categoryId: number | null) => Promise<void>;
}

export default function SuggestionsModal({
  isOpen,
  categories,
  onClose,
  onAddItem,
}: SuggestionsModalProps) {
  const [adding, setAdding] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>(
    Object.keys(SUGGESTED_ITEMS)[0]
  );

  if (!isOpen) return null;

  const getCategoryId = (name: string): number | null => {
    const cat = categories.find((c) => c.name === name);
    return cat ? cat.id : null;
  };

  const handleAdd = async (itemName: string, categoryName: string) => {
    const key = `${categoryName}:${itemName}`;
    if (adding.has(key) || added.has(key)) return;

    setAdding((prev) => new Set(prev).add(key));
    try {
      await onAddItem(itemName, getCategoryId(categoryName));
      setAdded((prev) => new Set(prev).add(key));
    } finally {
      setAdding((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const currentItems = SUGGESTED_ITEMS[selectedCategory] || [];
  const currentCat = categories.find((c) => c.name === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up mx-0 sm:mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Gợi ý vật dụng
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Chọn và thêm nhanh các vật dụng phổ biến
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 px-5 py-3 overflow-x-auto border-b border-gray-100 flex-shrink-0 scrollbar-hide">
          {Object.keys(SUGGESTED_ITEMS).map((catName) => {
            const cat = categories.find((c) => c.name === catName);
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === catName
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={
                  selectedCategory === catName
                    ? { backgroundColor: cat?.color || "#6B7280" }
                    : {}
                }
              >
                <span>{cat?.icon || "📦"}</span>
                <span>{catName}</span>
              </button>
            );
          })}
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="space-y-1.5">
            {currentItems.map((itemName) => {
              const key = `${selectedCategory}:${itemName}`;
              const isAdding = adding.has(key);
              const isAdded = added.has(key);

              return (
                <div
                  key={itemName}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    {currentCat && (
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: currentCat.color }}
                      />
                    )}
                    <span className="text-sm text-gray-700">{itemName}</span>
                  </div>
                  <button
                    onClick={() => handleAdd(itemName, selectedCategory)}
                    disabled={isAdding || isAdded}
                    className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isAdded
                        ? "bg-green-100 text-green-700"
                        : isAdding
                        ? "bg-gray-100 text-gray-400"
                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 group-hover:opacity-100 opacity-80"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Đã thêm</span>
                      </>
                    ) : isAdding ? (
                      <span>Đang thêm...</span>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        <span>Thêm</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}
