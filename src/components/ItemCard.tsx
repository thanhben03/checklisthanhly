"use client";

import { useState } from "react";
import { Pencil, Trash2, StickyNote, Banknote } from "lucide-react";
import { Item, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/types";

interface ItemCardProps {
  item: Item;
  onToggle: (id: number, current: boolean) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

export default function ItemCard({
  item,
  onToggle,
  onEdit,
  onDelete,
}: ItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const priority = PRIORITY_COLORS[item.priority];

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(item.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={`group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
        item.is_purchased
          ? "border-green-200 bg-green-50/30"
          : "border-gray-200 hover:border-indigo-200"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(item.id, item.is_purchased)}
          className="mt-0.5 flex-shrink-0 focus:outline-none"
          aria-label={item.is_purchased ? "Bỏ đánh dấu đã mua" : "Đánh dấu đã mua"}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${
              item.is_purchased
                ? "border-green-500 bg-green-500 animate-check-in"
                : "border-gray-300 hover:border-indigo-400"
            }`}
          >
            {item.is_purchased && (
              <svg
                className="h-3.5 w-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`text-sm font-medium leading-snug ${
                item.is_purchased
                  ? "line-through text-gray-400"
                  : "text-gray-800"
              }`}
            >
              {item.name}
            </span>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {item.category_name && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: item.category_color || "#6B7280" }}
              >
                <span>{item.category_icon}</span>
                <span>{item.category_name}</span>
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
              {PRIORITY_LABELS[item.priority]}
            </span>
            {item.price != null && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Banknote className="h-3 w-3" />
                {item.price.toLocaleString("vi-VN")}đ
              </span>
            )}
            {item.notes && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <StickyNote className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{item.notes}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            aria-label="Chỉnh sửa"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-xl z-10 animate-fade-in">
          <div className="text-center px-4">
            <p className="text-sm text-gray-700 mb-3">
              Xóa &ldquo;{item.name}&rdquo;?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
