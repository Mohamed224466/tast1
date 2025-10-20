// المتغيرات
const studentMsg = document.getElementById('studentMsg');

// تحميل الطلاب
async function loadStudents() {
  const tbody = document.querySelector('#studentsTable tbody');
  tbody.innerHTML = '<tr><td colspan="8" class="muted">جارٍ التحميل...</td></tr>';
  
  try {
    const res = await fetch('/api/students/list');
    const data = await res.json();
    
    if (!data.success || !data.students?.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="muted">لا يوجد طلاب مسجلين</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    data.students.forEach((s, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${s.name}</td>
        <td>${s.phone}</td>
        <td>${s.parent_phone}</td>
        <td>${s.grade}</td>
        <td>${s.code}</td>
        <td><button class="small-btn edit" onclick="editStudent(${s.id})">✏️</button></td>
        <td><button class="small-btn del" onclick="deleteStudent(${s.id})">🗑️</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" class="error">حدث خطأ في تحميل البيانات</td></tr>';
    console.error(err);
  }
}

// إضافة طالب
document.getElementById('addStudentBtn').addEventListener('click', async () => {
  const name = document.getElementById('stu_name').value.trim();
  const phone = document.getElementById('stu_phone').value.trim();
  const parent_phone = document.getElementById('stu_parent').value.trim();
  const grade = document.getElementById('stu_grade').value.trim();

  // التحقق من البيانات
  if (!name) { showMsg(studentMsg, 'ادخل اسم الطالب', false); return; }
  if (!phone) { showMsg(studentMsg, 'ادخل هاتف الطالب', false); return; }
  if (!parent_phone) { showMsg(studentMsg, 'ادخل هاتف ولي الأمر', false); return; }
  if (!grade) { showMsg(studentMsg, 'اختر الصف', false); return; }
  
  // التحقق من أرقام الهواتف
  if (!validatePhone(phone)) {
    showMsg(studentMsg, 'رقم هاتف الطالب غير صحيح', false);
    return;
  }
  if (!validatePhone(parent_phone)) {
    showMsg(studentMsg, 'رقم هاتف ولي الأمر غير صحيح', false);
    return;
  }

  try {
    const res = await fetch('/api/students/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, parent_phone, grade })
    });
    const data = await res.json();
    if (data.success) {
      // مسح الحقول
      document.getElementById('stu_name').value = '';
      document.getElementById('stu_phone').value = '';
      document.getElementById('stu_parent').value = '';
      document.getElementById('stu_grade').value = '';
      showMsg(studentMsg, 'تم إضافة الطالب بنجاح');
      loadStudents();
    } else {
      showMsg(studentMsg, data.message || 'حدث خطأ أثناء إضافة الطالب', false);
    }
  } catch (err) {
    showMsg(studentMsg, 'حدث خطأ في الاتصال بالسيرفر', false);
    console.error(err);
  }
});

// تعديل طالب
async function editStudent(id) {
  try {
    // جلب بيانات الطالب الحالية
    const res = await fetch(`/api/students/get/${id}`);
    const data = await res.json();
    
    if (!data.success) {
      showMsg(studentMsg, 'لم يتم العثور على الطالب', false);
      return;
    }

    const student = data.student;
    
    // طلب البيانات الجديدة
    const newName = prompt('الاسم الجديد:', student.name);
    if (newName === null) return;
    
    const newPhone = prompt('هاتف الطالب:', student.phone);
    if (newPhone === null) return;
    if (!validatePhone(newPhone)) { 
      showMsg(studentMsg, 'رقم الهاتف غير صحيح', false); 
      return; 
    }
    
    const newParentPhone = prompt('هاتف ولي الأمر:', student.parent_phone);
    if (newParentPhone === null) return;
    if (!validatePhone(newParentPhone)) { 
      showMsg(studentMsg, 'رقم هاتف ولي الأمر غير صحيح', false); 
      return; 
    }
    
    const newGrade = prompt('الصف الدراسي:', student.grade);
    if (newGrade === null) return;

    // تحديث البيانات
    const updateRes = await fetch(`/api/students/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim() || student.name,
        phone: newPhone.trim(),
        parent_phone: newParentPhone.trim(),
        grade: newGrade.trim() || student.grade
      })
    });

    const updateData = await updateRes.json();
    if (updateData.success) {
      showMsg(studentMsg, 'تم تحديث بيانات الطالب بنجاح');
      loadStudents();
    } else {
      showMsg(studentMsg, updateData.message || 'حدث خطأ أثناء تحديث البيانات', false);
    }
  } catch (err) {
    showMsg(studentMsg, 'حدث خطأ في الاتصال بالسيرفر', false);
    console.error(err);
  }
}

// حذف طالب
async function deleteStudent(id) {
  if (!confirm('هل تريد حذف الطالب؟')) return;
  
  try {
    const res = await fetch(`/api/students/delete/${id}`, {
      method: 'DELETE'
    });
    
    const data = await res.json();
    if (data.success) {
      showMsg(studentMsg, 'تم حذف الطالب بنجاح');
      loadStudents();
    } else {
      showMsg(studentMsg, data.message || 'حدث خطأ أثناء حذف الطالب', false);
    }
  } catch (err) {
    showMsg(studentMsg, 'حدث خطأ في الاتصال بالسيرفر', false);
    console.error(err);
  }
}