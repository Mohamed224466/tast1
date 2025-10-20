import express from "express";
import cors from "cors";
import { db } from "../config/db.js"; // لو قاعدة بياناتك في config
import authRoutes from "../routes/auth.js";
import adminRoutes from "../routes/admin.js";
import studentRoutes from "../routes/students.js";
import bookRoutes from "../routes/books.js";
import videoRoutes from "../routes/videos.js";

const app = express();

app.use(cors());
app.use(express.json());

// ربط المسارات
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/videos", videoRoutes);

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("✅ Server is running successfully on Vercel!");
});

// ✅ لا تستخدم app.listen() هنا
export default app;
