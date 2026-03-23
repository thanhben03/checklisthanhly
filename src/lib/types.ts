export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface Item {
  id: number;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;
  name: string;
  notes: string | null;
  price: number | null;
  priority: "high" | "medium" | "low";
  is_purchased: boolean;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemFormData {
  name: string;
  category_id: number | null;
  priority: "high" | "medium" | "low";
  notes: string;
  price: string;
}

export const PRIORITY_LABELS: Record<string, string> = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

export const PRIORITY_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  high: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  medium: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  low: { bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-500" },
};

export const SUGGESTED_ITEMS: Record<string, string[]> = {
  "Giấy tờ": [
    "Hộ chiếu",
    "Visa",
    "Vé máy bay",
    "Thẻ căn cước công dân",
    "Hợp đồng lao động",
    "Bảo hiểm y tế / du lịch",
    "Ảnh thẻ (4x6)",
    "Giấy giới thiệu / Công văn",
    "Bằng lái xe quốc tế",
  ],
  "Quần áo": [
    "Quần jean (x2)",
    "Quần tây (x2)",
    "Áo phông (x5)",
    "Áo sơ mi (x3)",
    "Áo khoác",
    "Đồ ngủ",
    "Đồ thể thao",
    "Giày tây",
    "Giày thể thao",
    "Dép",
    "Tất (x7 đôi)",
    "Đồ lót (x7 bộ)",
  ],
  "Y tế & Sức khỏe": [
    "Thuốc cảm cúm",
    "Thuốc đau bụng / tiêu chảy",
    "Thuốc đau đầu",
    "Thuốc dị ứng",
    "Thuốc nhỏ mắt",
    "Băng gạc y tế",
    "Cồn sát trùng",
    "Nhiệt kế điện tử",
    "Khẩu trang (x20)",
    "Vitamin tổng hợp",
  ],
  "Điện tử": [
    "Điện thoại",
    "Laptop",
    "Sạc điện thoại",
    "Sạc laptop",
    "Adapter đa năng (đa quốc gia)",
    "Tai nghe",
    "Pin dự phòng (powerbank)",
    "Cáp USB",
    "Ổ cứng di động / USB",
    "Bàn phím / chuột (nếu cần)",
  ],
  "Vệ sinh cá nhân": [
    "Bàn chải đánh răng",
    "Kem đánh răng",
    "Dầu gội đầu",
    "Dầu xả tóc",
    "Sữa tắm",
    "Dao cạo râu",
    "Lăn khử mùi",
    "Kem dưỡng da",
    "Kem chống nắng",
    "Bông tẩy trang",
    "Tăm bông",
    "Chỉ nha khoa",
  ],
  "Tài chính": [
    "Thẻ Visa/Mastercard quốc tế",
    "Tiền mặt ngoại tệ (đổi trước)",
    "Ví đựng tiền",
    "Ghi lại số điện thoại ngân hàng",
    "Cài app ngân hàng trên điện thoại",
  ],
  "Đồ dùng cá nhân": [
    "Vali/Ba lô lớn",
    "Ba lô nhỏ (carry-on)",
    "Túi đựng đồ dùng cá nhân",
    "Ổ khóa vali",
    "Gối cổ du lịch",
    "Bịt mắt ngủ",
    "Nút bịt tai",
    "Dây sạc dự phòng",
    "Kính mắt + hộp kính",
    "Kính áp tròng + dung dịch",
  ],
  "Thực phẩm": [
    "Mì gói Việt Nam (x10)",
    "Phở gói/bún bò gói",
    "Gia vị nấu ăn (muối, nước mắm, ...)",
    "Cà phê Việt Nam / trà",
    "Ruốc bò / khô gà",
    "Bánh kẹo Việt Nam",
    "Hạt điều / hạt macca",
  ],
};
