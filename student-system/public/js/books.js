// التعامل مع الكتب
const bookMsg = document.getElementById('bookMsg');

// تحميل الكتب من السيرفر
async function loadBooks() {
    const tbody = document.querySelector('#booksTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="muted">جارٍ التحميل...</td></tr>';
    
    try {
        const res = await fetch('/api/books/list');
        const data = await res.json();
        
        if (!data.success || !data.books?.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="muted">لا يوجد كتب مضافة</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        data.books.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${b.cover}" class="thumb" alt="${b.title}"></td>
                <td>${b.title}</td>
                <td>${b.desc}</td>
                <td><a href="${b.pdf}" target="_blank" class="btn">تحميل PDF</a></td>
                <td><button class="small-btn del" onclick="deleteBook(${b.id})">🗑️ حذف</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="error">حدث خطأ في تحميل البيانات</td></tr>';
        console.error(err);
    }
}

// التحقق من نوع وحجم الملف
function validateFile(file, type) {
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
        showMsg(bookMsg, `حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت`, false);
        return false;
    }
    
    if (type === 'image' && !file.type.startsWith('image/')) {
        showMsg(bookMsg, 'الرجاء اختيار ملف صورة صالح', false);
        return false;
    }
    
    if (type === 'pdf' && file.type !== 'application/pdf') {
        showMsg(bookMsg, 'الرجاء اختيار ملف PDF صالح', false);
        return false;
    }
    
    return true;
}

// رفع كتاب جديد
document.getElementById('uploadBookBtn').addEventListener('click', async () => {
    const title = document.getElementById('book_title').value.trim();
    const desc = document.getElementById('book_desc').value.trim();
    const coverFile = document.getElementById('book_cover').files[0];
    const pdfFile = document.getElementById('book_pdf').files[0];

    // التحقق من المدخلات
    if (!title) { showMsg(bookMsg, 'ادخل عنوان الكتاب', false); return; }
    if (!desc) { showMsg(bookMsg, 'ادخل وصف الكتاب', false); return; }
    if (!coverFile) { showMsg(bookMsg, 'اختر صورة الغلاف', false); return; }
    if (!pdfFile) { showMsg(bookMsg, 'اختر ملف PDF', false); return; }
    
    if (!validateFile(coverFile, 'image')) return;
    if (!validateFile(pdfFile, 'pdf')) return;

    // تجهيز البيانات للإرسال
    const formData = new FormData();
    formData.append('title', title);
    formData.append('desc', desc);
    formData.append('cover', coverFile);
    formData.append('pdf', pdfFile);

    try {
        const res = await fetch('/api/books/add', {
            method: 'POST',
            body: formData // إرسال الملفات باستخدام FormData
        });

        const data = await res.json();
        if (data.success) {
            // مسح الحقول بعد النجاح
            document.getElementById('book_title').value = '';
            document.getElementById('book_desc').value = '';
            document.getElementById('book_cover').value = '';
            document.getElementById('book_pdf').value = '';
            
            showMsg(bookMsg, 'تم رفع الكتاب بنجاح');
            loadBooks();
        } else {
            showMsg(bookMsg, data.message || 'حدث خطأ أثناء رفع الكتاب', false);
        }
    } catch (err) {
        showMsg(bookMsg, 'حدث خطأ في الاتصال بالسيرفر', false);
        console.error(err);
    }
});

// حذف كتاب
async function deleteBook(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    
    try {
        const res = await fetch(`/api/books/delete/${id}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();
        if (data.success) {
            showMsg(bookMsg, 'تم حذف الكتاب بنجاح');
            loadBooks();
        } else {
            showMsg(bookMsg, data.message || 'حدث خطأ أثناء حذف الكتاب', false);
        }
    } catch (err) {
        showMsg(bookMsg, 'حدث خطأ في الاتصال بالسيرفر', false);
        console.error(err);
    }
}

// Note: loadBooks() is triggered from main.js after DOMContentLoaded