const poems = [
    {
        title: "七律·自况",
        author: "当代 | 理工博士",
        content: [
            "硬语盘空字字真，诗词无羽拂纤尘。",
            "推崇奋发探原委，克制强行论果因。",
            "既恐他人期待己，还忧自己索求人。",
            "痴迷一件难平事，解放才情有限身。"
        ]
    },
    {
        title: "七律·落差",
        author: "当代 | 理工博士",
        content: [
            "静气凝神窗外光，焉知此刻不彷徨？",
            "伊人一点眉间蹙，博士浑身蜗角慌。",
            "惧怕落差安赫尔，迷茫处在太平洋。",
            "三生石约牵南北，缘分留诗多少行。"
        ]
    },
    {
        title: "七律·微时",
        author: "当代 | 理工博士",
        content: [
            "不复博闻强记身，灵台懒惰早蒙尘。",
            "一杯共醉隔空酒，万里相逢孤独人。",
            "试问谁无心上锁，自知我乃井中鳞。",
            "诗歌伴奏微时趣，难免小山思小蘋。"
        ]
    },
    {
        // 测试数据：带括号，全角半角混用测试
        title: "七律·纠缠(通韵)", 
        author: "当代 | 理工博士",
        content: [
            "一树梧桐绕绿萝，缠绵悱恻爱生活。",
            "以为地理银河少，却是深情汉界多。",
            "状态不明薛定谔，形姿难测海森伯。",
            "对屏回首空余想，笑笑相逢犹在昨。"
        ]
    },
    {
        title: "七律·问卦",
        author: "当代 | 理工博士",
        content: [
            "无趣灵魂无趣吟，看天看地看飞禽。",
            "空楼独享韩娥曲，开卷隔离丝竹音。",
            "男士文章男士品，女人字句女人心。",
            "占星问卦神仙语，传说诗中有子衿。"
        ]
    }
];

let currentIndex = 0;

function renderPoem(index) {
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
    
    // 切换 class
    card.classList.toggle('horizontal-mode');
    
    // 修改按钮文字
    if (card.classList.contains('horizontal-mode')) {
        btn.innerText = "竖排"; // 当前是横排，提示用户点击变竖排
    } else {
        btn.innerText = "横排"; // 当前是竖排，提示用户点击变横排
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
    // 随机开始
    currentIndex = Math.floor(Math.random() * poems.length);
    renderPoem(currentIndex);
    
    // 初始化音乐
    initMusic();
});