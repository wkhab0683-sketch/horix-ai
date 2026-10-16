import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { VisualizerMode } from '../types';

interface ThreeCanvasProps {
  isGenerating: boolean;
  visualizerMode: VisualizerMode;
  theme: 'dark' | 'light';
  className?: string;
  intensity?: number;
}

// Reusable math objects at module scope for zero GC during animation loop
const _vec3 = new THREE.Vector3();
const _euler = new THREE.Euler();

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  isGenerating,
  visualizerMode,
  theme,
  className = '',
  intensity = 1.0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    isGenerating,
    visualizerMode,
    theme,
    intensity,
    targetRotX: 0,
    targetRotY: 0,
    currentRotX: 0,
    currentRotY: 0,
    isDragging: false,
    prevPointerX: 0,
    prevPointerY: 0,
  });

  // Sync props to mutable ref for the continuous animation loop
  useEffect(() => {
    stateRef.current.isGenerating = isGenerating;
    stateRef.current.visualizerMode = visualizerMode;
    stateRef.current.theme = theme;
    stateRef.current.intensity = intensity;
  }, [isGenerating, visualizerMode, theme, intensity]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // 1. Scene, Camera, and Modern Renderer Pipeline
    const scene = new THREE.Scene();
    const isDark = stateRef.current.theme === 'dark';
    scene.background = null; // Transparent canvas to sit elegantly in layout

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const isHeadless = typeof navigator !== 'undefined' && (/HeadlessChrome/i.test(navigator.userAgent) || (navigator as any).webdriver);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.25 : 1.1;
    container.appendChild(renderer.domElement);

    // 2. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Balanced Studio Rig
    const ambientLight = new THREE.AmbientLight(isDark ? 0x222222 : 0x888888, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5dd, isDark ? 2.8 : 2.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7090b0, isDark ? 1.4 : 1.0);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xe5c07b, isDark ? 3.0 : 1.8, 10);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // 4. Composite 3D Hierarchy (Hero Procedural JAVIRUS Assembly)
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Procedural Materials
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.94,
      roughness: 0.18,
      clearcoat: 0.4,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
    });

    const platinumMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xccd6e0,
      metalness: 0.9,
      roughness: 0.22,
      clearcoat: 0.3,
    });

    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a2638,
      emissive: 0x1f385c,
      emissiveIntensity: 0.4,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.88,
      ior: 1.6,
      transparent: true,
      opacity: 0.85,
    });

    const wireframeGoldMat = new THREE.MeshBasicMaterial({
      color: 0xf3e5ab,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    // Sub-assembly 1: Inner Core (Faceted Icosahedron Crystal + Wireframe halo)
    const coreGroup = new THREE.Group();
    const coreGeom = new THREE.IcosahedronGeometry(0.85, 1);
    const coreMesh = new THREE.Mesh(coreGeom, crystalMaterial);
    coreGroup.add(coreMesh);

    const coreWireGeom = new THREE.IcosahedronGeometry(0.87, 1);
    const coreWireMesh = new THREE.Mesh(coreWireGeom, wireframeGoldMat);
    coreGroup.add(coreWireMesh);
    masterGroup.add(coreGroup);

    // Sub-assembly 2: Gimbal Ring 1 (Equatorial Brushed Gold Torus)
    const ring1Geom = new THREE.TorusGeometry(1.42, 0.035, 24, 80);
    const ring1 = new THREE.Mesh(ring1Geom, goldMaterial);
    masterGroup.add(ring1);

    // Sub-assembly 3: Gimbal Ring 2 (Orbital Meridian Ring)
    const ring2Geom = new THREE.TorusGeometry(1.68, 0.028, 24, 80);
    const ring2 = new THREE.Mesh(ring2Geom, platinumMaterial);
    ring2.rotation.x = Math.PI / 3;
    masterGroup.add(ring2);

    // Sub-assembly 4: Gimbal Ring 3 (Outer Horizon Ring with tick nodes)
    const ring3Geom = new THREE.TorusGeometry(1.95, 0.022, 20, 80);
    const ring3 = new THREE.Mesh(ring3Geom, goldMaterial);
    ring3.rotation.y = Math.PI / 4;
    masterGroup.add(ring3);

    // Sub-assembly 5: Quantum Node Satellites (Instanced orbital points)
    const nodeCount = 18;
    const nodeGeom = new THREE.SphereGeometry(0.045, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffe899,
      emissive: 0xd4af37,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const nodesGroup = new THREE.Group();
    const nodeMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const mesh = new THREE.Mesh(nodeGeom, nodeMat);
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 1.42 + (i % 3) * 0.26;
      mesh.position.set(Math.cos(angle) * radius, (Math.sin(i) * 0.4), Math.sin(angle) * radius);
      nodesGroup.add(mesh);
      nodeMeshes.push(mesh);
    }
    masterGroup.add(nodesGroup);

    // Sub-assembly 6: Ground Contact Shadow Disc
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)');
      grad.addColorStop(0.5, isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: isDark ? 0.6 : 0.4,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.1;
    scene.add(shadowPlane);

    // Pointer Interaction Handling (Inspection Drag & Tilt)
    const onPointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevPointerX = e.clientX;
      stateRef.current.prevPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (stateRef.current.isDragging) {
        const dx = e.clientX - stateRef.current.prevPointerX;
        const dy = e.clientY - stateRef.current.prevPointerY;
        stateRef.current.targetRotY += dx * 0.008;
        stateRef.current.targetRotX += dy * 0.008;
        stateRef.current.prevPointerX = e.clientX;
        stateRef.current.prevPointerY = e.clientY;
      } else {
        // Subtle ambient parallax follow
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        stateRef.current.targetRotY = normX * 0.4;
        stateRef.current.targetRotX = -normY * 0.3;
      }
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Pre-warm renderer
    renderer.compile(scene, camera);

    // 5. High-Fidelity Render Loop with Exponential Damping
    const clock = new THREE.Clock();
    let totalTime = 0;

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      totalTime += delta;

      const { isGenerating, visualizerMode, intensity } = stateRef.current;
      const speedMultiplier = (isGenerating ? 2.6 : 1.0) * intensity;

      // Exponential damping on user camera tilt / rotation
      stateRef.current.currentRotX = THREE.MathUtils.damp(
        stateRef.current.currentRotX,
        stateRef.current.targetRotX,
        4.0,
        delta
      );
      stateRef.current.currentRotY = THREE.MathUtils.damp(
        stateRef.current.currentRotY,
        stateRef.current.targetRotY,
        4.0,
        delta
      );

      masterGroup.rotation.x = stateRef.current.currentRotX;
      masterGroup.rotation.y = stateRef.current.currentRotY + totalTime * 0.12 * speedMultiplier;

      // Kinematic multi-axis rotation per visualizer mode
      if (visualizerMode === 'chrono_orb') {
        coreGroup.rotation.y = -totalTime * 0.4 * speedMultiplier;
        coreGroup.rotation.z = Math.sin(totalTime * 0.6) * 0.15;
        ring1.rotation.z += 0.008 * speedMultiplier;
        ring2.rotation.x += 0.012 * speedMultiplier;
        ring3.rotation.y -= 0.009 * speedMultiplier;

        // Dynamic scale breathing
        const breath = 1.0 + Math.sin(totalTime * 2.2 * speedMultiplier) * (isGenerating ? 0.06 : 0.02);
        coreMesh.scale.set(breath, breath, breath);
      } else if (visualizerMode === 'singularity') {
        coreGroup.rotation.x = totalTime * 0.5 * speedMultiplier;
        coreGroup.rotation.y = totalTime * 0.7 * speedMultiplier;
        ring1.rotation.x = Math.PI / 2 + Math.sin(totalTime * 1.5) * 0.3;
        ring2.rotation.y = Math.cos(totalTime * 1.2) * 0.3;
        ring3.rotation.z = totalTime * 0.2;
      } else if (visualizerMode === 'aura_wave') {
        const wave = Math.sin(totalTime * 3.0 * speedMultiplier);
        ring1.scale.setScalar(1.0 + wave * 0.05);
        ring2.scale.setScalar(1.0 - wave * 0.05);
        ring3.scale.setScalar(1.0 + wave * 0.08);
      }

      // Orbital satellite node movement
      for (let i = 0; i < nodeCount; i++) {
        const mesh = nodeMeshes[i];
        const offset = (i / nodeCount) * Math.PI * 2;
        const currentAngle = offset + totalTime * 0.45 * speedMultiplier * ((i % 2 === 0) ? 1 : -1);
        const radius = 1.42 + (i % 3) * 0.25;
        mesh.position.x = Math.cos(currentAngle) * radius;
        mesh.position.z = Math.sin(currentAngle) * radius;
        mesh.position.y = Math.sin(totalTime * 1.5 + i) * 0.35;
      }

      // Active luminescence pulse during thinking
      if (isGenerating) {
        crystalMaterial.emissiveIntensity = 0.5 + Math.sin(totalTime * 8) * 0.35;
        wireframeGoldMat.opacity = 0.45 + Math.sin(totalTime * 6) * 0.25;
      } else {
        crystalMaterial.emissiveIntensity = 0.3 + Math.sin(totalTime * 1.8) * 0.1;
        wireframeGoldMat.opacity = 0.3;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    // Cleanup resources
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      coreGeom.dispose();
      coreWireGeom.dispose();
      ring1Geom.dispose();
      ring2Geom.dispose();
      ring3Geom.dispose();
      nodeGeom.dispose();
      shadowPlane.geometry.dispose();

      goldMaterial.dispose();
      platinumMaterial.dispose();
      crystalMaterial.dispose();
      wireframeGoldMat.dispose();
      nodeMat.dispose();
      shadowTexture.dispose();

      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden ${className}`}
      title="Click and drag to rotate the JAVIRUS 3D neural core"
    />
  );
};
