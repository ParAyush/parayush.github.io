document.addEventListener('DOMContentLoaded', () => {
  const ieWindow = document.getElementById('ie-window');
  const titleBar = ieWindow.querySelector('.window-titlebar');
  const resizeHandle = ieWindow.querySelector('.resize-handle');
  const minimizeBtn = ieWindow.querySelector('.minimize-btn');
  const maximizeBtn = ieWindow.querySelector('.maximize-btn');
  const closeBtn = ieWindow.querySelector('.close-btn');
  const iframe = ieWindow.querySelector('.window-content');
  const winTitleText = document.getElementById('window-title-text');
  const winIcon = document.getElementById('window-icon');

  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');

  const APPS = {
    about:    { url: 'about.html',    title: 'About Me',        icon: 'about.webp' },
    work:     { url: 'work.html',     title: 'Work Experience', icon: 'proj.webp' },
    projects: { url: 'projects.html', title: 'Projects',        icon: 'work.png' },
    contact:  { url: 'contact.html',  title: 'Contact Me',      icon: 'linkedin.png' },
  };

  let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
  let isResizing = false;
  let isMaximized = false;
  let normalGeo = { top: 80, left: 120, width: 800, height: 600 };

  function applyGeo(g) {
    ieWindow.style.top = g.top + 'px';
    ieWindow.style.left = g.left + 'px';
    ieWindow.style.width = g.width + 'px';
    ieWindow.style.height = g.height + 'px';
  }

  function readGeo() {
    return {
      top: ieWindow.offsetTop,
      left: ieWindow.offsetLeft,
      width: ieWindow.offsetWidth,
      height: ieWindow.offsetHeight,
    };
  }

  function maximizeWindow() {
    normalGeo = readGeo();
    ieWindow.style.top = '0px';
    ieWindow.style.left = '0px';
    ieWindow.style.width = window.innerWidth + 'px';
    ieWindow.style.height = (window.innerHeight - 48) + 'px';
    isMaximized = true;
    ieWindow.classList.add('maximized');
    maximizeBtn.innerHTML = '&#10064;';
    maximizeBtn.title = 'Restore';
  }

  function restoreWindow() {
    applyGeo(normalGeo);
    isMaximized = false;
    ieWindow.classList.remove('maximized');
    maximizeBtn.innerHTML = '&#9633;';
    maximizeBtn.title = 'Maximize';
  }

  function toggleMaximize() {
    if (isMaximized) restoreWindow();
    else maximizeWindow();
  }

  titleBar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.window-controls button')) return;
    if (isMaximized) return;
    isDragging = true;
    dragOffsetX = e.clientX - ieWindow.offsetLeft;
    dragOffsetY = e.clientY - ieWindow.offsetTop;
    titleBar.classList.add('dragging');
    titleBar.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  titleBar.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    let newLeft = e.clientX - dragOffsetX;
    let newTop = e.clientY - dragOffsetY;
    newLeft = Math.min(Math.max(newLeft, 0), window.innerWidth - ieWindow.offsetWidth);
    newTop = Math.min(Math.max(newTop, 0), window.innerHeight - ieWindow.offsetHeight);
    ieWindow.style.left = newLeft + 'px';
    ieWindow.style.top = newTop + 'px';
  });

  titleBar.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    normalGeo = readGeo();
    titleBar.classList.remove('dragging');
    titleBar.releasePointerCapture(e.pointerId);
  });

  titleBar.addEventListener('lostpointercapture', () => {
    isDragging = false;
    titleBar.classList.remove('dragging');
  });

  titleBar.addEventListener('dblclick', (e) => {
    if (e.target.closest('.window-controls button')) return;
    toggleMaximize();
  });

  resizeHandle.addEventListener('pointerdown', (e) => {
    if (isMaximized) return;
    isResizing = true;
    resizeHandle.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  resizeHandle.addEventListener('pointermove', (e) => {
    if (!isResizing) return;
    const rect = ieWindow.getBoundingClientRect();
    let newWidth = Math.min(Math.max(e.clientX - rect.left, 300), window.innerWidth - rect.left);
    let newHeight = Math.min(Math.max(e.clientY - rect.top, 200), window.innerHeight - rect.top);
    ieWindow.style.width = newWidth + 'px';
    ieWindow.style.height = newHeight + 'px';
  });

  resizeHandle.addEventListener('pointerup', (e) => {
    if (!isResizing) return;
    isResizing = false;
    normalGeo = readGeo();
    resizeHandle.releasePointerCapture(e.pointerId);
    document.body.style.userSelect = 'auto';
  });

  resizeHandle.addEventListener('lostpointercapture', () => {
    if (isResizing) { isResizing = false; document.body.style.userSelect = 'auto'; }
  });

  function openApp(appName) {
    const app = APPS[appName];
    if (!app) return;

    document.querySelectorAll('.taskbar-app').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.app === appName);
    });
    document.querySelectorAll('.start-item').forEach(item => {
      item.classList.toggle('active', item.dataset.app === appName);
    });

    winTitleText.textContent = app.title;
    winIcon.src = app.icon;
    iframe.src = app.url;

    ieWindow.classList.remove('hidden');
    iframe.style.display = 'block';

    if (!isMaximized) applyGeo(normalGeo);

    const ti = document.getElementById('taskbar-ie-icon');
    if (ti) ti.remove();

    ieWindow.classList.remove('closing', 'minimizing', 'opening');
    void ieWindow.offsetWidth;
    ieWindow.classList.add('opening');

    startMenu.classList.remove('show');
  }

  minimizeBtn.addEventListener('click', () => {
    if (ieWindow.classList.contains('hidden')) return;
    if (!isMaximized) normalGeo = readGeo();
    ieWindow.classList.remove('opening');
    ieWindow.classList.add('minimizing');
    setTimeout(() => {
      ieWindow.classList.add('hidden');
      ieWindow.classList.remove('minimizing');
      iframe.style.display = 'none';
    }, 200);

    if (!document.getElementById('taskbar-ie-icon')) {
      const taskbar = document.querySelector('.taskbar-apps');
      const icon = document.createElement('button');
      icon.id = 'taskbar-ie-icon';
      icon.className = 'taskbar-app active';
      icon.innerHTML = '<img src="' + winIcon.src + '" alt=""><span class="taskbar-label">' + winTitleText.textContent + '</span>';
      icon.addEventListener('click', () => {
        ieWindow.classList.remove('hidden');
        iframe.style.display = 'block';
        if (!isMaximized) applyGeo(normalGeo);
        ieWindow.classList.remove('closing', 'minimizing');
        void ieWindow.offsetWidth;
        ieWindow.classList.add('opening');
        icon.remove();
      });
      taskbar.appendChild(icon);
    }
  });

  maximizeBtn.addEventListener('click', toggleMaximize);

  closeBtn.addEventListener('click', () => {
    ieWindow.classList.remove('opening');
    ieWindow.classList.add('closing');
    setTimeout(() => {
      ieWindow.classList.add('hidden');
      ieWindow.classList.remove('closing');
      iframe.removeAttribute('src');
      if (isMaximized) restoreWindow();
    }, 160);
    const ti = document.getElementById('taskbar-ie-icon');
    if (ti) ti.remove();
    document.querySelectorAll('.taskbar-app, .start-item').forEach(el => el.classList.remove('active'));
  });

  document.querySelectorAll('[data-app]').forEach(el => {
    if (el.id === 'start-button') return;
    el.addEventListener('click', () => {
      const appName = el.dataset.app;
      if (appName) openApp(appName);
    });
  });

  startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
      startMenu.classList.remove('show');
    }
  });

  document.getElementById('show-desktop').addEventListener('click', () => {
    if (!ieWindow.classList.contains('hidden')) minimizeBtn.click();
  });

  const clockTime = document.getElementById('clock-time');
  const clockDate = document.getElementById('clock-date');
  function tick() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    clockTime.textContent = h + ':' + m + ' ' + ampm;
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    clockDate.textContent = mm + '/' + dd + '/' + now.getFullYear();
  }
  tick();
  setInterval(tick, 1000);
});
