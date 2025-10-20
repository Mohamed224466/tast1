// التعامل مع الفيديوهات
const videoMsg = document.getElementById('videoMsg');

// تحميل الفيديوهات من السيرفر
async function loadVideos() {
    const tbody = document.querySelector('#videosTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="muted">جارٍ التحميل...</td></tr>';
    
    try {
        const res = await fetch('/api/videos/list');
        const data = await res.json();
        
        if (!data.success || !data.videos?.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="muted">لا يوجد فيديوهات مضافة</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.videos.forEach(v => {
            const tr = document.createElement('tr');
            // v.url مخزن كـ id الفيديو
            const embedUrl = `https://www.youtube.com/embed/${v.url}`;
            const watchUrl = `https://www.youtube.com/watch?v=${v.url}`;
            tr.innerHTML = `
                <td><iframe width="120" height="70" src="${embedUrl}" frameborder="0" allowfullscreen></iframe></td>
                <td>${v.title}</td>
                <td><a href="${watchUrl}" target="_blank">${watchUrl}</a></td>
                <td>${v.grade ? v.grade : ''}</td>
                <td><button class="small-btn del" onclick="deleteVideo(${v.id})">🗑️ حذف</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="error">حدث خطأ في تحميل البيانات</td></tr>';
        console.error(err);
    }
}

// استخراج id من رابط يوتيوب أو قبول id مباشر
function extractYouTubeId(input) {
    if (!input) return null;
    input = input.trim().replace(/\s+/g, '');

    const patterns = [
        /[?&]v=([\w-]{11})/,            // youtube.com/watch?v=ID
        /youtu\.be\/([\w-]{11})/,    // youtu.be/ID
        /embed\/([\w-]{11})/,         // youtube.com/embed/ID
        /^([\w-]{11})$/                // id فقط
    ];

    for (const p of patterns) {
        const m = input.match(p);
        if (m) return m[1];
    }
    return null;
}

// إضافة فيديو جديد
document.getElementById('addVideoBtn').addEventListener('click', async () => {
    const title = document.getElementById('video_title').value.trim();
    const rawUrl = document.getElementById('video_url').value;
    const url = rawUrl ? rawUrl.trim() : '';
    const grade = document.getElementById('grade') ? document.getElementById('grade').value : '';

    if (!title) { 
        showMsg(videoMsg, 'ادخل عنوان الفيديو', false); 
        return; 
    }
    if (!url) { 
        showMsg(videoMsg, 'ادخل رابط الفيديو', false); 
        return; 
    }
    if (!grade) {
        showMsg(videoMsg, 'اختر الصف الدراسي', false);
        return;
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
        showMsg(videoMsg, 'الرجاء إدخال رابط يوتيوب صحيح', false);
        return;
    }

    try {
        const res = await fetch('/api/videos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, url: videoId, grade })
        });

        const data = await res.json();
        if (data.success) {
            document.getElementById('video_title').value = '';
            document.getElementById('video_url').value = '';
            if (document.getElementById('grade')) document.getElementById('grade').value = '';
            showMsg(videoMsg, 'تم إضافة الفيديو بنجاح');
            loadVideos();
        } else {
            showMsg(videoMsg, data.message || 'حدث خطأ أثناء إضافة الفيديو', false);
        }
    } catch (err) {
        showMsg(videoMsg, 'حدث خطأ في الاتصال بالسيرفر', false);
        console.error(err);
    }
});

// حذف فيديو
async function deleteVideo(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;
    
    try {
        const res = await fetch(`/api/videos/delete/${id}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();
        if (data.success) {
            showMsg(videoMsg, 'تم حذف الفيديو بنجاح');
            loadVideos();
        } else {
            showMsg(videoMsg, data.message || 'حدث خطأ أثناء حذف الفيديو', false);
        }
    } catch (err) {
        showMsg(videoMsg, 'حدث خطأ في الاتصال بالسيرفر', false);
        console.error(err);
    }
}

// Note: loadVideos() is triggered from main.js after DOMContentLoaded