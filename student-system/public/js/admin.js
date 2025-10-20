// المتغيرات
const adminMsg = document.getElementById('adminMsg');

// تحميل الأدمنز
async function loadAdmins() {
  const tbody = document.querySelector('#adminsTable tbody');
  tbody.innerHTML = '<tr><td colspan="4" class="muted">جارٍ التحميل...</td></tr>';
  try {
    const res = await fetch('/api/admin/list');
    const data = await res.json();
    if (!data.success || !data.admins?.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="muted">لا يوجد بيانات</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    data.admins.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.id}</td>
                    <td>${a.username}</td>
                    <td>${a.password || '***'}</td>
                    <td>
                      <button class="small-btn edit" onclick="editAdmin(${a.id})">✏️ تعديل</button>
                      <button class="small-btn del" onclick="deleteAdmin(${a.id})">🗑️ حذف</button>
                    </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="4" class="error">حدث خطأ في تحميل البيانات</td></tr>';
    console.error(err);
  }
}

// إضافة أدمن
document.getElementById('addAdminBtn').addEventListener('click', async () => {
  const username = document.getElementById('newAdminUser').value.trim();
  const password = document.getElementById('newAdminPass').value.trim();
  if (!username || !password) { 
    showMsg(adminMsg, 'ادخل اسم المستخدم وكلمة المرور', false); 
    return; 
  }
  try {
    const res = await fetch('/api/admin/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('newAdminUser').value = '';
      document.getElementById('newAdminPass').value = '';
      showMsg(adminMsg, 'تم إضافة الأدمن بنجاح');
      loadAdmins();
    } else {
      showMsg(adminMsg, data.message || 'حدث خطأ أثناء إضافة الأدمن', false);
    }
  } catch (err) {
    showMsg(adminMsg, 'حدث خطأ في الاتصال بالسيرفر', false);
    console.error(err);
  }
});

// حذف أدمن
async function deleteAdmin(id) {
  if (!confirm('هل تريد حذف الأدمن؟')) return;
  try {
    const res = await fetch(`/api/admin/delete/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showMsg(adminMsg, 'تم حذف الأدمن بنجاح');
      loadAdmins();
    } else {
      showMsg(adminMsg, data.message || 'حدث خطأ أثناء حذف الأدمن', false);
    }
  } catch (err) {
    showMsg(adminMsg, 'حدث خطأ في الاتصال بالسيرفر', false);
    console.error(err);
  }
}

// تعديل أدمن
async function editAdmin(id) {
  try {
    const res = await fetch(`/api/admin/get/${id}`);
    const data = await res.json();
    if (!data.success) {
      showMsg(adminMsg, 'لم يتم العثور على الأدمن', false);
      return;
    }
    const admin = data.admin;
    const newUsername = prompt('الاسم الجديد:', admin.username);
    if (newUsername === null) return;
    const newPassword = prompt('كلمة المرور الجديدة:');
    if (newPassword === null) return;

    const updateRes = await fetch(`/api/admin/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername.trim() || admin.username,
        password: newPassword.trim() || admin.password
      })
    });
    const updateData = await updateRes.json();
    if (updateData.success) {
      showMsg(adminMsg, 'تم تحديث بيانات الأدمن بنجاح');
      loadAdmins();
    } else {
      showMsg(adminMsg, updateData.message || 'حدث خطأ أثناء تحديث البيانات', false);
    }
  } catch (err) {
    showMsg(adminMsg, 'حدث خطأ في الاتصال بالسيرفر', false);
    console.error(err);
  }
}