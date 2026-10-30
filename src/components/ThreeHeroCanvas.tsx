"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeHeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return; // Fallback gracefully if WebGL is unsupported
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 24;

    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 1. Interactive 3D Particle Constellation
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const radius = 18;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius;
      const sinPhi = Math.sin(phi);

      const x = r * sinPhi * Math.cos(theta);
      const y = r * sinPhi * Math.sin(theta);
      const z = (r * Math.cos(phi)) * 0.6; // slightly flattened for depth

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      scales[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Custom circular particle texture
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(18, 57, 104, 1)");
      gradient.addColorStop(0.4, "rgba(28, 80, 145, 0.75)");
      gradient.addColorStop(1, "rgba(18, 57, 104, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.5,
      map: particleTexture,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      opacity: 0.8,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 2. Floating Delicate Wireframe Geometric Gem (Navy Blue)
    const gemGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const gemMat = new THREE.MeshBasicMaterial({
      color: 0x123968,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);

    // Initial position moved upward (above cards, aligned with hero title space)
    let baseY = 4.8;
    gemMesh.position.set(8.5, baseY, -2);
    scene.add(gemMesh);

    // Inner glowing sphere (Navy Blue)
    const innerGeo = new THREE.SphereGeometry(2.6, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0a223f,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    gemMesh.add(innerMesh);

    // Responsive positioning helper
    const updateGemPosition = () => {
      if (!mount) return;
      const width = mount.clientWidth;
      if (width < 768) {
        gemMesh.position.x = 4.0;
        baseY = 5.6;
        gemMesh.scale.set(0.65, 0.65, 0.65);
      } else if (width < 1200) {
        gemMesh.position.x = 7.5;
        baseY = 4.8;
        gemMesh.scale.set(0.85, 0.85, 0.85);
      } else {
        gemMesh.position.x = 8.5;
        baseY = 4.8;
        gemMesh.scale.set(1, 1, 1);
      }
    };
    updateGemPosition();

    // Mouse Tracking with smooth interpolation (lerp)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 1.5;
      targetY = y * 1.5;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateGemPosition();
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Rotate particle constellation
      particles.rotation.y = elapsedTime * 0.04 + mouseX * 0.4;
      particles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1 + mouseY * 0.3;

      // Rotate geometric wireframe gem
      gemMesh.rotation.x = elapsedTime * 0.1 + mouseY * 0.2;
      gemMesh.rotation.y = elapsedTime * 0.14 + mouseX * 0.2;
      gemMesh.position.y = baseY + Math.sin(elapsedTime * 0.8) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      gemGeo.dispose();
      gemMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
      aria-hidden="true"
    />
  );
}
