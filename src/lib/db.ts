import mysql from "mysql2/promise";

const DB_NAME = process.env.DB_NAME || "checklisthanhly";

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var _dbInitialized: boolean | undefined;
}

let initPromise: Promise<void> | null = null;

async function _initialize(): Promise<void> {
  // Try to create the database (requires SUPER or CREATE privileges)
  // If the user doesn't have permission, skip — the DB must already exist
  try {
    const tempConn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });
    try {
      await tempConn.execute(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
    } finally {
      await tempConn.end();
    }
  } catch (err: unknown) {
    const mysqlErr = err as { code?: string };
    if (
      mysqlErr.code === "ER_DBACCESS_DENIED_ERROR" ||
      mysqlErr.code === "ER_ACCESS_DENIED_ERROR"
    ) {
      // User doesn't have CREATE DATABASE privilege — assume DB already exists
      console.warn(
        `[db] Warning: Cannot create database automatically (insufficient privileges). ` +
          `Please create the database manually: CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
    } else {
      throw err;
    }
  }

  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      charset: "utf8mb4",
    });
  }

  let conn: mysql.PoolConnection;
  try {
    conn = await global._mysqlPool.getConnection();
  } catch (err: unknown) {
    const mysqlErr = err as { code?: string };
    if (mysqlErr.code === "ER_BAD_DB_ERROR") {
      throw new Error(
        `Database '${DB_NAME}' chưa tồn tại.\n` +
          `Vui lòng chạy lệnh sau trên MySQL server với tài khoản admin:\n\n` +
          `  CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n` +
          `  GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${process.env.DB_USER || "appuser"}'@'%';\n` +
          `  FLUSH PRIVILEGES;\n\n` +
          `Hoặc chạy file setup.sql đi kèm trong thư mục dự án.`
      );
    }
    throw err;
  }
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20) NOT NULL DEFAULT '#6B7280',
        icon VARCHAR(10) NOT NULL DEFAULT '📦',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        name VARCHAR(255) NOT NULL,
        notes TEXT,
        price DECIMAL(15,0) NULL,
        priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
        is_purchased TINYINT(1) NOT NULL DEFAULT 0,
        purchased_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Migration: add price column if table already existed without it
    const [cols] = await conn.execute(`
      SELECT COUNT(*) as cnt FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'items' AND COLUMN_NAME = 'price'
    `);
    if ((cols as { cnt: number }[])[0].cnt === 0) {
      await conn.execute(`ALTER TABLE items ADD COLUMN price DECIMAL(15,0) NULL AFTER notes`);
    }

    const [rows] = await conn.execute(
      "SELECT COUNT(*) as count FROM categories"
    );
    const count = (rows as { count: number }[])[0].count;

    if (count === 0) {
      await conn.execute(`
        INSERT INTO categories (name, color, icon) VALUES
        ('Giấy tờ', '#3B82F6', '📄'),
        ('Quần áo', '#8B5CF6', '👕'),
        ('Y tế & Sức khỏe', '#EF4444', '💊'),
        ('Điện tử', '#6B7280', '💻'),
        ('Vệ sinh cá nhân', '#10B981', '🧴'),
        ('Tài chính', '#F59E0B', '💰'),
        ('Đồ dùng cá nhân', '#F97316', '🎒'),
        ('Thực phẩm', '#78350F', '🍜')
      `);
    }

    global._dbInitialized = true;
  } finally {
    conn.release();
  }
}

export async function getDb(): Promise<mysql.Pool> {
  if (!global._dbInitialized) {
    if (!initPromise) {
      initPromise = _initialize().catch((err) => {
        initPromise = null;
        global._dbInitialized = false;
        throw err;
      });
    }
    await initPromise;
  }

  if (!global._mysqlPool) {
    throw new Error("Database pool was not initialized");
  }

  return global._mysqlPool;
}
