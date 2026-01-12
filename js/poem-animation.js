/**
 * 工业装配式诗句入场动画
 * 基于 GSAP 的 3D 动画效果
 * 仅在桌面端加载
 */

(function () {
    'use strict';

    // 检查 GSAP 是否已加载
    if (typeof gsap === 'undefined') {
        console.log('Loading GSAP...');
        const gsapScript = document.createElement('script');
        gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
        gsapScript.onload = initPoemAnimation;
        document.head.appendChild(gsapScript);
    } else {
        initPoemAnimation();
    }

    function initPoemAnimation() {
        // 等待 DOM 完全加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupAnimation);
        } else {
            // DOM 已加载，但需要等待诗句渲染
            // 使用 MutationObserver 监听诗句容器变化
            observePoemChanges();
        }
    }

    function observePoemChanges() {
        const poemContent = document.querySelector('.poem-content');
        if (!poemContent) {
            // 如果容器还不存在，稍后重试
            setTimeout(observePoemChanges, 100);
            return;
        }

        // 监听诗句容器变化，每次切换诗词时重新播放动画
        const observer = new MutationObserver((mutations) => {
            // 检查是否有新的诗句行被添加
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    // 延迟执行，确保 DOM 完全更新
                    setTimeout(playAssemblyAnimation, 50);
                    break;
                }
            }
        });

        observer.observe(poemContent, {
            childList: true,
            subtree: true
        });

        // 初始加载时也播放一次
        setTimeout(playAssemblyAnimation, 500);
    }

    function playAssemblyAnimation() {
        // 获取所有诗句行（竖排模式下是每一列，横排模式下是每一行）
        const poemLines = document.querySelectorAll('.body-text p');
        const stamps = document.querySelectorAll('.stamps-container .seal');
        const mainSeal = document.querySelector('.poem-content::before'); // 主印章
        const container = document.querySelector('.poem-content');

        if (!poemLines.length || !container) return;

        // 重置印章动画类（确保每次都能触发）
        container.classList.remove('seal-landing');

        // 为容器添加 3D 透视
        gsap.set(container, {
            perspective: 1000,
            transformStyle: 'preserve-3d'
        });

        // 创建主时间轴
        const tl = gsap.timeline({
            defaults: {
                ease: 'expo.out'
            }
        });

        // ===== 第一阶段：诗句工业装配入场 =====
        poemLines.forEach((line, index) => {
            // 初始状态：随机 3D 位置
            gsap.set(line, {
                opacity: 0,
                z: -800 - Math.random() * 400, // 随机深度
                rotationX: 70 + Math.random() * 40, // 随机倾斜
                rotationY: (Math.random() - 0.5) * 30, // 轻微左右倾斜
                scale: 0.8,
                transformOrigin: 'center center'
            });

            // 飞入动画
            tl.to(line, {
                opacity: 1,
                z: 0,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                duration: 0.6,
                ease: 'expo.out'
            }, index * 0.12) // stagger 时间
                // 机械咬合：微小缩放反弹
                .to(line, {
                    scale: 1.03,
                    duration: 0.08,
                    ease: 'power2.out'
                }, `>-0.1`)
                .to(line, {
                    scale: 1,
                    duration: 0.15,
                    ease: 'elastic.out(1, 0.5)'
                }, '>');
        });

        // ===== 第二阶段：小印章依次落位 =====
        stamps.forEach((stamp, index) => {
            gsap.set(stamp, {
                opacity: 0,
                scale: 2,
                rotation: -15 + Math.random() * 30
            });

            tl.to(stamp, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: 'back.out(2)'
            }, `>+${index * 0.1}`);
        });

        // ===== 第三阶段：主印章重锤落下 =====
        // 注意：::before 伪元素无法直接用 GSAP 操控
        // 我们通过为容器添加一个动画类来触发
        tl.add(() => {
            container.classList.add('seal-landing');

            // 播放盖章撞击音效（只播放前0.5秒）
            playSealSound();

            // 容器抖动效果
            gsap.to(container, {
                x: 3,
                yoyo: true,
                repeat: 5,
                duration: 0.05,
                ease: 'power2.inOut',
                onComplete: () => {
                    gsap.set(container, { x: 0 });
                }
            });
        }, '+=0.3');

        console.log('🏭 Industrial assembly animation played');
    }

    /**
     * 播放盖章撞击音效
     * 只播放前0.5秒，避免15秒完整播放
     */
    function playSealSound() {
        try {
            const audio = new Audio('assets/hit-impact-impact-collision-6.mp3');
            audio.volume = 0.6; // 音量60%，避免过响
            audio.currentTime = 0;

            // 播放音频
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('🔊 Seal sound playing...');
                    // 1.5秒后停止播放（确保撞击声完整播放）
                    setTimeout(() => {
                        audio.pause();
                        audio.currentTime = 0;
                    }, 1500);
                }).catch(error => {
                    // 自动播放被浏览器阻止（用户未交互前）
                    console.log('🔇 Sound blocked by browser (user interaction required)');
                });
            }
        } catch (e) {
            console.log('Sound playback error:', e);
        }
    }

    // 暴露到全局，以便手动触发
    window.playPoemAnimation = playAssemblyAnimation;
})();
