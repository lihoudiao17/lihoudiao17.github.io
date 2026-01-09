let poems = [];
let currentIndex = 0;

// 背景图顺序切换（6张）
const backgrounds = [
    'assets/background.jpg',
    'assets/background02.jpg',
    'assets/background03.jpg',
    'assets/background04.png',
    'assets/background05.jpeg',
    'assets/background06.jpg'
];

let bgIndex = 0; // 当前背景索引
const cacheBuster = Date.now(); // 时间戳破缓存

function changeBackground() {
    const currentBg = backgrounds[bgIndex];
    // 动态注入style覆盖body::before的背景
    let styleEl = document.getElementById('dynamic-bg');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-bg';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
        body::before {
            background-image:
                linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
                linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
                url('${currentBg}?v=${cacheBuster}') !important;
        }
    `;
    // 顺序循环
    bgIndex = (bgIndex + 1) % backgrounds.length;
}

// 页面加载时随机背景，每5分钟切换一次
document.addEventListener('DOMContentLoaded', () => {
    changeBackground();
    setInterval(changeBackground, 5 * 60 * 1000); // 5分钟切换
});

// 更新通知信息（从 poems.json 动态读取）
let updateInfo = {
    date: '',
    latestWork: ''
};

// 获取北京时间的日期字符串（YYYY-MM-DD）
function getBeijingDateString() {
    const now = new Date();
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    return beijingTime.toISOString().split('T')[0];
}

// 检查是否显示通知（只在更新当天显示，按北京时间）
function checkUpdateNotice() {
    const today = getBeijingDateString();
    const noticeEl = document.getElementById('update-notice');

    if (updateInfo.date && today === updateInfo.date) {
        noticeEl.style.display = 'flex';
    } else {
        noticeEl.style.display = 'none';
    }
}

// 通知状态
let noticeExpanded = false;

function toggleUpdateNotice() {
    const textEl = document.getElementById('notice-text');
    noticeExpanded = !noticeExpanded;

    if (noticeExpanded) {
        // 格式化日期显示（2026-01-08 → 2026年1月8日）
        if (updateInfo.date && updateInfo.date.includes('-')) {
            const dateParts = updateInfo.date.split('-');
            const displayDate = `${dateParts[0]}年${parseInt(dateParts[1])}月${parseInt(dateParts[2])}日`;
            textEl.innerHTML = `${displayDate}<br>新作：${updateInfo.latestWork}`;
        } else {
            textEl.innerHTML = `新作：${updateInfo.latestWork}`;
        }
    } else {
        textEl.textContent = '新作上线';
    }
}

async function loadPoems() {
    try {
        const response = await fetch('data/poems.json');
        const data = await response.json();

        // 读取更新信息
        updateInfo.date = data.lastUpdate || '';
        updateInfo.latestWork = data.latestWork || '';

        // 读取诗词数组
        poems = data.poems || data;

        // 检查并显示更新通知
        checkUpdateNotice();

        // 渲染名录
        renderTOC();

        // 随机开始
        currentIndex = Math.floor(Math.random() * poems.length);
        renderPoem(currentIndex);
    } catch (error) {
        console.error("加载诗词数据失败:", error);
    }
}


function renderTOC() {
    const tocList = document.getElementById('toc-list');
    tocList.innerHTML = '';
    poems.forEach((poem, index) => {
        const li = document.createElement('li');
        li.innerText = poem.title;
        li.onclick = () => {
            currentIndex = index;
            renderPoem(index);
            toggleTOC();
        };
        tocList.appendChild(li);
    });
}

function toggleTOC() {
    const overlay = document.getElementById('toc-overlay');
    overlay.classList.toggle('active');
}

// 切换作品注释弹窗
function toggleNotes() {
    const overlay = document.getElementById('notes-overlay');
    const notesContent = document.getElementById('notes-content');

    // 如果弹窗将要打开，先填充内容
    if (!overlay.classList.contains('active')) {
        const poem = poems[currentIndex];
        const notes = poem.notes || [];

        if (notes.length > 0) {
            // 有注释：逐条显示
            notesContent.innerHTML = notes.map(note => `<p>${note}</p>`).join('');
        } else {
            // 无注释
            notesContent.innerHTML = '<p>暂无注释</p>';
        }
    }

    overlay.classList.toggle('active');
}

function renderPoem(index) {
    if (poems.length === 0) return;
    const poem = poems[index];
    const textContainer = document.getElementById('poem-text-container');

    // 水墨晕染淡出动画
    textContainer.classList.remove('ink-fade-in');
    textContainer.classList.add('ink-fade-out');

    setTimeout(() => {
        // 处理标题（如果标题里有通韵标注则移除，备注通过弹窗显示）
        let displayTitle = poem.title;
        const tongYunRegex = /[\(（]通韵[\)）]/;
        if (tongYunRegex.test(displayTitle)) {
            displayTitle = displayTitle.replace(tongYunRegex, "");
        }

        document.getElementById('poem-title').innerText = displayTitle;

        // 渲染正文（不渲染备注，备注通过弹窗单独显示）
        const bodyDiv = document.getElementById('poem-body');
        bodyDiv.innerHTML = '';
        poem.content.forEach(line => {
            const p = document.createElement('p');
            p.innerText = line;
            bodyDiv.appendChild(p);
        });

        // 水墨晕染淡入动画
        textContainer.classList.remove('ink-fade-out');
        textContainer.classList.add('ink-fade-in');
    }, 400);
}

function nextPoem() {
    currentIndex = (currentIndex + 1) % poems.length;
    renderPoem(currentIndex);
}

function prevPoem() {
    // 逻辑：(当前索引 - 1 + 总长度) % 总长度，确保处理负数
    currentIndex = (currentIndex - 1 + poems.length) % poems.length;
    renderPoem(currentIndex);
}

// 切换横竖排版
function toggleMode() {
    const card = document.querySelector('.poem-content');
    const btn = document.getElementById('mode-btn');
    const tocBtn = document.getElementById('toc-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const musicLabel = document.querySelector('.music-label');
    const themeBtn = document.getElementById('theme-btn');
    const playmodeBtn = document.getElementById('playmode-btn');

    // 切换 class
    card.classList.toggle('horizontal-mode');

    // 联动颜色切换：所有按钮一起变色
    btn.classList.toggle('blue-mode');
    tocBtn.classList.toggle('blue-mode');
    prevBtn.classList.toggle('blue-mode');
    nextBtn.classList.toggle('blue-mode');
    if (musicLabel) musicLabel.classList.toggle('blue-mode');
    if (themeBtn) themeBtn.classList.toggle('blue-mode');
    if (playmodeBtn) playmodeBtn.classList.toggle('blue-mode');

    // 修改按钮文字（显示当前状态）
    if (card.classList.contains('horizontal-mode')) {
        btn.innerHTML = "横排<br>模式"; // 当前是横排
    } else {
        btn.innerHTML = "竖排<br>模式"; // 当前是竖排
    }
}

// 音乐控制逻辑
function initMusic() {
    const musicCtrl = document.getElementById('music-control');
    const audio = document.getElementById('bg-music');
    const playlistItems = document.querySelectorAll('.music-list li');
    let isPlaying = false;

    // 默认加载第一首
    if (playlistItems.length > 0) {
        audio.src = playlistItems[0].dataset.src;
    }

    // 播放/暂停 切换函数
    const togglePlay = () => {
        if (audio.paused) {
            audio.play().then(() => {
                musicCtrl.classList.add('music-playing');
                isPlaying = true;
            }).catch(e => console.log("播放被拦截:", e));
        } else {
            audio.pause();
            musicCtrl.classList.remove('music-playing');
            isPlaying = false;
        }
    };

    // 图标点击事件
    musicCtrl.addEventListener('click', togglePlay);

    // 歌单点击切歌事件
    playlistItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止冒泡触发其他点击

            const newSrc = item.dataset.src;
            // 切换高亮
            playlistItems.forEach(li => li.classList.remove('active'));
            item.classList.add('active');

            // 只有当源文件不同时才重载
            if (audio.getAttribute('src') !== newSrc) {
                audio.src = newSrc;
                // 切歌后自动播放
                audio.play().then(() => {
                    musicCtrl.classList.add('music-playing');
                    isPlaying = true;
                }).catch(e => { });
            } else {
                // 如果点的就是当前这首，就切换播放状态
                togglePlay();
            }
        });
    });
}

// ===== 深色/浅色模式切换 =====
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-btn');

    if (body.dataset.theme === 'dark') {
        body.dataset.theme = 'light';
        btn.innerHTML = '日间<br>模式';
        localStorage.setItem('theme', 'light');
    } else {
        body.dataset.theme = 'dark';
        btn.innerHTML = '夜间<br>模式';
        localStorage.setItem('theme', 'dark');
    }
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const btn = document.getElementById('theme-btn');

    document.body.dataset.theme = savedTheme;
    btn.innerHTML = savedTheme === 'dark' ? '夜间<br>模式' : '日间<br>模式';
}

// ===== 音乐播放模式 =====
let playMode = 'loop'; // 'loop' = 单曲循环, 'shuffle' = 随机播放

function togglePlayMode() {
    const btn = document.getElementById('playmode-btn');
    const audio = document.getElementById('bg-music');

    if (playMode === 'loop') {
        playMode = 'shuffle';
        audio.loop = false;
        btn.innerHTML = '随机<br>播放';
    } else {
        playMode = 'loop';
        audio.loop = true;
        btn.innerHTML = '单曲<br>循环';
    }
    localStorage.setItem('playMode', playMode);
}

// 初始化播放模式
function initPlayMode() {
    const savedMode = localStorage.getItem('playMode') || 'loop';
    const btn = document.getElementById('playmode-btn');
    const audio = document.getElementById('bg-music');

    playMode = savedMode;
    if (playMode === 'shuffle') {
        audio.loop = false;
        btn.innerHTML = '随机<br>播放';
    } else {
        audio.loop = true;
        btn.innerHTML = '单曲<br>循环';
    }

    // 监听播放结束事件（用于随机播放）
    audio.addEventListener('ended', () => {
        if (playMode === 'shuffle') {
            playRandomSong();
        }
    });
}

// 随机播放下一首
function playRandomSong() {
    const playlistItems = document.querySelectorAll('.music-list li');
    const audio = document.getElementById('bg-music');
    const musicCtrl = document.getElementById('music-control');

    // 获取当前播放的索引
    let currentIdx = -1;
    playlistItems.forEach((item, idx) => {
        if (item.classList.contains('active')) currentIdx = idx;
    });

    // 随机选择一个不同的索引
    let newIdx;
    do {
        newIdx = Math.floor(Math.random() * playlistItems.length);
    } while (newIdx === currentIdx && playlistItems.length > 1);

    // 切换高亮和播放
    playlistItems.forEach(li => li.classList.remove('active'));
    playlistItems[newIdx].classList.add('active');
    audio.src = playlistItems[newIdx].dataset.src;
    audio.play().then(() => {
        musicCtrl.classList.add('music-playing');
    }).catch(e => { });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadPoems();

    // 初始化主题
    initTheme();

    // 初始化音乐（先设置音频源）
    initMusic();

    // 初始化播放模式（后设置loop属性）
    initPlayMode();
});