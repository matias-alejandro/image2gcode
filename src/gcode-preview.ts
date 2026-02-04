import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class GCodeRenderer {
    private canvas: HTMLCanvasElement;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private lineGroup: THREE.Group;
    private labelGroup: THREE.Group;
    private gridHelper?: THREE.GridHelper;
    private axesHelper?: THREE.AxesHelper;
    private showGrid: boolean = true;
    private showAxes: boolean = true;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);

        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
        this.camera.position.set(150, -150, 85);
        this.camera.up.set(0, 0, 1);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        this.lineGroup = new THREE.Group();
        this.scene.add(this.lineGroup);

        this.labelGroup = new THREE.Group();
        this.scene.add(this.labelGroup);

        const gridSize = 1000;
        const gridDivisions = 100;

        this.gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x222222);
        this.gridHelper.rotation.x = Math.PI / 2;
        this.gridHelper.visible = this.showGrid;
        this.scene.add(this.gridHelper);

        this.axesHelper = new THREE.AxesHelper(100);
        this.axesHelper.visible = this.showAxes;
        this.scene.add(this.axesHelper);

        this.addGridLabels(gridSize, gridDivisions);

        window.addEventListener('resize', () => this.resize());
        this.animate();
        setTimeout(() => this.resize(), 100);
    }

    updateGrid(size: number, divisions: number) {
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
            this.gridHelper.geometry.dispose();
            if (Array.isArray(this.gridHelper.material)) {
                this.gridHelper.material.forEach(m => m.dispose());
            } else {
                this.gridHelper.material.dispose();
            }
        }

        while (this.labelGroup.children.length > 0) {
            const child = this.labelGroup.children[0];
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
            this.labelGroup.remove(child);
        }

        this.gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
        this.gridHelper.rotation.x = Math.PI / 2;
        this.gridHelper.visible = this.showGrid;
        this.scene.add(this.gridHelper);
        this.labelGroup.visible = this.showGrid;

        this.addGridLabels(size, divisions);
    }

    setGridVisibility(visible: boolean) {
        this.showGrid = visible;
        if (this.gridHelper) {
            this.gridHelper.visible = visible;
        }
        this.labelGroup.visible = visible;
    }

    setAxesVisibility(visible: boolean) {
        this.showAxes = visible;
        if (this.axesHelper) {
            this.axesHelper.visible = visible;
        }
    }

    private addGridLabels(size: number, divisions: number) {
        const step = size / divisions;
        const halfSize = size / 2;

        for (let i = 0; i <= divisions; i += 5) {
            const pos = i * step - halfSize;

            this.labelGroup.add(this.createTextLabel(`${pos}`, pos, 2, 0));

            if (pos !== 0) {
                this.labelGroup.add(this.createTextLabel(`${pos}`, 2, pos, 0));
            }
        }
    }

    private createTextLabel(text: string, x: number, y: number, z: number) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = 128;
        canvas.height = 64;

        context.fillStyle = 'rgba(255, 255, 255, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = 'Bold 28px Arial';
        context.fillStyle = '#666666';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 64, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        const geometry = new THREE.PlaneGeometry(20, 10);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(x, y, z + 0.1);

        return mesh;
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    render(gcode: string) {
        while (this.lineGroup.children.length > 0) {
            const child = this.lineGroup.children[0];
            if (child instanceof THREE.Line || child instanceof THREE.LineSegments) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
            this.lineGroup.remove(child);
        }

        let g1Points: THREE.Vector3[] = [];
        const movePoints: THREE.Vector3[] = [];

        let curX = 0;
        let curY = 0;
        let curZ = 0;

        const lines = gcode.split('\n');

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const cmd = parts[0];

            if (cmd === 'G0' || cmd === 'G1') {
                let x = curX;
                let y = curY;
                let z = curZ;
                let hasXYZ = false;

                for (let i = 1; i < parts.length; i++) {
                    const part = parts[i];
                    if (part.startsWith('X')) {
                        x = parseFloat(part.substring(1));
                        hasXYZ = true;
                    } else if (part.startsWith('Y')) {
                        y = parseFloat(part.substring(1));
                        hasXYZ = true;
                    } else if (part.startsWith('Z')) {
                        z = parseFloat(part.substring(1));
                        hasXYZ = true;
                    }
                }

                if (hasXYZ) {
                    const nextPoint = new THREE.Vector3(x, y, z);

                    if (cmd === 'G0') {
                        if (g1Points.length > 1) {
                            this.addPath(g1Points, 0x646cff);
                        }
                        g1Points = [];
                        movePoints.push(new THREE.Vector3(curX, curY, curZ));
                        movePoints.push(nextPoint);
                    } else {
                        if (g1Points.length === 0) {
                            g1Points.push(new THREE.Vector3(curX, curY, curZ));
                        }
                        g1Points.push(nextPoint);
                    }

                    curX = x;
                    curY = y;
                    curZ = z;

                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    minZ = Math.min(minZ, z);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                    maxZ = Math.max(maxZ, z);
                }
            }
        }

        if (g1Points.length > 1) {
            this.addPath(g1Points, 0x646cff);
        }

        if (movePoints.length > 0) {
            const moveGeometry = new THREE.BufferGeometry().setFromPoints(movePoints);
            const moveMaterial = new THREE.LineDashedMaterial({
                color: 0x666666,
                dashSize: 1,
                gapSize: 0.5
            });
            const moveLines = new THREE.LineSegments(moveGeometry, moveMaterial);
            moveLines.computeLineDistances();
            this.lineGroup.add(moveLines);
        }

        this.resize();
    }

    private addPath(points: THREE.Vector3[], color: number) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: color });
        const line = new THREE.Line(geometry, material);
        this.lineGroup.add(line);
    }

    private resize() {
        const rect = this.canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            this.renderer.setSize(rect.width, rect.height);
            this.camera.aspect = rect.width / rect.height;
            this.camera.updateProjectionMatrix();
        }
    }
}
