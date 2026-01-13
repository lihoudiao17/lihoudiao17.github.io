/**
 * SC 晶格动画（旋转晶胞）
 * 简单立方 (Simple Cubic) 晶体结构可视化
 * 位置：左上角（替换原位错滑移面）
 */

(function () {
    'use strict';

    // 创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'sc-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // 配置参数
    const CONFIG = {
        size: 180,
        cellSize: 60,
        atomRadius: 8,
        rotationSpeed: 0.006,
        opacity: 0.75,
        atomColor: '#FFD700', // 默认金色 (深色模式)
        bondColor: 'rgba(255, 255, 255, 0.35)',
        bondWidth: 1.5
    };

    // 监听背景主题变化 (反向变色龙)
    window.addEventListener('lattice-theme-change', (e) => {
        const isDark = e.detail.isDark;
        if (isDark) {
            CONFIG.atomColor = '#FFD700';
            CONFIG.bondColor = 'rgba(255, 255, 255, 0.35)';
        } else {
            CONFIG.atomColor = '#00008B';
            CONFIG.bondColor = 'rgba(0, 0, 0, 0.4)';
        }
    });

    // 设置 Canvas 样式 - 左上角
    canvas.width = CONFIG.size;
    canvas.height = CONFIG.size;
    canvas.style.position = 'fixed';
    canvas.style.top = '15px';
    canvas.style.left = '20px';
    canvas.style.zIndex = '50';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = CONFIG.opacity;

    // SC 晶胞原子坐标（归一化 0-1）- 仅8个角原子
    const atomPositions = [
        [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
        [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]
    ];

    // 键连接 - SC 晶格的12条边
    const bonds = [
        // 底面
        [0, 1], [0, 2], [1, 4], [2, 4],
        // 顶面
        [3, 5], [3, 6], [5, 7], [6, 7],
        // 垂直边
        [0, 3], [1, 5], [2, 6], [4, 7]
    ];

    let angleY = 0;

    // 3D 投影函数
    function project(x, y, z, rotY) {
        const cx = CONFIG.cellSize * (x - 0.5);
        const cy = CONFIG.cellSize * (y - 0.5);
        const cz = CONFIG.cellSize * (z - 0.5);

        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const rx = cx * cosY - cz * sinY;
        const rz = cx * sinY + cz * cosY;

        const perspective = 300;
        const scale = perspective / (perspective + rz);

        return {
            x: CONFIG.size / 2 + rx * scale,
            y: CONFIG.size / 2 + cy * scale * 0.9,
            z: rz,
            scale: scale
        };
    }

    function draw() {
        ctx.clearRect(0, 0, CONFIG.size, CONFIG.size);

        // 计算所有原子的投影位置
        const projectedAtoms = atomPositions.map(pos =>
            project(pos[0], pos[1], pos[2], angleY)
        );

        // 按 z 排序绘制键
        const sortedBonds = [...bonds].sort((a, b) => {
            const zA = (projectedAtoms[a[0]].z + projectedAtoms[a[1]].z) / 2;
            const zB = (projectedAtoms[b[0]].z + projectedAtoms[b[1]].z) / 2;
            return zA - zB;
        });

        sortedBonds.forEach(bond => {
            const atom1 = projectedAtoms[bond[0]];
            const atom2 = projectedAtoms[bond[1]];

            ctx.beginPath();
            ctx.moveTo(atom1.x, atom1.y);
            ctx.lineTo(atom2.x, atom2.y);
            ctx.strokeStyle = CONFIG.bondColor;
            ctx.lineWidth = CONFIG.bondWidth * Math.min(atom1.scale, atom2.scale);
            ctx.stroke();
        });

        // 按 z 排序绘制原子
        const sortedAtoms = projectedAtoms
            .map((proj, i) => ({ proj, i }))
            .sort((a, b) => a.proj.z - b.proj.z);

        sortedAtoms.forEach(({ proj }) => {
            const radius = CONFIG.atomRadius * proj.scale;

            // 原子渐变
            const gradient = ctx.createRadialGradient(
                proj.x - radius * 0.3, proj.y - radius * 0.3, 0,
                proj.x, proj.y, radius
            );
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(0.3, CONFIG.atomColor);
            gradient.addColorStop(1, 'rgba(0,0,0,0.3)');

            ctx.beginPath();
            ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        // 标题 (白色高亮 + 阴影增强可读性)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = '11px "Noto Serif SC", serif';
        ctx.textAlign = 'center';
        ctx.fillText('SC Unit Cell', CONFIG.size / 2, CONFIG.size - 8);
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        angleY += CONFIG.rotationSpeed;
        requestAnimationFrame(draw);
    }

    draw();
    console.log('SC Unit Cell Animation initialized');
})();
