"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function InteractiveStone404() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 320;
    let height = container.clientHeight || 280;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

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

    // 2. Lighting (Tactile 3D shadows on stone facets)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x0ea5e9, 2.2); // Cyan highlight
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x6366f1, 1.4); // Indigo accent
    fillLight.position.set(-5, -3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 1.8, 15);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // 3. Stone Group (Holds main boulder + orbiting fragments)
    const stoneGroup = new THREE.Group();
    scene.add(stoneGroup);

    // Main 3D Faceted Stone Boulder
    const baseGeo = new THREE.DodecahedronGeometry(1.7, 1);
    
    // Perturb vertices slightly to give it an organic, hand-carved stone boulder feel
    const posAttr = baseGeo.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      vertex.fromBufferAttribute(posAttr, i);
      const noise = (Math.sin(vertex.x * 3.5) + Math.cos(vertex.y * 3.5) + Math.sin(vertex.z * 3.5)) * 0.12;
      vertex.addScaledVector(vertex.clone().normalize(), noise);
      posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    baseGeo.computeVertexNormals();

    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a2540, // Deep T&N Brand Navy
      roughness: 0.45,
      metalness: 0.35,
      flatShading: true, // Gives crisp low-poly rock facets
    });

    const stoneMesh = new THREE.Mesh(baseGeo, stoneMaterial);
    stoneGroup.add(stoneMesh);

    // Wireframe Cage Accent for modern digital architectural aesthetic
    const wireGeo = new THREE.DodecahedronGeometry(1.75, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    stoneGroup.add(wireMesh);

    // 4. Orbiting Mini Stone Pebbles (5 satellite fragments)
    const satellites: THREE.Mesh[] = [];
    const satCount = 6;
    for (let i = 0; i < satCount; i++) {
      const satGeo = new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.12, 0);
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x0ea5e9 : 0x0a2540,
        roughness: 0.4,
        metalness: 0.3,
        flatShading: true,
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      
      const angle = (i / satCount) * Math.PI * 2;
      const dist = 2.6 + (i % 3) * 0.4;
      sat.position.set(
        Math.cos(angle) * dist,
        (Math.random() - 0.5) * 1.4,
        Math.sin(angle) * dist
      );
      
      sat.userData = {
        orbitAngle: angle,
        orbitSpeed: 0.008 + Math.random() * 0.008,
        orbitDist: dist,
        yOffset: sat.position.y,
        rotSpeedX: (Math.random() - 0.5) * 0.03,
        rotSpeedY: (Math.random() - 0.5) * 0.03,
      };

      stoneGroup.add(sat);
      satellites.push(sat);
    }

    // 5. Interaction State (Mouse & Touch)
    let pointerDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velX = 0;
    let velY = 0;
    let targetRotX = 0.2;
    let targetRotY = 0.4;

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
        velX = deltaX * 0.008;
        velY = deltaY * 0.008;
        targetRotY += velX;
        targetRotX += velY;
        prevMouseX = clientX;
        prevMouseY = clientY;
      } else {
        // Soft cursor tracking when hovering
        const rect = container.getBoundingClientRect();
        const normX = (clientX - rect.left) / rect.width - 0.5;
        const normY = (clientY - rect.top) / rect.height - 0.5;
        targetRotY += normX * 0.02;
        targetRotX += normY * 0.02;
      }
    };

    const onPointerUp = () => {
      pointerDown = false;
      setIsDragging(false);
    };

    // DOM event listeners
    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      onPointerUp();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => onPointerUp();

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // 6. Resize Observer
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 320;
      height = container.clientHeight || 280;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous natural tumbling + mouse damping
      if (!pointerDown) {
        targetRotY += 0.005;
        targetRotX += 0.002;
        // Inertia damping
        velX *= 0.95;
        velY *= 0.95;
        targetRotY += velX;
        targetRotX += velY;
      }

      // Smooth lerp rotation for natural weight
      stoneGroup.rotation.x = THREE.MathUtils.lerp(stoneGroup.rotation.x, targetRotX, 0.08);
      stoneGroup.rotation.y = THREE.MathUtils.lerp(stoneGroup.rotation.y, targetRotY, 0.08);

      // Gentle floating levitation bounce
      stoneGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;

      // Animate orbiting pebbles
      satellites.forEach((sat) => {
        sat.userData.orbitAngle += sat.userData.orbitSpeed;
        sat.position.x = Math.cos(sat.userData.orbitAngle) * sat.userData.orbitDist;
        sat.position.z = Math.sin(sat.userData.orbitAngle) * sat.userData.orbitDist;
        sat.position.y = sat.userData.yOffset + Math.sin(elapsedTime * 2 + sat.userData.orbitAngle) * 0.15;
        sat.rotation.x += sat.userData.rotSpeedX;
        sat.rotation.y += sat.userData.rotSpeedY;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      baseGeo.dispose();
      wireGeo.dispose();
      stoneMaterial.dispose();
      wireMat.dispose();
      satellites.forEach((s) => {
        s.geometry.dispose();
        (s.material as THREE.Material).dispose();
      });
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
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: "100%",
          maxWidth: "380px",
          height: "280px",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          filter: "drop-shadow(0 20px 30px rgba(10, 37, 64, 0.18))",
        }}
        title="Click and drag to spin the 3D stone"
      />
      <div
        style={{
          marginTop: "-10px",
          marginBottom: "12px",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: isHovered ? "#0ea5e9" : "#64748b",
          transition: "color 0.2s ease",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: isHovered ? "#0ea5e9" : "#94a3b8",
            animation: "pulse 2s infinite",
          }}
        />
        {isDragging ? "Spinning Stone" : "Drag or hover the 3D stone"}
      </div>
    </div>
  );
}

