import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// ✅ إضافة كتاب
router.post("/add", async (req, res) => {
  const { title, cover, pdf, uploaded_by } = req.body;

  if (!title || !cover || !pdf)
    return res.status(400).json({ message: "كل الحقول مطلوبة" });

  await db.run(
    "INSERT INTO books (title, cover, pdf, uploaded_by) VALUES (?, ?, ?, ?)",
    [title, cover, pdf, uploaded_by]
  );
  res.json({ message: "📘 تم إضافة الكتاب بنجاح" });
});

// ✅ عرض الكتب
router.get("/list", async (req, res) => {
  const books = await db.all("SELECT * FROM books");
  res.json(books);
});

// ✅ حذف كتاب
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await db.run("DELETE FROM books WHERE id = ?", [id]);
  res.json({ message: "🗑️ تم حذف الكتاب بنجاح" });
});

export default router;
