document.addEventListener("DOMContentLoaded", () => {
  fetch("button.html")
    .then(res => res.text())
    .then(data => {
      document.body.insertAdjacentHTML("beforeend", data);
      const btn = document.getElementById('btn');
      const STORAGE_KEY = 'draggableBtnPos_v1';
      let dragging = false, wasDragged = false;
      let offsetX = 0, offsetY = 0, startX = 0, startY = 0, endX = 0, endY = 0;
      const DRAG_THRESHOLD = 2;
      let firstLoad = true;

      // خصائص الزر الأساسية
      btn.style.position = 'fixed';
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1)';
      btn.style.transition = 'transform 0.12s ease, opacity 0.1s ease';

      // المكان الافتراضي أسفل يمين
      btn.style.right = '20px';
      btn.style.bottom = '20px';
      btn.style.left = 'auto';
      btn.style.top = 'auto';

      // محاولة استرجاع المكان إذا سبق التخزين
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { leftPercent, topPercent } = JSON.parse(raw);
        if (leftPercent != null && topPercent != null) {
          btn.style.left = (leftPercent / 100 * window.innerWidth) + 'px';
          btn.style.top  = (topPercent / 100 * window.innerHeight) + 'px';
          btn.style.right = 'auto';
          btn.style.bottom = 'auto';
          firstLoad = false;
        }
      }

      function savePosition(left, top) {
        const leftPercent = (parseFloat(left) / window.innerWidth) * 100;
        const topPercent  = (parseFloat(top)  / window.innerHeight) * 100;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ leftPercent, topPercent }));
      }

      function setPosition(left, top) {
        const rect = btn.getBoundingClientRect();
        const minL = 0, minT = 0;
        const maxL = window.innerWidth - rect.width;
        const maxT = window.innerHeight - rect.height;
        btn.style.left = Math.min(maxL, Math.max(minL, left)) + 'px';
        btn.style.top  = Math.min(maxT, Math.max(minT, top)) + 'px';
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
      }

      function onPointerDown(e) {
        dragging = true;
        wasDragged = false;
        btn.setPointerCapture(e.pointerId);
        const rect = btn.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        startX = e.clientX;
        startY = e.clientY;
        btn.classList.add('dragging');
      }

      function onPointerMove(e) {
        if (!dragging) return;
        const left = e.clientX - offsetX;
        const top  = e.clientY - offsetY;
        setPosition(left, top);
        endX = e.clientX;
        endY = e.clientY;
      }

      function onPointerUp(e) {
        if (!dragging) return;
        dragging = false;
        btn.classList.remove('dragging');
        try { btn.releasePointerCapture(e.pointerId); } catch(_) {}
        if (Math.abs(endX - startX) > DRAG_THRESHOLD || Math.abs(endY - startY) > DRAG_THRESHOLD) {
          wasDragged = true;
        }
        if (wasDragged || firstLoad) {
          savePosition(btn.style.left, btn.style.top);
          firstLoad = false;
        }
      }

      btn.addEventListener("click", e => {
        if (wasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      });

      btn.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);

      window.addEventListener('resize', () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const { leftPercent, topPercent } = JSON.parse(raw);
          if (leftPercent != null && topPercent != null) {
            btn.style.left = (leftPercent / 100 * window.innerWidth) + 'px';
            btn.style.top  = (topPercent / 100 * window.innerHeight) + 'px';
            btn.style.right = 'auto';
            btn.style.bottom = 'auto';
          }
        }
      });

    })
    .catch(err => console.error("Error loading button:", err));
});