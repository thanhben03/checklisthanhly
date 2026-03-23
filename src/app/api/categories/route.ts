import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      "SELECT * FROM categories ORDER BY name ASC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tải danh mục";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
