"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Category, Item, ItemFormData, PRIORITY_LABELS } from "@/lib/types";

interface ItemModalProps {
  isOpen: boolean;
  editingItem: Item | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: ItemFormData) => Promise<void>;
}

const DEFAULT_FORM: ItemFormData = {
  name: "",
  category_id: null,
  priority: "medium",
  notes: "",
  price: "",
};

function formatPriceInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return parseInt(digits, 10).toLocaleString("vi-VN");
}

export default function ItemModal({
  isOpen,
  editingItem,
  categories,
  onClose,
  onSave,
}: ItemModalProps) {
  const [form, setForm] = useState<ItemFormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setForm({
          name: editingItem.name,
          category_id: editingItem.category_id,
          priority: editingItem.priority,
          notes: editingItem.notes || "",
          price:
            editingItem.price != null
              ? editingItem.price.toLocaleString("vi-VN")
              : "",
        });
      } else {
        setForm(DEFAULT_FORM);
      }
      setError("");
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Vui lòng nhập tên vật dụng");
      nameRef.current?.focus();
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up mx-0 sm:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {editingItem ? "Chỉnh sửa vật dụng" : "Thêm vật dụng mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tên vật dụng <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Hộ chiếu, Sạc điện thoại..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Danh mục
            </label>
            <select
              value={form.category_id ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  category_id: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all"
            >
              <option value="">-- Không phân loại --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mức độ ưu tiên
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["high", "medium", "low"] as const).map((p) => {
                const colors = {
                  high: {
                    active: "bg-red-500 text-white border-red-500",
                    inactive: "border-gray-200 text-gray-600 hover:border-red-300",
                  },
                  medium: {
                    active: "bg-amber-500 text-white border-amber-500",
                    inactive: "border-gray-200 text-gray-600 hover:border-amber-300",
                  },
                  low: {
                    active: "bg-sky-500 text-white border-sky-500",
                    inactive: "border-gray-200 text-gray-600 hover:border-sky-300",
                  },
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`py-2 text-sm font-medium rounded-xl border-2 transition-all ${
                      form.priority === p
                        ? colors[p].active
                        : colors[p].inactive
                    }`}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Giá dự kiến
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: formatPriceInput(e.target.value) })
                }
                placeholder="VD: 500.000"
                className="w-full pl-3 pr-12 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">
                VNĐ
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ghi chú
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Thêm ghi chú (không bắt buộc)..."
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Đang lưu..." : editingItem ? "Cập nhật" : "Thêm vào danh sách"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
