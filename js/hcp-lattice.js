/**
 * HCP 晶格动画（旋转晶胞）
 * 密排六方 (Hexagonal Close-Packed) 晶体结构可视化
 * 位置：左侧中下部 (Top 55%)
 */

(function () {
    'use strict';

    // 创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'hcp-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // 配置参数
    const CONFIG = {
        size: 170,          // 适中尺寸
        cellSize: 35,       // 六边形边长
        heightScale: 1.633, // c/a 轴比，理想比值 1.633
        atomRadius: 6,
        rotationSpeed: 0.007,
        opacity: 0.75,
        atomColor: '#FFD700', // 金色
        bondColor: 'rgba(255, 255, 255, 0.35)',
        bondWidth: 1.2
    };

    // 设置 Canvas 样式
    canvas.width = CONFIG.size;
    canvas.height = CONFIG.size;
    canvas.style.position = 'fixed';
    canvas.style.top = '55%';   // 位于 BCC 下方，FCC 上方
    canvas.style.left = '25px'; // 左侧对齐
    canvas.style.zIndex = '50';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = CONFIG.opacity;

    // HCP 晶胞生成逻辑
    // 底面正六边形 + 顶面正六边形 + 中间层 3 个原子
    const atomPositions = [];

    // 辅助函数：根据角度生成六边形顶点 (ratio=1 为外接圆半径)
    function hexVertex(angleDeg, z) {
        const rad = angleDeg * Math.PI / 180;
        return [Math.cos(rad), Math.sin(rad), z];
    }

    // 1. 底面 (z=0) - 7个原子 (中心+6角)
    atomPositions.push([0, 0, 0]); // 中心
    for (let i = 0; i < 6; i++) {
        atomPositions.push(hexVertex(i * 60, 0));
    }

    // 2. 顶面 (z=height) - 7个原子
    const h = CONFIG.heightScale * 1.0; // 稍作归一化处理
    atomPositions.push([0, 0, h]); // 中心
    for (let i = 0; i < 6; i++) {
        atomPositions.push(hexVertex(i * 60, h));
    }

    // 3. 中间层 (z=h/2) - 3个原子 (位于底面三角形空隙上方)
    // 角度分别为 30, 150, 270 度
    const midZ = h / 2;
    // 修正：HCP中间层原子的投影位置是底面相隔三角形的重心
    // 对应角度 0, 120, 240 是A层原子，则B层在 60, 180, 300 还是 30? 
    // 标准HCP中间层投影位置为：(1/3, 2/3) 或极坐标下的特定位置
    // 简单起见，取 90, 210, 330 或者 30, 150, 270 (基于正三角形中心)
    // 边长为1，中心到顶点距离1。重心距离中心 1/sqrt(3) ≈ 0.577 or similar.
    // 简单视觉模拟：使用 0.577 半径，角度 30, 150, 270
    const midR = 0.577;
    atomPositions.push([midR * Math.cos(30 * Math.PI / 180), midR * Math.sin(30 * Math.PI / 180), midZ]);
    atomPositions.push([midR * Math.cos(150 * Math.PI / 180), midR * Math.sin(150 * Math.PI / 180), midZ]);
    atomPositions.push([midR * Math.cos(270 * Math.PI / 180), midR * Math.sin(270 * Math.PI / 180), midZ]);


    // 键连接
    const bonds = [];

    // 底面连接 (中心连6角，6角顺次连)
    for (let i = 1; i <= 6; i++) {
        bonds.push([0, i]); // 中心连角
        bonds.push([i, i === 6 ? 1 : i + 1]); // 角边框
    }

    // 顶面连接 (同底面，索引偏移7)
    for (let i = 8; i <= 13; i++) {
        bonds.push([7, i]);
        bonds.push([i, i === 13 ? 8 : i + 1]);
    }

    // 垂直棱 (6条)
    for (let i = 1; i <= 6; i++) {
        bonds.push([i, i + 7]);
    }

    // 中间层连接 (视觉上连一下，不用太严谨的物理键，为了整体感)
    // 3个中间原子互相不连，但连接此层的上下原子？太乱，仅显示原子即可，或者连到中心轴
    // 为了视觉简洁，HCP通常只画六方柱框，中间原子悬浮

    let angleY = 0;
    const angleX = 0.45; // 稍微俯视多一点

    function rotateY(point, angle) {
        const cos = Math.cos(angle), sin = Math.sin(angle);
        return [point[0] * cos - point[2] * sin, point[1], point[0] * sin + point[2] * cos];
    }

    function rotateX(point, angle) {
        const cos = Math.cos(angle), sin = Math.sin(angle);
        return [point[0], point[1] * cos - point[2] * sin, point[1] * sin + point[2] * cos];
    }

    function project(point) {
        // HCP 居中偏移修正
        return [
            point[0] * CONFIG.cellSize + CONFIG.size / 2,
            point[1] * CONFIG.cellSize + CONFIG.size / 2,
            point[2] * CONFIG.cellSize - (CONFIG.size * 0.2) // 垂直居中修正
        ];
    }

    function draw() {
        ctx.clearRect(0, 0, CONFIG.size, CONFIG.size);

        const transformedAtoms = atomPositions.map(pos => {
            // 中心化 (底面中心已经是0,0，Z轴向上)
            // 需要将整体中心移到 (0,0, h/2)
            let centered = [pos[0], pos[1], pos[2] - (CONFIG.heightScale * 1.0) / 2];
            centered = rotateY(centered, angleY);
            centered = rotateX(centered, angleX);
            return project(centered);
        });

        // 绘制键
        ctx.strokeStyle = CONFIG.bondColor;
        ctx.lineWidth = CONFIG.bondWidth;
        bonds.forEach(bond => {
            ctx.beginPath();
            ctx.moveTo(transformedAtoms[bond[0]][0], transformedAtoms[bond[0]][1]);
            ctx.lineTo(transformedAtoms[bond[1]][0], transformedAtoms[bond[1]][1]);
            ctx.stroke();
        });

        // 按深度排序绘制原子
        const sortedAtoms = transformedAtoms.map((pos, index) => ({ pos, index }))
            .sort((a, b) => a.pos[2] - b.pos[2]);

        sortedAtoms.forEach(item => {
            // 中间层原子(后3个)稍微区别显示？统一金色即可
            const [x, y, z] = item.pos;
            // 简单的深度缩放效果
            // z 值大概在 -cellSize 到 +cellSize 之间
            const depthFactor = z / (CONFIG.cellSize * 3); // 归一化深度

            const scale = 1 + depthFactor;
            const radius = CONFIG.atomRadius * scale;
            const alpha = 0.7 + depthFactor * 0.3;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = CONFIG.atomColor;
            ctx.globalAlpha = Math.max(0.2, Math.min(1, alpha));
            ctx.fill();

            // 高光
            ctx.beginPath();
            ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
        });

        ctx.globalAlpha = 1; // 重置全局透明度

        // 标题
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '11px "Noto Serif SC", serif';
        ctx.textAlign = 'center';
        ctx.fillText('HCP Unit Cell', CONFIG.size / 2, CONFIG.size - 8);

        angleY += CONFIG.rotationSpeed;
        requestAnimationFrame(draw);
    }

    draw();
})();
