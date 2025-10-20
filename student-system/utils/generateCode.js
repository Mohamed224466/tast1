export function generateStudentCode() {
  const chars = "0123456789";
  let code = "";
  for (let i = 0; i < 11; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
