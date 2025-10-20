import jwt from "jsonwebtoken";

const SECRET_KEY = "your-secret-key"; // نفس المفتاح اللي في auth.js

// ✅ ميدل وير للتحقق من التوكن
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "لم يتم توفير التوكن" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // حفظ بيانات المستخدم في الطلب
    next();
  } catch (err) {
    return res.status(403).json({ message: "توكن غير صالح أو منتهي" });
  }
}

// ✅ ميدل وير للتحقق من صلاحيات المطور فقط
export function verifyDeveloper(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== "developer") {
      return res.status(403).json({ message: "غير مصرح لك بالوصول إلى هذا المورد" });
    }
    next();
  });
}
