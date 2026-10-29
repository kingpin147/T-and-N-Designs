"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

export default function ThreeCanvasHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. 3D Cyber Core Group
    const cyberCoreGroup = new THREE.Group();
    scene.add(cyberCoreGroup);

    // A. Outer Wireframe Holographic Icosahedron
    const outerGeo = new THREE.IcosahedronGeometry(2.1, 2);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    cyberCoreGroup.add(outerMesh);

    // B. Inner Glowing Quantum Nucleus
    const innerGeo = new THREE.OctahedronGeometry(1.2, 3);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0xec4899,
      emissive: 0xdb2777,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    cyberCoreGroup.add(innerMesh);

    // C. Dual Orbiting Gyroscope Rings (Torus)
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.035, 16, 100), ringMat1);
    cyberCoreGroup.add(ring1);

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.9,
    });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.025, 16, 100), ringMat2);
    ring2.rotation.x = Math.PI / 2;
    cyberCoreGroup.add(ring2);

    // D. Particle Constellation Field (1,200 Star Particles)
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x38bdf8);
    const color2 = new THREE.Color(0xec4899);
    const color3 = new THREE.Color(0xa855f7);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3;
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 3. Dynamic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x06b6d4, 3, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 3, 20);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    // 4. Mouse Interactive Parallax & Orbit Tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      targetX = x * 1.4;
      targetY = y * 1.4;

      if (isMouseDown) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        cyberCoreGroup.rotation.y += deltaX * 0.008;
        cyberCoreGroup.rotation.x += deltaY * 0.008;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      setIsInteracting(true);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isMouseDown = false;
      setIsInteracting(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        targetX = ((touch.clientX - rect.left) / rect.width - 0.5) * 1.5;
        targetY = ((touch.clientY - rect.top) / rect.height - 0.5) * 1.5;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // 5. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // 6. Smooth 60FPS Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera / group rotation damping (lerp)
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (!isMouseDown) {
        cyberCoreGroup.rotation.y = elapsedTime * 0.25 + currentX * 1.2;
        cyberCoreGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.2 + currentY * 1.2;
      }

      // Outer wireframe breathing scale
      const outerScale = 1 + Math.sin(elapsedTime * 1.5) * 0.04;
      outerMesh.scale.set(outerScale, outerScale, outerScale);

      // Inner nucleus counter-rotation
      innerMesh.rotation.y = -elapsedTime * 0.6;
      innerMesh.rotation.z = Math.cos(elapsedTime * 0.4) * 0.3;

      // Gyroscope ring independent rotations
      ring1.rotation.z = elapsedTime * 0.45;
      ring1.rotation.x = Math.sin(elapsedTime * 0.3) * 0.5;

      ring2.rotation.y = elapsedTime * 0.35;
      ring2.rotation.z = Math.cos(elapsedTime * 0.25) * 0.4;

      // Particle constellation subtle orbital rotation
      particleSystem.rotation.y = -elapsedTime * 0.06;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.05) * 0.05;

      // Dynamic light orbit
      pointLight1.position.x = Math.sin(elapsedTime * 0.8) * 6;
      pointLight1.position.z = Math.cos(elapsedTime * 0.8) * 6;

      pointLight2.position.x = -Math.sin(elapsedTime * 0.6) * 5;
      pointLight2.position.z = -Math.cos(elapsedTime * 0.6) * 5;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "420px" }}>
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
          cursor: isInteracting ? "grabbing" : "grab",
        }}
      />

      {/* Interactive 3D Status Overlay Pill */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: "999px",
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          pointerEvents: "none",
          fontSize: "12px",
          color: "#e2e8f0",
          boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#06b6d4",
            boxShadow: "0 0 10px #06b6d4",
          }}
        />
        <span>Interactive 3D WebGL Core • Click &amp; Drag to Orbit</span>
      </motion.div>
    </div>
  );
}

