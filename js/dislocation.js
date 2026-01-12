/**
 * FCC 位错三维示意图
 * 基于 Three.js 的交互式 3D 可视化
 * 位置：右下角
 */

(function () {
    'use strict';

    // 检查 Three.js 是否已加载
    if (typeof THREE === 'undefined') {
        console.log('Loading Three.js...');

        // 加载 Three.js
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.109.0/build/three.min.js';
        threeScript.onload = function () {
            // 加载 OrbitControls
            const controlsScript = document.createElement('script');
            controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.109.0/examples/js/controls/OrbitControls.js';
            controlsScript.onload = initScene;
            document.head.appendChild(controlsScript);
        };
        document.head.appendChild(threeScript);
    } else {
        initScene();
    }

    function initScene() {
        // 配置
        const CONFIG = {
            size: 280,
            opacity: 0.9
        };

        // 创建容器
        const container = document.createElement('div');
        container.id = 'dislocation-3d';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            left: 20px;
            width: ${CONFIG.size}px;
            height: ${CONFIG.size}px;
            z-index: 50;
            border-radius: 8px;
            overflow: hidden;
            opacity: ${CONFIG.opacity};
            pointer-events: auto;
        `;
        document.body.appendChild(container);

        // 场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        // 相机
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        camera.position.set(3, 2.5, 4);

        // 渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(CONFIG.size, CONFIG.size);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // 控制器（可拖拽旋转）
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false; // 禁用缩放
        controls.enablePan = false;  // 禁用平移
        controls.autoRotate = true;  // 自动旋转
        controls.autoRotateSpeed = 1.5;

        // 光照
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040, 0.6));

        // 坐标轴（缩短）
        const axesHelper = new THREE.AxesHelper(1.2);
        scene.add(axesHelper);

        // 晶胞框架
        const boxGeom = new THREE.BoxGeometry(2, 2, 2);
        const edges = new THREE.EdgesGeometry(boxGeom);
        const cubeEdges = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x888888 }));
        scene.add(cubeEdges);

        // {111} 滑移面
        function createSlipPlane(normal, color) {
            const size = 2.3;
            const geom = new THREE.PlaneGeometry(size, size);
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.15
            });
            const plane = new THREE.Mesh(geom, mat);

            const up = new THREE.Vector3(0, 0, 1);
            const n = new THREE.Vector3(normal[0], normal[1], normal[2]).normalize();
            const axis = new THREE.Vector3().crossVectors(up, n).normalize();
            const angle = Math.acos(up.dot(n));
            if (axis.length() > 0) {
                plane.rotateOnAxis(axis, angle);
            }

            scene.add(plane);
        }

        createSlipPlane([1, 1, 1], 0xff4444);   // 红色
        createSlipPlane([-1, 1, 1], 0x44ff44);  // 绿色
        createSlipPlane([1, -1, 1], 0x4444ff);  // 蓝色
        createSlipPlane([1, 1, -1], 0xffff44);  // 黄色

        // 位错线
        function createDislocation(points, color, lineWidth) {
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: color, linewidth: lineWidth || 2 });
            const line = new THREE.Line(geometry, material);
            scene.add(line);
        }

        // 多条位错线
        createDislocation([new THREE.Vector3(-1, -0.5, 0.5), new THREE.Vector3(0.5, 0.5, -0.5)], 0xff8800);
        createDislocation([new THREE.Vector3(-0.5, 1, -0.5), new THREE.Vector3(0.5, -1, 0.5)], 0x00ffff);
        createDislocation([new THREE.Vector3(-1, 0.8, 0.8), new THREE.Vector3(1, -0.8, -0.8)], 0xff00ff);
        createDislocation([new THREE.Vector3(0.8, -1, 0.8), new THREE.Vector3(-0.8, 1, -0.8)], 0xffffff);

        // 添加标题
        const title = document.createElement('div');
        title.textContent = 'FCC {111} Slip Systems';
        title.style.cssText = `
            position: absolute;
            bottom: 5px;
            left: 0;
            right: 0;
            text-align: center;
            color: rgba(255,255,255,0.7);
            font-size: 11px;
            font-family: "Noto Serif SC", serif;
            pointer-events: none;
        `;
        container.appendChild(title);

        // 动画循环
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        console.log('FCC 3D Dislocation Visualization initialized');
    }
})();
