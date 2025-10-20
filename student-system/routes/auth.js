import express from "express";
import bcrypt from "bcrypt";
import { db } from "../config/db.js";

const router = express.Router();

// 🔹 تسجيل الدخول
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await db.get("SELECT * FROM users WHERE username = ? AND role = ?", [username, role]);

    if (!user) {
      return res.json({ success: false, message: "❌ اسم المستخدم أو كلمة المرور أو الدور غير صحيحة." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "❌ اسم المستخدم أو كلمة المرور أو الدور غير صحيحة." });
    }

    res.json({
      success: true,
      message: "✅ تم تسجيل الدخول بنجاح",
      role: user.role,
    });
  } catch (err) {
    console.error("🔥 خطأ في تسجيل الدخول:", err);
    res.status(500).json({ success: false, message: "⚠️ حدث خطأ في السيرفر." });
  }
});

export default router;
