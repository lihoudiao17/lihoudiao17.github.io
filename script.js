let poems = [];
let currentIndex = 0;

async function loadPoems() {
    try {
        const response = await fetch('data/poems.json');
        poems = await response.json();
        
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

function renderPoem(index) {
    if (poems.length === 0) return;
    const poem = poems[index];
    const card = document.querySelector('.poem-content');
    
    // 淡出动画
    card.style.opacity = 0;
    
    setTimeout(() => {
        // --- 自动化处理逻辑开始 ---
        let displayTitle = poem.title;
        let displayNote = poem.note || ""; // 如果数据里原本就有note，保留它

        // 正则表达式：匹配 (通韵) 或 （通韵）
        const tongYunRegex = /[\(（]通韵[\)）]/;

        if (tongYunRegex.test(displayTitle)) {
            // 1. 从标题中删除 (通韵)
            displayTitle = displayTitle.replace(tongYunRegex, "");
            // 2. 自动添加备注（如果原来没有）
            if (!displayNote) {
                displayNote = "注：通韵";
            }
        }
        // --- 自动化处理逻辑结束 ---

        document.getElementById('poem-title').innerText = displayTitle;
        
        const bodyDiv = document.getElementById('poem-body');
        bodyDiv.innerHTML = ''; // 清空
        poem.content.forEach(line => {
            const p = document.createElement('p');
            p.innerText = line;
            bodyDiv.appendChild(p);
        });

        // 渲染备注
        if (displayNote) {
            const noteP = document.createElement('p');
            noteP.innerText = displayNote;
            noteP.className = 'poem-note'; 
            bodyDiv.appendChild(noteP);
        }
        
        // 淡入动画
        card.style.opacity = 1;
    }, 500);
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
    
    // 切换 class
    card.classList.toggle('horizontal-mode');
    
    // 联动颜色切换：所有按钮一起变色
    btn.classList.toggle('blue-mode');
    tocBtn.classList.toggle('blue-mode');
    prevBtn.classList.toggle('blue-mode');
    nextBtn.classList.toggle('blue-mode');
    
    // 修改按钮文字
    if (card.classList.contains('horizontal-mode')) {
        btn.innerText = "竖排模式"; // 当前是横排，提示用户点击变竖排
    } else {
        btn.innerText = "横排模式"; // 当前是竖排，提示用户点击变横排
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
                }).catch(e => {});
            } else {
                // 如果点的就是当前这首，就切换播放状态
                togglePlay();
            }
        });
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadPoems();
    
    // 初始化音乐
    initMusic();
});