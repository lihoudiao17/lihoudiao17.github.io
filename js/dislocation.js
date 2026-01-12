/**
 * 边缘位错滑移动画
 * Edge Dislocation Glide Animation
 * 位置：右下角
 */

(function () {
    'use strict';

    // 创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'dislocation-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // 配置参数
    const CONFIG = {
        size: 240,
        cellSize: 20,
        atomRadius: 4.5,
        opacity: 0.8,
        atomColor: '#FFD700',
        dislocationColor: '#FF4444',
        bondColor: 'rgba(255, 255, 255, 0.2)',
        bondWidth: 0.8,
        gridRows: 7,
        gridCols: 9,
        dislocationSpeed: 0.012
    };

    // 设置 Canvas 样式
    canvas.width = CONFIG.size;
    canvas.height = CONFIG.size;
    canvas.style.position = 'fixed';
    canvas.style.bottom = '25px';
    canvas.style.right = '25px';  // 右下角
    canvas.style.zIndex = '50';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = CONFIG.opacity;

    // 位错状态
    let dislocationX = 0;
    let dislocationDirection = 1;

    // 创建晶格
    function createLattice() {
        const atoms = [];
        const startX = 25;
        const startY = 35;

        for (let row = 0; row < CONFIG.gridRows; row++) {
            for (let col = 0; col < CONFIG.gridCols; col++) {
                const offsetX = (row % 2) * (CONFIG.cellSize / 2);
                atoms.push({
                    baseX: startX + col * CONFIG.cellSize + offsetX,
                    baseY: startY + row * CONFIG.cellSize * 0.866,
                    row, col, x: 0, y: 0
                });
            }
        }

        // 额外半平面原子
        const extraRow = Math.floor(CONFIG.gridRows / 2);
        for (let col = 0; col < Math.floor(CONFIG.gridCols / 2); col++) {
            const offsetX = (extraRow % 2) * (CONFIG.cellSize / 2);
            atoms.push({
                baseX: startX + col * CONFIG.cellSize + offsetX - CONFIG.cellSize / 2,
                baseY: startY + extraRow * CONFIG.cellSize * 0.866 - CONFIG.cellSize * 0.433,
                row: extraRow - 0.5, col: col - 0.5,
                isExtra: true, x: 0, y: 0
            });
        }

        return atoms;
    }

    const atoms = createLattice();

    function calculateDisplacement(atom, dislocationPos) {
        const coreX = 25 + dislocationPos * (CONFIG.gridCols - 1) * CONFIG.cellSize;
        const dx = atom.baseX - coreX;
        const midY = 35 + (CONFIG.gridRows / 2) * CONFIG.cellSize * 0.866;
        const dy = atom.baseY - midY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / (CONFIG.cellSize * 3));
        const sign = dy < 0 ? 1 : -1;

        let dispX = 0;
        if (atom.isExtra) {
            if (atom.baseX < coreX - CONFIG.cellSize / 2) {
                dispX = CONFIG.cellSize;
            }
        } else {
            dispX = sign * influence * CONFIG.cellSize * 0.25;
        }

        const dispY = influence * Math.abs(dx) < CONFIG.cellSize ?
            -Math.abs(dy) * 0.04 * influence : 0;

        return { x: dispX, y: dispY };
    }

    function draw() {
        ctx.clearRect(0, 0, CONFIG.size, CONFIG.size);

        // 更新位错位置
        dislocationX += CONFIG.dislocationSpeed * dislocationDirection;
        if (dislocationX > 1) { dislocationX = 1; dislocationDirection = -1; }
        else if (dislocationX < 0) { dislocationX = 0; dislocationDirection = 1; }

        // 计算原子位置
        atoms.forEach(atom => {
            const disp = calculateDisplacement(atom, dislocationX);
            atom.x = atom.baseX + disp.x;
            atom.y = atom.baseY + disp.y;
        });

        // 绘制键
        ctx.strokeStyle = CONFIG.bondColor;
        ctx.lineWidth = CONFIG.bondWidth;
        for (let i = 0; i < atoms.length; i++) {
            for (let j = i + 1; j < atoms.length; j++) {
                const dx = atoms[i].x - atoms[j].x;
                const dy = atoms[i].y - atoms[j].y;
                if (Math.sqrt(dx * dx + dy * dy) < CONFIG.cellSize * 1.15) {
                    ctx.beginPath();
                    ctx.moveTo(atoms[i].x, atoms[i].y);
                    ctx.lineTo(atoms[j].x, atoms[j].y);
                    ctx.stroke();
                }
            }
        }

        // 滑移面
        const midY = 35 + (CONFIG.gridRows / 2) * CONFIG.cellSize * 0.866;
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(15, midY);
        ctx.lineTo(CONFIG.size - 15, midY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制原子
        const coreX = 25 + dislocationX * (CONFIG.gridCols - 1) * CONFIG.cellSize;
        atoms.forEach(atom => {
            const distToCore = Math.abs(atom.x - coreX);
            const nearCore = distToCore < CONFIG.cellSize * 1.3 &&
                Math.abs(atom.y - midY) < CONFIG.cellSize * 1.3;

            const color = (nearCore || atom.isExtra) ? CONFIG.dislocationColor : CONFIG.atomColor;
            const radius = atom.isExtra ? CONFIG.atomRadius * 1.15 : CONFIG.atomRadius;

            ctx.beginPath();
            ctx.arc(atom.x, atom.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(atom.x - radius * 0.3, atom.y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
        });

        // 位错符号
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⊥', coreX, midY + 30);

        // 标题
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '11px "Noto Serif SC", serif';
        ctx.textAlign = 'center';
        ctx.fillText('Edge Dislocation Glide', CONFIG.size / 2, CONFIG.size - 8);

        requestAnimationFrame(draw);
    }

    draw();
    console.log('Edge Dislocation Animation initialized');
})();
