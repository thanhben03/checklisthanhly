import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT
        i.*,
        c.name  AS category_name,
        c.color AS category_color,
        c.icon  AS category_icon
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.is_purchased ASC, i.priority = 'high' DESC, i.priority = 'medium' DESC, i.created_at DESC
    `);

    const items = (rows as Record<string, unknown>[]).map((row) => ({
      ...row,
      is_purchased: row.is_purchased === 1,
      price: row.price != null ? Number(row.price) : null,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tải danh sách vật dụng";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category_id, priority, notes, price } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Tên vật dụng không được để trống" },
        { status: 400 }
      );
    }

    const priceValue =
      price !== undefined && price !== "" && price !== null
        ? parseFloat(String(price).replace(/[^0-9.]/g, ""))
        : null;

    const db = await getDb();
    const [result] = await db.execute(
      `INSERT INTO items (name, category_id, priority, notes, price) VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category_id || null,
        priority || "medium",
        notes?.trim() || null,
        isNaN(priceValue as number) ? null : priceValue,
      ]
    );

    const insertId = (result as { insertId: number }).insertId;

    const [rows] = await db.execute(
      `SELECT i.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM items i LEFT JOIN categories c ON i.category_id = c.id
       WHERE i.id = ?`,
      [insertId]
    );

    const raw = (rows as Record<string, unknown>[])[0];
    const item = {
      ...raw,
      is_purchased: false,
      price: raw.price != null ? Number(raw.price) : null,
    };

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Không thể thêm vật dụng" },
      { status: 500 }
    );
  }
}
