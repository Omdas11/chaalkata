"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

/** Deterministic pseudo-noise for the soil surface. */
function soilNoise(x: number, z: number): number {
  return (
    Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.55 +
    Math.sin(x * 0.9 + z * 0.7) * 0.22 +
    Math.sin(x * 2.1) * Math.sin(z * 1.7) * 0.08
  );
}

/** Mulberry32 seeded RNG for stable pebble layout. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fixed full-viewport 3D soil background with a gentle idle camera drift. */
export default function SoilScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x3e2c1c);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x3e2c1c, 16, 42);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    const CAM_Y = 6.5;
    camera.position.set(0, CAM_Y, 13.5);
    camera.lookAt(0, 0.5, 0);

    // --- soil ground ---
    const groundGeo = new THREE.PlaneGeometry(70, 70, 110, 110);
    groundGeo.rotateX(-Math.PI / 2);
    const pos = groundGeo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const cBase = new THREE.Color(0x6b4a2e);
    const cDark = new THREE.Color(0x4a3220);
    const cLight = new THREE.Color(0x8a6a45);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = soilNoise(x, z);
      pos.setY(i, h);
      const m = Math.sin(x * 1.3 + 2) * Math.sin(z * 1.1 - 1);
      tmp.copy(cBase);
      if (h < -0.15) tmp.lerp(cDark, Math.min(1, (-h - 0.15) * 2));
      if (m > 0.35) tmp.lerp(cLight, Math.min(1, (m - 0.35) * 1.6));
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    groundGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    groundGeo.computeVertexNormals();
    const ground = new THREE.Mesh(
      groundGeo,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }),
    );
    ground.receiveShadow = true;
    scene.add(ground);

    // --- pebbles ---
    const rng = mulberry32(7);
    const pebGeo = new THREE.DodecahedronGeometry(1, 0);
    const pp = pebGeo.attributes.position;
    for (let i = 0; i < pp.count; i++) {
      const s = 0.75 + rng() * 0.5;
      pp.setXYZ(i, pp.getX(i) * s, pp.getY(i) * s * 0.7, pp.getZ(i) * s);
    }
    pebGeo.computeVertexNormals();
    const pebMats = [
      new THREE.MeshStandardMaterial({ color: 0x8a7b63, roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 1 }),
    ];
    const pebbles = new THREE.Group();
    for (let i = 0; i < 140; i++) {
      const mesh = new THREE.Mesh(pebGeo, pebMats[i % 2]);
      let x = 0;
      let z = 0;
      do {
        x = (rng() * 2 - 1) * 22;
        z = (rng() * 2 - 1) * 22;
      } while (Math.hypot(x, z) < 6); // keep the middle clear for the board
      const s = 0.08 + rng() * 0.22;
      mesh.scale.set(s, s * 0.6, s);
      mesh.rotation.set(rng() * Math.PI, rng() * Math.PI * 2, rng() * Math.PI);
      mesh.position.set(x, soilNoise(x, z) + s * 0.3, z);
      mesh.castShadow = true;
      pebbles.add(mesh);
    }
    scene.add(pebbles);

    // --- lights ---
    scene.add(new THREE.HemisphereLight(0x9a8874, 0x3e2c1c, 0.75));
    const sun = new THREE.DirectionalLight(0xffd9a0, 1.6);
    sun.position.set(8, 12, 6);
    sun.castShadow = true;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // --- animation ---
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      const clock = new THREE.Clock();
      const tick = () => {
        const t = clock.getElapsedTime();
        camera.position.x = Math.sin(t * 0.12) * 0.9;
        camera.position.y = CAM_Y + Math.sin(t * 0.07) * 0.35;
        camera.lookAt(0, 0.5, 0);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
