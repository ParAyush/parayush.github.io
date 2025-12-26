document.addEventListener('DOMContentLoaded', () => {
  console.log('script.js loaded');

  const ieWindow = document.getElementById('ie-window');
  const titleBar = ieWindow.querySelector('.window-titlebar');
  const resizeHandle = ieWindow.querySelector('.resize-handle');
  const minimizeBtn = ieWindow.querySelector('.minimize-btn');
  const maximizeBtn = ieWindow.querySelector('.maximize-btn');
  const closeBtn = ieWindow.querySelector('.close-btn');
  const iframe = ieWindow.querySelector('.window-content');

  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');

  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  let isResizing = false;

  let isMaximized = false;

  let lastPosition = {
    top: 80,
    left: 80,
    width: 800,
    height: 600,
  };

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
    lastPosition.top = ieWindow.offsetTop;
    lastPosition.left = ieWindow.offsetLeft;
    titleBar.classList.remove('dragging');
    titleBar.releasePointerCapture(e.pointerId);
  });

  titleBar.addEventListener('lostpointercapture', () => {
    isDragging = false;
    titleBar.classList.remove('dragging');
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
    const minWidth = 300;
    const minHeight = 200;
    let newWidth = e.clientX - rect.left;
    let newHeight = e.clientY - rect.top;
    newWidth = Math.min(Math.max(newWidth, minWidth), window.innerWidth - rect.left);
    newHeight = Math.min(Math.max(newHeight, minHeight), window.innerHeight - rect.top);
    ieWindow.style.width = newWidth + 'px';
    ieWindow.style.height = newHeight + 'px';
  });

  resizeHandle.addEventListener('pointerup', (e) => {
    if (!isResizing) return;
    isResizing = false;
    lastPosition.width = ieWindow.offsetWidth;
    lastPosition.height = ieWindow.offsetHeight;
    resizeHandle.releasePointerCapture(e.pointerId);
    document.body.style.userSelect = 'auto';
  });

  resizeHandle.addEventListener('lostpointercapture', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.userSelect = 'auto';
    }
  });

    function openApp(appName) {
    let url = 'about:blank';

    if (appName === 'about') url = 'about.html';
    else if (appName === 'work') url = 'work.html';
    else if (appName === 'projects') url = 'projects.html';
    else if (appName === 'contact') url = 'contact.html';

    if (!url) return;

    // Mark taskbar buttons active
    document.querySelectorAll('.taskbar-app').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.app === appName);
    });

    // (Optional) mark start-menu / desktop items active too
    document.querySelectorAll('.start-item').forEach(item => {
      const label = item.querySelector('span')?.textContent.toLowerCase() || '';
      const isMatch =
        (appName === 'about' && label.includes('about')) ||
        (appName === 'work' && label.includes('work experience')) ||
        (appName === 'projects' && label.includes('projects')) ||
        (appName === 'contact' && label.includes('contact'));
      item.classList.toggle('active', isMatch);
    });

    iframe.src = url;
    ieWindow.classList.remove('hidden');
    iframe.style.display = 'block';

    ieWindow.style.top = lastPosition.top + 'px';
    ieWindow.style.left = lastPosition.left + 'px';
    ieWindow.style.width = lastPosition.width + 'px';
    ieWindow.style.height = lastPosition.height + 'px';
    isMaximized = false;

    startMenu.classList.remove('show');
  }

  minimizeBtn.addEventListener('click', () => {
    console.log('Minimize clicked');
    if (ieWindow.classList.contains('hidden')) return;
    lastPosition = {
      top: ieWindow.offsetTop,
      left: ieWindow.offsetLeft,
      width: ieWindow.offsetWidth,
      height: ieWindow.offsetHeight,
    };
    ieWindow.classList.add('hidden');
    iframe.style.display = 'none';

    if (!document.getElementById('taskbar-ie-icon')) {
      const taskbar = document.querySelector('.windows-bar');
      const icon = document.createElement('button');
      icon.id = 'taskbar-ie-icon';
      icon.textContent = 'IE';
      icon.style.cssText = `
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: white;
        font-weight: bold;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
        margin-left: 5px;
        transition: background-color 0.2s ease;
      `;
      icon.addEventListener('click', () => {
        ieWindow.classList.remove('hidden');
        iframe.style.display = 'block';
        ieWindow.style.top = lastPosition.top + 'px';
        ieWindow.style.left = lastPosition.left + 'px';
        ieWindow.style.width = lastPosition.width + 'px';
        ieWindow.style.height = lastPosition.height + 'px';
        isMaximized = false;
        icon.remove();
      });
      taskbar.appendChild(icon);
    }
  });

  maximizeBtn.addEventListener('click', () => {
    console.log('Maximize clicked');
    if (!isMaximized) {
      lastPosition = {
        top: ieWindow.offsetTop,
        left: ieWindow.offsetLeft,
        width: ieWindow.offsetWidth,
        height: ieWindow.offsetHeight,
      };
      ieWindow.style.top = '0';
      ieWindow.style.left = '0';
      ieWindow.style.width = '100vw';
      ieWindow.style.height = '100vh';
      iframe.style.display = 'block';
      isMaximized = true;
    } else {
      ieWindow.style.top = lastPosition.top + 'px';
      ieWindow.style.left = lastPosition.left + 'px';
      ieWindow.style.width = lastPosition.width + 'px';
      ieWindow.style.height = lastPosition.height + 'px';
      iframe.style.display = 'block';
      isMaximized = false;
    }
  });

  closeBtn.addEventListener('click', () => {
    console.log('Close clicked');
    ieWindow.classList.add('hidden');
    iframe.src = '';

    document.querySelectorAll('.taskbar-app, .start-item').forEach(el => {
      el.classList.remove('active');
    });
  });



  document.querySelectorAll('.start-item').forEach(button => {
    button.addEventListener('click', () => {
      const label = button.querySelector('span')?.textContent.toLowerCase() || '';
      let appName = '';

      if (label.includes('about')) appName = 'about';
      else if (label.includes('work experience')) appName = 'work';
      else if (label.includes('projects')) appName = 'projects';
      else if (label.includes('contact')) appName = 'contact';

      if (appName) openApp(appName);
    });
  });

  document.querySelectorAll('.taskbar-app').forEach(button => {
    button.addEventListener('click', () => {
      const appName = button.dataset.app;
      if (appName) openApp(appName);
    });
  });


   startButton.addEventListener('click', () => {
    startMenu.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
      startMenu.classList.remove('show');
    }
  });

  // Open About Me by default on first load
  openApp("about");
});
