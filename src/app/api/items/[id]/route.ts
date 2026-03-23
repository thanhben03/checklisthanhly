import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();
    const db = await getDb();

    // Toggle purchased only
    if (body.toggle_purchased !== undefined) {
      const isPurchased = body.toggle_purchased ? 1 : 0;
      const purchasedAt = body.toggle_purchased ? new Date() : null;
      await db.execute(
        `UPDATE items SET is_purchased = ?, purchased_at = ? WHERE id = ?`,
        [isPurchased, purchasedAt, id]
      );
    } else {
      // Full update
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
      await db.execute(
        `UPDATE items SET name = ?, category_id = ?, priority = ?, notes = ?, price = ? WHERE id = ?`,
        [
          name.trim(),
          category_id || null,
          priority || "medium",
          notes?.trim() || null,
          isNaN(priceValue as number) ? null : priceValue,
          id,
        ]
      );
    }

    const [rows] = await db.execute(
      `SELECT i.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM items i LEFT JOIN categories c ON i.category_id = c.id
       WHERE i.id = ?`,
      [id]
    );

    if ((rows as unknown[]).length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy vật dụng" },
        { status: 404 }
      );
    }

    const raw = (rows as Record<string, unknown>[])[0];
    const item = {
      ...raw,
      is_purchased: raw.is_purchased === 1,
      price: raw.price != null ? Number(raw.price) : null,
    };

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật vật dụng" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const db = await getDb();
    const [result] = await db.execute(`DELETE FROM items WHERE id = ?`, [id]);
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy vật dụng" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Không thể xóa vật dụng" },
      { status: 500 }
    );
  }
}
