let poems = [];
let currentIndex = 0;

// 背景图随机切换（12张）
const backgrounds = [
    'assets/background01.jpg',
    'assets/background02.jpg',
    'assets/background03.jpg',
    'assets/background04.png',
    'assets/background05.jpeg',
    'assets/background06.jpg',
    'assets/background07.jpg',
    'assets/background08.jpg',
    'assets/background09.png',
    'assets/background10.jpg',
    'assets/background11.jpg',
    'assets/background12.jpg'
];

let bgIndex = 0; // 当前背景索引
const cacheBuster = Date.now(); // 时间戳破缓存
let bgMode = 'random'; // 背景模式：random（随机）或 fixed（固定）
let bgIntervalId = null; // 背景切换定时器ID
let fixedBgIndex = 0; // 固定模式下的背景索引

// 应用指定索引的背景
function applyBackground(index) {
    const currentBg = backgrounds[index];
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

    // 分析背景亮度并触发主题变更
    analyzeBackground(currentBg);
}

// 分析背景图片亮度
function analyzeBackground(url) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 1;

        // 绘制图片到 1x1 画布以获取平均色
        ctx.drawImage(img, 0, 0, 1, 1);
        const p = ctx.getImageData(0, 0, 1, 1).data;

        // 计算亮度 (Luminance)
        // Formula: 0.299*R + 0.587*G + 0.114*B
        const brightness = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
        const isDark = brightness < 128;

        console.log(`Background: ${url}, Brightness: ${brightness.toFixed(1)}, Mode: ${isDark ? 'Dark' : 'Light'}`);

        // 触发自定义事件
        const event = new CustomEvent('lattice-theme-change', {
            detail: {
                isDark: isDark,
                brightness: brightness
            }
        });
        window.dispatchEvent(event);
    };

    img.onerror = () => {
        console.warn('Failed to analyze background:', url);
        // 默认深色模式
        window.dispatchEvent(new CustomEvent('lattice-theme-change', {
            detail: { isDark: true, brightness: 0 }
        }));
    };
}

// 随机切换背景
function changeBackground() {
    if (bgMode === 'fixed') return; // 固定模式不切换
    bgIndex = Math.floor(Math.random() * backgrounds.length);
    applyBackground(bgIndex);
}

// 切换背景模式（随机/固定）
function toggleBgMode() {
    const btn = document.getElementById('bg-btn');
    if (bgMode === 'random') {
        // 切换到固定模式
        bgMode = 'fixed';
        fixedBgIndex = bgIndex; // 固定当前背景
        btn.innerHTML = '固定<br>背景';
        btn.classList.add('active-mode');
    } else {
        // 切换到随机模式
        bgMode = 'random';
        btn.innerHTML = '随机<br>背景';
        btn.classList.remove('active-mode');
        changeBackground(); // 立即切换一次
    }
}

// 选择指定背景并固定
function selectBackground(index) {
    bgMode = 'fixed';
    fixedBgIndex = index;
    bgIndex = index;
    applyBackground(index);
    const btn = document.getElementById('bg-btn');
    btn.innerHTML = '固定<br>背景';
    btn.classList.add('active-mode');
}

// 页面加载时初始化背景
document.addEventListener('DOMContentLoaded', () => {
    // 初始随机背景
    bgIndex = Math.floor(Math.random() * backgrounds.length);
    applyBackground(bgIndex);

    // 每5分钟切换一次
    bgIntervalId = setInterval(changeBackground, 5 * 60 * 1000);

    // 绑定背景按钮点击事件
    const bgBtn = document.getElementById('bg-btn');
    const bgList = document.getElementById('bg-list');

    if (bgBtn && bgList) {
        // 点击按钮：切换模式
        bgBtn.addEventListener('click', toggleBgMode);

        // 长按显示列表（移动端）
        let longPressTimer = null;
        bgBtn.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                e.preventDefault();
                bgList.classList.add('show');
            }, 500); // 500ms长按
        });
        bgBtn.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });
        bgBtn.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });

        // 悬停显示列表（桌面端）
        let hideTimer = null;
        const showList = () => {
            clearTimeout(hideTimer);
            // 动态计算按钮位置，让列表显示在按钮下方
            const rect = bgBtn.getBoundingClientRect();
            bgList.style.top = (rect.bottom + 5) + 'px';
            bgList.style.left = rect.left + 'px';
            bgList.classList.add('show');
        };
        const hideList = () => {
            hideTimer = setTimeout(() => {
                bgList.classList.remove('show');
            }, 200); // 延迟200ms隐藏，给用户时间移动到列表
        };

        bgBtn.addEventListener('mouseenter', showList);
        bgBtn.addEventListener('mouseleave', hideList);
        bgList.addEventListener('mouseenter', showList);
        bgList.addEventListener('mouseleave', hideList);

        // 点击列表项选择背景
        bgList.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                selectBackground(index);
                bgList.classList.remove('show');
                // 更新激活状态
                bgList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // 点击其他区域关闭列表
        document.addEventListener('click', (e) => {
            if (!bgBtn.contains(e.target) && !bgList.contains(e.target)) {
                bgList.classList.remove('show');
            }
        });
    }
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
    const today = getBeijingDateString();
    tocList.innerHTML = '';
    poems.forEach((poem, index) => {
        const li = document.createElement('li');
        li.innerText = poem.title;

        // 如果是最新作品且在通知有效期内（即当天），添加高亮类
        if (updateInfo.latestWork && poem.title.includes(updateInfo.latestWork.replace(/《|》/g, '')) && updateInfo.date && today === updateInfo.date) {
            li.classList.add('new-work-highlight');
        } else if (updateInfo.latestWork === poem.title && updateInfo.date && today === updateInfo.date) {
            li.classList.add('new-work-highlight');
        }

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
    const noteBtn = document.getElementById('note-btn');

    // 如果弹窗将要打开，先填充内容
    if (!overlay.classList.contains('active')) {
        const poem = poems[currentIndex];
        const notes = poem.notes || [];

        if (notes.length > 0) {
            // 有注释：逐条显示
            notesContent.innerHTML = notes.map(note => `<p>${note}</p>`).join('');
            // 点击查看后移除高亮
            if (noteBtn) noteBtn.classList.remove('has-notes');
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

        // 检测是否有备注，高亮注释按钮
        const noteBtn = document.getElementById('note-btn');
        if (noteBtn) {
            if (poem.notes && poem.notes.length > 0) {
                noteBtn.classList.add('has-notes');
            } else {
                noteBtn.classList.remove('has-notes');
            }
        }

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
    const bgBtn = document.getElementById('bg-btn');

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
    if (bgBtn) bgBtn.classList.toggle('blue-mode');

    // 修改按钮文字（显示当前状态）
    if (card.classList.contains('horizontal-mode')) {
        btn.innerHTML = "横排<br>观赏"; // 当前是横排
    } else {
        btn.innerHTML = "竖排<br>观赏"; // 当前是竖排
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

    // 图标点击事件：播放/暂停
    musicCtrl.addEventListener('click', togglePlay);

    // 歌单点击切歌事件
    playlistItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();

            const newSrc = item.dataset.src;
            // 切换高亮
            playlistItems.forEach(li => li.classList.remove('active'));
            item.classList.add('active');

            // 关闭歌单列表
            const musicList = item.closest('.music-list');
            if (musicList) {
                musicList.classList.add('force-hide');
                musicList.addEventListener('mouseleave', function handler() {
                    musicList.classList.remove('force-hide');
                    musicList.removeEventListener('mouseleave', handler);
                });
            }

            // 切歌并播放
            if (audio.getAttribute('src') !== newSrc) {
                audio.src = newSrc;
                audio.play().then(() => {
                    musicCtrl.classList.add('music-playing');
                    isPlaying = true;
                }).catch(e => { });
            } else {
                togglePlay();
            }
        });
    });
}

// ===== 云笺模式切换（下拉列表） =====
function selectTheme(mode) {
    const card = document.querySelector('.poem-content');
    const list = document.getElementById('theme-list');

    if (mode === 'default') {
        // 宣纸模式：移除云笺类和自定义背景
        card.classList.remove('yunjian-mode');
        card.style.removeProperty('--yunjian-bg');
        localStorage.setItem('noteMode', 'default');
    } else {
        // 花笺模式：添加云笺类并设置对应背景图
        card.classList.add('yunjian-mode');
        // card06 使用 webp 格式，其他使用 jpg
        const ext = mode === 'card06' ? 'webp' : 'jpg';
        card.style.setProperty('--yunjian-bg', `url('../assets/${mode}.${ext}')`);
        localStorage.setItem('noteMode', mode);
    }

    // 更新列表激活状态
    if (list) {
        list.querySelectorAll('li').forEach(li => {
            li.classList.remove('active');
            if (li.dataset.value === mode) li.classList.add('active');
        });
    }
}

// 初始化云笺模式交互
function initTheme() {
    const savedMode = localStorage.getItem('noteMode') || 'default';
    selectTheme(savedMode);

    // 绑定下拉列表事件
    const btn = document.getElementById('theme-btn');
    const list = document.getElementById('theme-list');

    if (btn && list) {
        // 点击按钮显示/隐藏列表
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // 动态定位
            const rect = btn.getBoundingClientRect();
            list.style.top = (rect.bottom + 5) + 'px';
            list.style.left = rect.left + 'px';
            list.classList.toggle('show');
        });

        // 点击列表项
        list.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (e) => {
                const mode = e.target.dataset.value;
                selectTheme(mode);
                list.classList.remove('show');
            });
        });

        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !list.contains(e.target)) {
                list.classList.remove('show');
            }
        });
    }
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
        btn.classList.remove('active-mode');
    } else {
        playMode = 'loop';
        audio.loop = true;
        btn.innerHTML = '单曲<br>循环';
        btn.classList.add('active-mode');
    }
    localStorage.setItem('playMode', playMode);
}

// 初始化播放模式
function initPlayMode() {
    // 默认随机播放，除非用户手动选择了歌曲
    const savedMode = localStorage.getItem('playMode') || 'shuffle';
    const btn = document.getElementById('playmode-btn');
    const audio = document.getElementById('bg-music');

    playMode = savedMode;
    if (playMode === 'shuffle') {
        audio.loop = false;
        btn.innerHTML = '随机<br>播放';
        btn.classList.remove('active-mode');
    } else {
        audio.loop = true;
        btn.innerHTML = '单曲<br>循环';
        btn.classList.add('active-mode');
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

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // 如果焦点在输入框则不处理
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'ArrowLeft':
                prevPoem();
                break;
            case 'ArrowRight':
                nextPoem();
                break;
            case ' ':
                // 空格：播放/暂停音乐
                e.preventDefault();
                const audio = document.getElementById('bg-music');
                const musicCtrl = document.getElementById('music-control');
                if (audio && musicCtrl) {
                    if (audio.paused) {
                        audio.play().then(() => {
                            musicCtrl.classList.add('music-playing');
                        }).catch(() => { });
                    } else {
                        audio.pause();
                        musicCtrl.classList.remove('music-playing');
                    }
                }
                break;
        }
    });

    // 触摸滑动切换诗词（移动端）
    let touchStartX = 0;
    let touchEndX = 0;
    const poemCard = document.getElementById('poem-card');

    if (poemCard) {
        poemCard.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        poemCard.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;

            // 滑动距离超过50px才触发
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    // 左滑：下一首
                    nextPoem();
                } else {
                    // 右滑：上一首
                    prevPoem();
                }
            }
        }, { passive: true });
    }

    // ===== 秘密功能：点击标题5次查看访客统计 =====
    const title = document.querySelector('.site-title');
    if (title) {
        let clickCount = 0;
        let lastClickTime = 0;

        title.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();

            // 如果两次点击间隔超过1秒，重置计数
            if (currentTime - lastClickTime > 1000) {
                clickCount = 0;
            }

            clickCount++;
            lastClickTime = currentTime;

            // 连续点击5次触发
            if (clickCount === 5) {
                clickCount = 0; // 重置

                // 获取不蒜子统计数据
                const uvSpan = document.getElementById('busuanzi_value_site_uv');
                const pvSpan = document.getElementById('busuanzi_value_site_pv');

                const uv = uvSpan ? uvSpan.innerText : '统计中...';
                const pv = pvSpan ? pvSpan.innerText : '统计中...';

                alert(`㊙️ 秘密数据：\n\n👤 今日访客数 (UV): ${uv}\n👁️ 总访问量 (PV): ${pv}`);
            }
        });

        // 鼠标手型提示
        title.style.cursor = 'pointer';
        title.style.userSelect = 'none';
    }
});