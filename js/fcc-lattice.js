/**
 * FCC 晶格动画
 * 面心立方 (Face-Centered Cubic) 晶体结构可视化
 * 用于桌面端装饰，展示机械工程/材料科学研究背景
 */

(function () {
    'use strict';

    // 获取或创建 Canvas
    let canvas = document.getElementById('fcc-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'fcc-canvas';
        document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');

    // 配置参数
    const CONFIG = {
        size: 200,           // Canvas 尺寸
        cellSize: 60,        // 晶胞边长（像素）
        atomRadius: 8,       // 原子半径
        rotationSpeed: 0.005, // 旋转速度（弧度/帧）
        opacity: 0.7,        // 整体透明度
        atomColor: '#FFD700', // 原子颜色（金色）
        bondColor: 'rgba(255, 255, 255, 0.4)', // 键颜色
        bondWidth: 1.5       // 键宽度
    };

    // 设置 Canvas 样式
    canvas.width = CONFIG.size;
    canvas.height = CONFIG.size;
    canvas.style.position = 'fixed';
    canvas.style.bottom = '30px';
    canvas.style.right = '30px';
    canvas.style.zIndex = '50';
    canvas.style.pointerEvents = 'none'; // 不阻挡鼠标事件
    canvas.style.opacity = CONFIG.opacity;

    // FCC 晶胞原子坐标（归一化 0-1）
    // 8个角原子 + 6个面心原子 = 14个位置
    const atomPositions = [
        // 8个角原子
        [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
        [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1],
        // 6个面心原子
        [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5],
        [1, 0.5, 0.5], [0.5, 1, 0.5], [0.5, 0.5, 1]
    ];

    // 键连接（原子索引对）- 只连接最近邻
    const bonds = [
        // 面心到角的连接
        [8, 0], [8, 1], [8, 2], [8, 4],  // 底面面心
        [9, 0], [9, 1], [9, 3], [9, 5],  // 前面面心
        [10, 0], [10, 2], [10, 3], [10, 6], // 左面面心
        [11, 1], [11, 4], [11, 5], [11, 7], // 右面面心
        [12, 2], [12, 4], [12, 6], [12, 7], // 顶面面心
        [13, 3], [13, 5], [13, 6], [13, 7]  // 后面面心
    ];

    let angleY = 0; // Y轴旋转角度
    let angleX = 0.3; // X轴倾斜角度（固定）

    // 3D 旋转变换
    function rotateY(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [
            point[0] * cos - point[2] * sin,
            point[1],
            point[0] * sin + point[2] * cos
        ];
    }

    function rotateX(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [
            point[0],
            point[1] * cos - point[2] * sin,
            point[1] * sin + point[2] * cos
        ];
    }

    // 正交投影到 2D
    function project(point) {
        const scale = CONFIG.cellSize;
        const offsetX = CONFIG.size / 2;
        const offsetY = CONFIG.size / 2;
        return [
            point[0] * scale + offsetX,
            point[1] * scale + offsetY,
            point[2] // 保留 z 用于深度排序
        ];
    }

    // 绘制单帧
    function draw() {
        ctx.clearRect(0, 0, CONFIG.size, CONFIG.size);

        // 计算所有原子的 3D 坐标（居中后旋转）
        const transformedAtoms = atomPositions.map(pos => {
            // 先居中（从 0-1 变为 -0.5 到 0.5）
            let centered = [pos[0] - 0.5, pos[1] - 0.5, pos[2] - 0.5];
            // 旋转
            centered = rotateY(centered, angleY);
            centered = rotateX(centered, angleX);
            // 投影
            return project(centered);
        });

        // 先绘制键（在原子下面）
        ctx.strokeStyle = CONFIG.bondColor;
        ctx.lineWidth = CONFIG.bondWidth;
        bonds.forEach(bond => {
            const a1 = transformedAtoms[bond[0]];
            const a2 = transformedAtoms[bond[1]];
            ctx.beginPath();
            ctx.moveTo(a1[0], a1[1]);
            ctx.lineTo(a2[0], a2[1]);
            ctx.stroke();
        });

        // 按 z 深度排序原子（远的先画）
        const sortedAtoms = transformedAtoms
            .map((atom, index) => ({ atom, index }))
            .sort((a, b) => a.atom[2] - b.atom[2]);

        // 绘制原子
        sortedAtoms.forEach(({ atom, index }) => {
            const depth = (atom[2] + 0.5) / 1; // 归一化深度 0-1
            const radius = CONFIG.atomRadius * (0.7 + depth * 0.3); // 近大远小
            const alpha = 0.5 + depth * 0.5; // 近亮远暗

            // 根据是角原子还是面心原子使用不同颜色
            const isCorner = index < 8;
            const color = isCorner ? CONFIG.atomColor : '#FFFFFF';

            ctx.beginPath();
            ctx.arc(atom[0], atom[1], radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.globalAlpha = 1;

            // 添加高光效果
            ctx.beginPath();
            ctx.arc(atom[0] - radius * 0.3, atom[1] - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
        });

        // 更新旋转角度
        angleY += CONFIG.rotationSpeed;

        requestAnimationFrame(draw);
    }

    // 启动动画
    draw();

    console.log('FCC Lattice Animation initialized');
})();
