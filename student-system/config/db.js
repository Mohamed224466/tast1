import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

// ✅ فتح قاعدة البيانات
const db = await open({
  filename: "./database.sqlite",
  driver: sqlite3.Database,
});

// ✅ إنشاء الجداول (لو مش موجودة)
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    parent_phone TEXT,
    grade TEXT,
    code TEXT
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    cover TEXT,
    pdf TEXT
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    youtube_url TEXT
  );
`);


// ✅ إضافة أول مطور تلقائيًا لو مش موجود
const existingDev = await db.get("SELECT * FROM users WHERE username = ?", ["developer"]);
if (!existingDev) {
  const hashedPassword = await bcrypt.hash("123456", 10);
  await db.run(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    ["developer", hashedPassword, "developer"]
  );
  console.log("✅ تم إنشاء حساب المطور الافتراضي: developer / 123456");
}

// ✅ تصدير قاعدة البيانات
export { db };
