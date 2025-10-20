import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ استيراد الملفات (routes)
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import booksRoutes from "./routes/books.js";
import videosRoutes from "./routes/videos.js";
import adminRoutes from "./routes/admin.js";
import { db } from "./config/db.js";

const app = express();
const PORT = 5000;

// 🧩 إعدادات أساسية
app.use(cors({
  origin: '*', // في الإنتاج، يجب تحديد domain الموقع الرئيسي فقط
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 تحديد المسار العام للمجلد الحالي
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📂 ربط ملفات الواجهة (HTML + CSS + JS)
// serve public (js/css/img) first so assets under /js and /css resolve
// simple request logger for debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});
// serve specific asset folders explicitly (helps with path resolution)
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
// fallback to serve the rest of public and views
app.use(express.static(path.join(__dirname, 'public')));
// also allow serving raw HTML files from views
app.use(express.static(path.join(__dirname, 'views')));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // للصور و PDF

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

// DEBUG: direct serve of main.js to verify file access
import fs from 'fs';

app.get('/_debug_main_js', (req, res) => {
  const p = path.join(__dirname, 'public', 'js', 'main.js');
  console.log('DEBUG: resolved main.js path =', p);
  console.log('DEBUG: exists?', fs.existsSync(p));
  if (fs.existsSync(p)) return res.sendFile(p);
  res.status(500).send('main.js not found on server');
});

// ✅ ربط المسارات (Routes)
app.use("/api/auth", authRoutes);          // تسجيل الدخول
app.use("/api/students", studentRoutes);   // إدارة الطلاب
app.use("/api/books", booksRoutes);        // رفع الكتب
app.use("/api/videos", videosRoutes);      // رفع الفيديوهات
app.use("/api/admin", adminRoutes);

// ✅ المسار الرئيسي
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// ✅ تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على: http://localhost:${PORT}`);
});
