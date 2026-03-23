-- ========================================================
-- Chạy script này một lần duy nhất trên MySQL server
-- với tài khoản có quyền ADMIN (root hoặc superuser)
-- ========================================================

-- 1. Tạo database
CREATE DATABASE IF NOT EXISTS `checklisthanhly`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Cấp quyền cho user ứng dụng (thay 'appuser'@'%' nếu cần)
GRANT ALL PRIVILEGES ON `checklisthanhly`.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

-- 3. Kiểm tra
SHOW GRANTS FOR 'appuser'@'%';
