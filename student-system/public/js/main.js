// المساعدة
function showMsg(el, text, ok = true) {
  el.textContent = text;
  el.classList.toggle('success', ok);
  el.classList.toggle('error', !ok);
  setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, 4000);
}

// التحقق من أرقام الهواتف
function validatePhone(phone) {
  return /^01[0125][0-9]{8}$/.test(phone);
}

// تسجيل الخروج
function logout() {
  localStorage.clear(); 
  window.location.href = 'login.html';
}

// تحميل السكريبتات
document.addEventListener('DOMContentLoaded', () => {
  // تبويبات
  document.querySelectorAll('.sidebar button[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar button[data-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // تحميل البيانات
  const safeCall = (fn, name) => {
    try {
      if (typeof fn === 'function') fn();
      else console.warn(`${name} not available`);
    } catch (e) {
      console.error(`Error calling ${name}:`, e);
    }
  };

  safeCall(window.loadAdmins, 'loadAdmins');
  safeCall(window.loadStudents, 'loadStudents');
  safeCall(window.loadBooks, 'loadBooks');
  safeCall(window.loadVideos, 'loadVideos');

  // Open student-details page from admin or developer panels
  const openDetails = () => window.open('/student-details.html', '_blank');
  const btnAdmin = document.getElementById('openStudentDetailsFromAdmin');
  if (btnAdmin) btnAdmin.addEventListener('click', openDetails);
  const btnDev = document.getElementById('openStudentDetailsFromDev');
  if (btnDev) btnDev.addEventListener('click', openDetails);
});
