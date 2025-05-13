// 아이콘 클릭 시 개별 윈도우 창 생성
document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const app = icon.dataset.app;

        switch (app) {
            case 'cronix':
                createBrowserWindow('Cronix 브라우저', 'cronix');
                break;
            case 'uson':
                createBrowserWindow('Uson 브라우저', 'uson');
                break;
            default:
                console.log('알 수 없는 앱:', app);
        }
    });
});

let windowCount = 0;

function createBrowserWindow(title, browserId) {
    const desktop = document.getElementById('desktop');
    const win = document.createElement('div');
    win.classList.add('window');
    win.dataset.browserId = browserId;
    win.dataset.state = 'normal';
    win.style.left = '120px';
    win.style.top = '100px';
    win.style.width = '800px';
    win.style.height = '500px';

    win.innerHTML = `
    <div class="window-header">
      <div class="window-app-info">
        <img class="window-icon" src="assets/icons/icon-browser-${browserId}.png" />
        <span class="window-title">${title}</span>
      </div>
      <div class="window-controls">
        <button class="minimize-btn">—</button>
        <button class="maximize-btn">☐</button>
        <button class="close-btn">X</button>
      </div>
    </div>
    <div class="browser-toolbar">
      <button class="nav-back">◀</button>
      <button class="nav-forward">▶</button>
      <button class="nav-refresh">🔄</button>
    </div>
    <div class="browser-body">
      <div class="page" data-page="home"></div>
    </div>
  `;

    desktop.appendChild(win);
    makeDraggable(win);
    initBrowserControls(win);
    win.loadPage('home');
}

function initBrowserControls(win) {
    const closeBtn = win.querySelector('.close-btn');
    const maximizeBtn = win.querySelector('.maximize-btn');
    const minimizeBtn = win.querySelector('.minimize-btn');
    const browserBody = win.querySelector('.browser-body');

    const backBtn = win.querySelector('.nav-back');
    const forwardBtn = win.querySelector('.nav-forward');
    const refreshBtn = win.querySelector('.nav-refresh');

    let historyStack = ['home'];
    let historyIndex = 0;

    closeBtn.onclick = () => win.remove();

    maximizeBtn.onclick = () => {
        if (win.dataset.state === 'normal') {
            win.dataset.prevLeft = win.style.left;
            win.dataset.prevTop = win.style.top;
            win.dataset.prevWidth = win.style.width;
            win.dataset.prevHeight = win.style.height;

            win.style.left = '0';
            win.style.top = '0';
            win.style.width = '100vw';
            win.style.height = '100vh';
            win.dataset.state = 'maximized';
        } else {
            win.style.left = win.dataset.prevLeft;
            win.style.top = win.dataset.prevTop;
            win.style.width = win.dataset.prevWidth;
            win.style.height = win.dataset.prevHeight;
            win.dataset.state = 'normal';
        }
    };

    minimizeBtn.onclick = () => {
        win.style.display = 'none';
        win.dataset.state = 'minimized';
    };

    refreshBtn.onclick = () => {
        const current = historyStack[historyIndex];
        loadPage(current);
    };

    backBtn.onclick = () => {
        if (historyIndex > 0) {
            historyIndex--;
            loadPage(historyStack[historyIndex]);
        }
    };

    forwardBtn.onclick = () => {
        if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            loadPage(historyStack[historyIndex]);
        }
    };

    function loadPage(page) {
        let content = '';

        if (page === 'home') {
            content = createBrowserContent(win.dataset.browserId);
        } else if (page === 'starium') {
            content = `
        <h3>🌐 Starium 포털 메인</h3>
        <p>Starium에 오신 것을 환영합니다!</p>
        <p>[가상의 뉴스 / 메일 / 검색 기능 등]</p>
      `;
        } else if (page === 'dorana') {
            content = `
        <h3>📧 Dorana 포털 메인</h3>
        <p>Dorana 메일에 접속 중입니다...</p>
        <p>[가상의 인증메일 / 링크 등]</p>
      `;
        } else {
            content = `
        <h3>🔍 빈 페이지 (unknown)</h3>
        <p>존재하지 않는 페이지입니다.</p>
      `;
        }

        browserBody.innerHTML = `
      <div class="page" data-page="${page}">
        ${content}
      </div>
    `;
    }

    win.loadPage = (page) => {
        historyStack = historyStack.slice(0, historyIndex + 1);
        historyStack.push(page);
        historyIndex++;
        loadPage(page);
    };
}

function createBrowserContent(browser) {
    return `
    <div class="portal-selection">
      <div class="portal-button" data-browser="${browser}" data-target="starium">
        <img src="assets/icons/icon-portal-starium.png" width="48"/><br/>
        <span>Starium</span>
      </div>
      <div class="portal-button" data-browser="${browser}" data-target="dorana">
        <img src="assets/icons/icon-portal-dorana.png" width="48"/><br/>
        <span>Dorana</span>
      </div>
    </div>
  `;
}

// 포털 버튼 클릭 시 현재 브라우저 창 내부에서 페이지 로드
document.addEventListener("click", (e) => {
    const portalBtn = e.target.closest(".portal-button");
    if (!portalBtn) return;

    const browserWindow = portalBtn.closest(".window");
    const pageName = portalBtn.dataset.target;

    if (browserWindow && browserWindow.loadPage) {
        browserWindow.loadPage(pageName);
    }
});

// 윈도우 창 드래그
function makeDraggable(el) {
  const header = el.querySelector('.window-header');
  let isDragging = false;
  let offsetX, offsetY;

  // ✅ 창 클릭 시 항상 zIndex 올림
  el.addEventListener('mousedown', () => {
    el.style.zIndex = ++windowCount;
  });

  // 드래그 시작
  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
  });

  // 드래그 끝
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // 드래그 중 이동
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
    }
  });
}

// 휴대폰 앱 전환
document.querySelectorAll('.phone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        document.querySelectorAll('.phone-app').forEach(app => {
            app.style.display = 'none';
        });
        document.getElementById(targetId).style.display = 'block';
    });
});

window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.phone-app').forEach(app => {
        app.style.display = 'none';
    });
    document.getElementById('ars-app').style.display = 'block';
});