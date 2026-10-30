"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function InteractiveStone404() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 340;
    let height = container.clientHeight || 260;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.8);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Central Wireframe Geometric Gem Group (Matching Homepage & Other Pages)
    const gemGroup = new THREE.Group();
    scene.add(gemGroup);

    // A. Outer Wireframe Icosahedron Gem (Matching ThreeHeroCanvas)
    const outerGeo = new THREE.IcosahedronGeometry(1.75, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x0a2540, // Signature Brand Navy Blue
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    gemGroup.add(outerMesh);

    // B. Subtle Vertex Node Points on the Gem Joint Corners
    const pointMat = new THREE.PointsMaterial({
      color: 0x0a2540,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const outerPoints = new THREE.Points(outerGeo, pointMat);
    gemGroup.add(outerPoints);

    // C. Concentric Inner Wireframe Sphere
    const innerGeo = new THREE.SphereGeometry(1.15, 20, 20);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x06182c,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    gemGroup.add(innerMesh);

    // D. Core Geometric Octahedron Nucleus
    const coreGeo = new THREE.OctahedronGeometry(0.65, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x0a2540,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    gemGroup.add(coreMesh);

    // 3. Floating Soft Circular Particle Constellation (Matching ThreeHeroCanvas)
    const particleCount = 85;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleOriginals = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    const radius = 3.6;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.cbrt(Math.random()) * (radius - 2.0);
      const sinPhi = Math.sin(phi);

      const x = r * sinPhi * Math.cos(theta);
      const y = r * sinPhi * Math.sin(theta);
      const z = r * Math.cos(phi) * 0.7;

      particlePositions[i3] = x;
      particlePositions[i3 + 1] = y;
      particlePositions[i3 + 2] = z;

      particleOriginals[i3] = x;
      particleOriginals[i3 + 1] = y;
      particleOriginals[i3 + 2] = z;

      particleSpeeds[i] = 0.5 + Math.random() * 1.0;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    // Custom circular radial gradient texture
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(10, 37, 64, 0.95)");
      gradient.addColorStop(0.4, "rgba(18, 51, 86, 0.65)");
      gradient.addColorStop(1, "rgba(10, 37, 64, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: particleTexture,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      opacity: 0.75,
    });
    const particlesMesh = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particlesMesh);

    // 4. Interactive State & Physics Damping
    let pointerDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velX = 0;
    let velY = 0;
    let targetRotX = 0.15;
    let targetRotY = 0.3;

    const onPointerDown = (clientX: number, clientY: number) => {
      pointerDown = true;
      setIsDragging(true);
      prevMouseX = clientX;
      prevMouseY = clientY;
      velX = 0;
      velY = 0;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (pointerDown) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        velX = deltaX * 0.007;
        velY = deltaY * 0.007;
        targetRotY += velX;
        targetRotX += velY;
        prevMouseX = clientX;
        prevMouseY = clientY;
      } else {
        const rect = container.getBoundingClientRect();
        const normX = (clientX - rect.left) / rect.width - 0.5;
        const normY = (clientY - rect.top) / rect.height - 0.5;
        targetRotY += normX * 0.015;
        targetRotX += normY * 0.015;
      }
    };

    const onPointerUp = () => {
      pointerDown = false;
      setIsDragging(false);
    };

    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();
    const handleMouseLeave = () => onPointerUp();

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchEnd = () => onPointerUp();

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // 5. Resize Listener
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 340;
      height = container.clientHeight || 260;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // 6. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Idle continuous natural tumbling
      if (!pointerDown) {
        targetRotY += 0.0035;
        targetRotX += 0.0015;
        velX *= 0.94;
        velY *= 0.94;
        targetRotY += velX;
        targetRotX += velY;
      }

      // Smooth lerp rotation for natural inertia
      gemGroup.rotation.x = THREE.MathUtils.lerp(gemGroup.rotation.x, targetRotX, 0.08);
      gemGroup.rotation.y = THREE.MathUtils.lerp(gemGroup.rotation.y, targetRotY, 0.08);

      // Gentle floating levitation
      gemGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.12;

      // Inner spheres counter-rotation
      innerMesh.rotation.y = -elapsedTime * 0.15;
      coreMesh.rotation.x = elapsedTime * 0.2;

      // Soft wave drift on particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const speed = particleSpeeds[i];
        positions[i3 + 1] = particleOriginals[i3 + 1] + Math.sin(elapsedTime * speed + particleOriginals[i3]) * 0.18;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particlesMesh.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      pointMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleTexture.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        userSelect: "none",
        marginBottom: "12px",
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: "100%",
          maxWidth: "340px",
          height: "260px",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        title="Interactive 3D wireframe gem"
      />
    </div>
  );
}
