import express from "express";
import { db } from "../config/db.js";
import { generateStudentCode } from "../utils/generateCode.js";

const router = express.Router();

// ✅ إضافة طالب جديد
router.post("/add", async (req, res) => {
  try {
    const { name, phone, parent_phone, grade } = req.body;

    if (!name || !phone || !parent_phone || !grade) {
      return res.status(400).json({ success: false, message: "كل الحقول مطلوبة" });
    }

    // generate unique 11-digit code (retry if collision) - safety cap to avoid infinite loop
    let code;
    const MAX_ATTEMPTS = 10;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      code = generateStudentCode();
      const existing = await db.get("SELECT id FROM students WHERE code = ?", [code]);
      if (!existing) break;
      code = null; // collision, try again
    }
    if (!code) return res.status(500).json({ success: false, message: 'تعذر توليد كود فريد للطالب، حاول مرة أخرى' });

    await db.run(
      "INSERT INTO students (name, phone, parent_phone, grade, code) VALUES (?, ?, ?, ?, ?)",
      [name, phone, parent_phone, grade, code]
    );

    res.json({ success: true, message: "✅ تم تسجيل الطالب بنجاح", code });
  } catch (err) {
    console.error("🔥 خطأ عند تسجيل الطالب:", err);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء تسجيل الطالب" });
  }
});

// ✅ عرض جميع الطلاب
router.get("/list", async (req, res) => {
  try {
    const students = await db.all("SELECT * FROM students");
    res.json({ success: true, students });
  } catch (err) {
    console.error("🔥 خطأ عند جلب الطلاب:", err);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب البيانات" });
  }
});

// ✅ تعديل بيانات طالب
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, parent_phone, grade } = req.body;
  await db.run(
    "UPDATE students SET name=?, phone=?, parent_phone=?, grade=? WHERE id=?",
    [name, phone, parent_phone, grade, id]
  );
  res.json({ success: true, message: "✏️ تم تحديث بيانات الطالب" });
});

// ✅ حذف طالب
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await db.run("DELETE FROM students WHERE id = ?", [id]);
  res.json({ success: true, message: "🗑️ تم حذف الطالب بنجاح" });
});

export default router;
