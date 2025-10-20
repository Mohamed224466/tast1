import express from "express";
import bcrypt from "bcrypt";
import { db } from "../config/db.js";

const router = express.Router();

// ✅ إضافة أدمن جديد
router.post("/add", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ success: false, message: "كل الحقول مطلوبة" });

  try {
    // فحص هل الاسم موجود
    const existing = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (existing)
      return res.json({ success: false, message: "⚠️ هذا الاسم مستخدم بالفعل" });

    const hashed = await bcrypt.hash(password, 10);
    await db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashed, "admin"]
    );

    res.json({ success: true, message: "✅ تم إضافة الأدمن بنجاح" });
  } catch (err) {
    console.error("🔥 خطأ أثناء إضافة الأدمن:", err);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء إضافة الأدمن" });
  }
});

// ✅ عرض كل الأدمنز
router.get("/list", async (req, res) => {
  try {
    const admins = await db.all("SELECT id, username, role FROM users WHERE role = 'admin'");
    res.json({ success: true, admins });
  } catch (err) {
    console.error("🔥 خطأ أثناء جلب الأدمنز:", err);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب البيانات" });
  }
});

// ✅ حذف أدمن
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.run("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "🗑️ تم حذف الأدمن بنجاح" });
  } catch (err) {
    console.error("🔥 خطأ أثناء حذف الأدمن:", err);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء الحذف" });
  }
});

export default router;
