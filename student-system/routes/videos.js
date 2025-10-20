import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// ✅ إضافة فيديو

// إضافة فيديو مع دعم الصف الدراسي
router.post("/add", async (req, res) => {
  const { title, url, description, grade } = req.body;

  console.log('DEBUG /api/videos/add body:', req.body);

  if (!title || !url || !grade)
    return res.status(400).json({ success: false, message: "كل الحقول مطلوبة" });

  // استخراج id الفيديو من الرابط أو القيمة
  function extractYouTubeId(input) {
    if (!input) return null;
    input = input.trim();
    // اشكال روابط يوتيوب الشائعة مع أو بدون باراميتر
    const patterns = [
      /(?:v=|v\/|embed\/)([\w-]{11})/, // youtube.com/watch?v=ID or /v/ID or /embed/ID
      /(?:youtu\.be\/)([\w-]{11})/, // youtu.be/ID
      /^([\w-]{11})$/ // id فقط
    ];
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  const videoId = extractYouTubeId(url);
  console.log('DEBUG extracted videoId:', videoId);
  if (!videoId)
    return res.status(400).json({ success: false, message: "الرابط أو الكود ليس لفيديو يوتيوب صحيح" });

  try {
    console.log('DEBUG running SQL INSERT INTO videos (title, description, youtube_url, grade) with', title, description || '', videoId, grade);
    await db.run(
      "INSERT INTO videos (title, description, youtube_url, grade) VALUES (?, ?, ?, ?)",
      [title, description || '', videoId, grade]
    );
    res.json({ success: true, message: "🎥 تم إضافة الفيديو بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "حدث خطأ عند حفظ الفيديو" });
  }
});

// ✅ عرض الفيديوهات
router.get("/list", async (req, res) => {
  try {
    // نجلب ونحول حقل youtube_url إلى url ليتوافق مع الواجهة، ونضيف grade
    const videos = await db.all("SELECT id, title, description, youtube_url as url, grade FROM videos ORDER BY id DESC");
    res.json({ success: true, videos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب الفيديوهات' });
  }
});

// ✅ حذف فيديو
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM videos WHERE id = ?", [id]);
    res.json({ success: true, message: "🗑️ تم حذف الفيديو بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف الفيديو' });
  }
});

export default router;
