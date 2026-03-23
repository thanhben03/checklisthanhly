"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Sparkles,
  Package,
  CheckCircle2,
  Circle,
  AlertCircle,
  X,
} from "lucide-react";
import { Category, Item, ItemFormData } from "@/lib/types";
import ItemCard from "@/components/ItemCard";
import ItemModal from "@/components/ItemModal";
import SuggestionsModal from "@/components/SuggestionsModal";

type StatusFilter = "all" | "pending" | "purchased";

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [itemsRes, catsRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/categories"),
      ]);

      if (!itemsRes.ok || !catsRes.ok) {
        const failedRes = !catsRes.ok ? catsRes : itemsRes;
        let errMsg = "Lỗi tải dữ liệu";
        try {
          const errData = await failedRes.json();
          if (errData?.error) errMsg = errData.error;
        } catch {}
        throw new Error(errMsg);
      }

      const [itemsData, catsData] = await Promise.all([
        itemsRes.json(),
        catsRes.json(),
      ]);
      setItems(itemsData);
      setCategories(catsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể kết nối tới server"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const purchased = items.filter((i) => i.is_purchased).length;
    const high = items.filter((i) => i.priority === "high" && !i.is_purchased).length;
    const totalCost = items.reduce((sum, i) => sum + (i.price ?? 0), 0);
    const spentCost = items
      .filter((i) => i.is_purchased)
      .reduce((sum, i) => sum + (i.price ?? 0), 0);
    return { total, purchased, pending: total - purchased, high, totalCost, spentCost };
  }, [items]);

  const progressPercent = stats.total === 0 ? 0 : Math.round((stats.purchased / stats.total) * 100);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategoryId === null || item.category_id === selectedCategoryId;
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
          ? !item.is_purchased
          : item.is_purchased;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [items, searchQuery, selectedCategoryId, statusFilter]);

  // API calls
  const handleToggle = async (id: number, current: boolean) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_purchased: !current } : item
      )
    );
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggle_purchased: !current }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      // Revert on error
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_purchased: current } : item
        )
      );
    }
  };

  const handleSaveItem = async (data: ItemFormData) => {
    // Convert formatted price string "500.000" → number 500000
    const payload = {
      ...data,
      price: data.price ? data.price.replace(/\./g, "").replace(/,/g, "") : null,
    };
    if (editingItem) {
      const res = await fetch(`/api/items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Không thể cập nhật");
      const updated = await res.json();
      setItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? updated : item))
      );
    } else {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Không thể thêm");
      const newItem = await res.json();
      setItems((prev) => [newItem, ...prev]);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Không thể xóa");
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddSuggested = async (name: string, categoryId: number | null) => {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category_id: categoryId, priority: "medium" }),
    });
    if (!res.ok) throw new Error();
    const newItem = await res.json();
    setItems((prev) => [newItem, ...prev]);
  };

  const openAdd = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  // Group items by category for display
  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    for (const item of filteredItems) {
      const key = item.category_name || "Chưa phân loại";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [filteredItems]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                ✈️ Checklist Hành Lý
              </h1>
              <p className="text-indigo-200 text-xs mt-0.5">
                {stats.total === 0
                  ? "Chưa có vật dụng nào"
                  : `${stats.purchased}/${stats.total} vật dụng đã mua`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold">{progressPercent}%</span>
              <p className="text-indigo-200 text-xs">hoàn thành</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <div className="text-lg font-bold">{stats.total}</div>
              <div className="text-indigo-200 text-xs">Tổng</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <div className="text-lg font-bold text-green-300">{stats.purchased}</div>
              <div className="text-indigo-200 text-xs">Đã mua</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <div className="text-lg font-bold text-amber-300">{stats.pending}</div>
              <div className="text-indigo-200 text-xs">Còn lại</div>
            </div>
          </div>

          {/* Cost row - only show if any item has a price */}
          {stats.totalCost > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
                <div className="text-sm font-bold text-emerald-300">
                  {stats.spentCost.toLocaleString("vi-VN")}đ
                </div>
                <div className="text-indigo-200 text-xs">Đã chi</div>
              </div>
              <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
                <div className="text-sm font-bold text-white">
                  {stats.totalCost.toLocaleString("vi-VN")}đ
                </div>
                <div className="text-indigo-200 text-xs">Tổng chi phí</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 pb-32">
        {/* High priority alert */}
        {stats.high > 0 && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              Có <strong>{stats.high}</strong> vật dụng ưu tiên cao chưa mua
            </span>
          </div>
        )}

        {/* Search and filter */}
        <div className="mt-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm vật dụng..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            {(
              [
                { value: "all", label: "Tất cả", icon: Package },
                { value: "pending", label: "Chưa mua", icon: Circle },
                { value: "purchased", label: "Đã mua", icon: CheckCircle2 },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-all ${
                  statusFilter === value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                selectedCategoryId === null
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-200"
              }`}
            >
              Tất cả danh mục
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategoryId(
                    selectedCategoryId === cat.id ? null : cat.id
                  )
                }
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  selectedCategoryId === cat.id
                    ? "text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
                style={
                  selectedCategoryId === cat.id
                    ? { backgroundColor: cat.color }
                    : {}
                }
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl overflow-hidden">
            <div className="p-4 text-center border-b border-red-100">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-700 font-semibold">Không thể kết nối database</p>
            </div>
            <div className="p-4">
              <pre className="text-xs text-red-600 bg-red-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words">
                {error}
              </pre>
              <p className="text-xs text-gray-500 mt-3">
                Chỉnh sửa thông tin kết nối trong file{" "}
                <code className="bg-gray-100 px-1 rounded">.env.local</code>
              </p>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={fetchData}
                className="w-full py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !error && (
          <div className="mt-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent" />
            <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && items.length === 0 && (
          <div className="mt-16 text-center animate-fade-in">
            <div className="text-6xl mb-4">🧳</div>
            <h3 className="text-lg font-semibold text-gray-700">
              Chưa có vật dụng nào
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Bắt đầu thêm vật dụng cần mang theo
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm thủ công
              </button>
              <button
                onClick={() => setIsSuggestionsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 text-sm font-medium rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Xem gợi ý
              </button>
            </div>
          </div>
        )}

        {/* No results */}
        {!isLoading && !error && items.length > 0 && filteredItems.length === 0 && (
          <div className="mt-12 text-center animate-fade-in">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Không tìm thấy kết quả</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryId(null);
                setStatusFilter("all");
              }}
              className="mt-2 text-sm text-indigo-600 hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Items grouped by category */}
        {!isLoading && !error && filteredItems.length > 0 && (
          <div className="mt-4 space-y-5 animate-fade-in">
            {Object.entries(groupedItems).map(([groupName, groupItems]) => {
              const cat = categories.find((c) => c.name === groupName);
              return (
                <div key={groupName}>
                  {/* Group header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: cat?.color || "#6B7280" }}
                    >
                      {cat?.icon || "📦"} {groupName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {groupItems.filter((i) => i.is_purchased).length}/
                      {groupItems.length}
                    </span>
                  </div>
                  {/* Items */}
                  <div className="space-y-2">
                    {groupItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onToggle={handleToggle}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Completion message */}
        {!isLoading && !error && stats.total > 0 && stats.pending === 0 && statusFilter !== "pending" && (
          <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-center animate-fade-in">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-semibold text-green-800">Tuyệt vời!</h3>
            <p className="text-sm text-green-700 mt-1">
              Bạn đã mua đủ tất cả {stats.total} vật dụng. Chúc chuyến đi thuận lợi!
            </p>
          </div>
        )}
      </main>

      {/* FAB buttons */}
      <div className="fixed bottom-6 right-4 flex flex-col gap-3 z-30">
        <button
          onClick={() => setIsSuggestionsOpen(true)}
          className="flex items-center justify-center h-12 w-12 bg-white text-indigo-600 rounded-2xl shadow-lg border border-indigo-100 hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95"
          aria-label="Gợi ý vật dụng"
          title="Gợi ý vật dụng"
        >
          <Sparkles className="h-5 w-5" />
        </button>
        <button
          onClick={openAdd}
          className="flex items-center justify-center h-14 w-14 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
          aria-label="Thêm vật dụng"
          title="Thêm vật dụng mới"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        editingItem={editingItem}
        categories={categories}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
      />
      <SuggestionsModal
        isOpen={isSuggestionsOpen}
        categories={categories}
        onClose={() => setIsSuggestionsOpen(false)}
        onAddItem={handleAddSuggested}
      />
    </div>
  );
}
