import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { db } from "../config/db.js";
import { verifyToken } from "../utils/auth.js";
import { generateCode } from "../utils/generateCode.js";

const router = express.Router();

// 📁 إعداد رفع ملفات الكتب
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 🔹 إضافة مطور أو أدمن جديد
router.post("/create-user", verifyToken, async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role)
    return res.status(400).json({ message: "جميع الحقول مطلوبة" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
      username,
      hashed,
      role,
    ]);
    res.json({ message: "✅ تم إنشاء الحساب بنجاح" });
  } catch (err) {
    console.error("❌ خطأ أثناء إنشاء المستخدم:", err);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء المستخدم" });
  }
});

// 🔹 عرض كل المستخدمين (Admins & Developers)
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await db.all("SELECT id, username, role FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب المستخدمين" });
  }
});

// 🔹 تعديل بيانات المستخدم
router.put("/users/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  try {
    const hashed = password ? await bcrypt.hash(password, 10) : null;
    const query = hashed
      ? "UPDATE users SET username=?, password=?, role=? WHERE id=?"
      : "UPDATE users SET username=?, role=? WHERE id=?";
    const params = hashed ? [username, hashed, role, id] : [username, role, id];

    await db.run(query, params);
    res.json({ message: "✅ تم تحديث بيانات المستخدم بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء التحديث" });
  }
});

// 🔹 حذف مستخدم
router.delete("/users/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM users WHERE id=?", [id]);
    res.json({ message: "🗑️ تم حذف المستخدم بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
  }
});

// 🔹 إضافة طالب جديد
router.post("/students", verifyToken, async (req, res) => {
  const { name, phone, parent_phone, grade } = req.body;
  if (!name || !phone || !parent_phone || !grade)
    return res.status(400).json({ message: "كل الحقول مطلوبة" });

  const code = generateCode(11); // 11 رقم للكود
  try {
    await db.run(
      "INSERT INTO students (name, phone, parent_phone, grade, code) VALUES (?, ?, ?, ?, ?)",
      [name, phone, parent_phone, grade, code]
    );
    res.json({ message: "✅ تم تسجيل الطالب بنجاح", code });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء التسجيل" });
  }
});

// 🔹 عرض كل الطلاب
router.get("/students", verifyToken, async (req, res) => {
  try {
    const students = await db.all("SELECT * FROM students");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
  }
});

// 🔹 تعديل بيانات طالب
router.put("/students/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, phone, parent_phone, grade } = req.body;

  try {
    await db.run(
      "UPDATE students SET name=?, phone=?, parent_phone=?, grade=? WHERE id=?",
      [name, phone, parent_phone, grade, id]
    );
    res.json({ message: "✅ تم تحديث بيانات الطالب بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء التحديث" });
  }
});

// 🔹 حذف طالب
router.delete("/students/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM students WHERE id=?", [id]);
    res.json({ message: "🗑️ تم حذف الطالب بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
  }
});

// 🔹 إضافة كتاب جديد (PDF + صورة)
router.post("/books", verifyToken, upload.fields([{ name: "pdf" }, { name: "cover" }]), async (req, res) => {
  const { title } = req.body;
  const pdf = req.files["pdf"]?.[0]?.filename;
  const cover = req.files["cover"]?.[0]?.filename;

  if (!title || !pdf || !cover)
    return res.status(400).json({ message: "كل الحقول مطلوبة" });

  try {
    await db.run("INSERT INTO books (title, pdf, cover) VALUES (?, ?, ?)", [title, pdf, cover]);
    res.json({ message: "📚 تم إضافة الكتاب بنجاح" });
  } catch (err) {
    console.error("خطأ أثناء إضافة الكتاب:", err);
    res.status(500).json({ message: "حدث خطأ أثناء إضافة الكتاب" });
  }
});

// 🔹 عرض كل الكتب
router.get("/books", verifyToken, async (req, res) => {
  try {
    const books = await db.all("SELECT * FROM books");
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب الكتب" });
  }
});

// 🔹 إضافة فيديو جديد
router.post("/videos", verifyToken, async (req, res) => {
  const { link, description } = req.body;
  if (!link || !description)
    return res.status(400).json({ message: "كل الحقول مطلوبة" });

  try {
    await db.run("INSERT INTO videos (link, description) VALUES (?, ?)", [link, description]);
    res.json({ message: "🎥 تم إضافة الفيديو بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء إضافة الفيديو" });
  }
});

// 🔹 عرض كل الفيديوهات
router.get("/videos", verifyToken, async (req, res) => {
  try {
    const videos = await db.all("SELECT * FROM videos");
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب الفيديوهات" });
  }
});

export default router;
