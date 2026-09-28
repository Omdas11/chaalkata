"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import type { BoardDef, Move, Side } from "../lib/engine";

const SIZE = 10; // board spans -5..5 in world units
const PIECE_R = 0.42;
const REST_Y = PIECE_R * 0.82;

export interface LastMove {
  from: string;
  to: string;
  path: string[];
  captures: string[];
}

interface Board3DProps {
  board: BoardDef;
  occupant: Record<string, Side>;
  turn: Side;
  selected: string | null;
  /** Legal moves originating from the selected piece. */
  selectedMoves: Move[];
  /** Points holding the current side's pieces (hover cursor). */
  activePoints: string[];
  /** Points whose stones can capture right now (compulsory-capture hint). */
  captureFrom: string[];
  onSelectPoint: (pointId: string) => void;
  /** Increments every applied move; drives the travel animation. */
  moveSeq: number;
  lastMove: LastMove | null;
}

function worldPos(board: BoardDef, pointId: string): THREE.Vector3 {
  const p = board.points.find((q) => q.id === pointId)!;
  return new THREE.Vector3((p.x - 0.5) * SIZE, 0, (p.y - 0.5) * SIZE);
}

/** Stable per-string hash for deterministic piece variation. */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/** Stone geometry, shape-coded by side so color is never the only signal:
 *  dark stones are rough dodecahedrons, pale stones smoother icosahedrons. */
function makeStoneGeometry(seed: string, side: Side): THREE.BufferGeometry {
  const geo = side === "A"
    ? new THREE.DodecahedronGeometry(PIECE_R, 0)
    : new THREE.IcosahedronGeometry(PIECE_R, 1);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const rough = side === "A" ? 0.28 : 0.14;
  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    const s = 1 - rough / 2 + hashStr(seed + ":" + i) * rough;
    v.multiplyScalar(s);
    v.y *= 0.82; // squat pebble
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

interface Tween {
  mesh: THREE.Mesh;
  points: THREE.Vector3[];
  t: number;
  dur: number;
  kind: "travel" | "shrink" | "pop";
  onDone?: () => void;
}

interface SceneApi {
  onMove: () => void;
  onSelection: () => void;
}

/**
 * 3D board: lines scratched into packed earth, procedural stone pieces
 * (shape-coded: rough dark dodecahedrons, smooth pale icosahedrons).
 * Selection is purely local (lift + ring + target markers) — it never
 * touches the scene background, so the old "board goes black on select"
 * bug class cannot recur. The canvas is presentational; keyboard and
 * screen-reader users get an equivalent button board beside it.
 */
export default function Board3D({
  board,
  occupant,
  turn,
  selected,
  selectedMoves,
  activePoints,
  captureFrom,
  onSelectPoint,
  moveSeq,
  lastMove,
}: Board3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SceneApi | null>(null);

  // Latest props, mirrored for the scene (updated every render below).
  const propsRef = useRef({ occupant, turn, selected, selectedMoves, activePoints, captureFrom, moveSeq, lastMove, onSelectPoint });
  propsRef.current = { occupant, turn, selected, selectedMoves, activePoints, captureFrom, moveSeq, lastMove, onSelectPoint };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const P = () => propsRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    // Side A (the human's dark stones) sits at negative world-z, so the camera
    // looks from -z: your own stones are on the near edge of the board.
    camera.position.set(0, 10.5, -8.5);
    camera.lookAt(0, 0, -0.5);

    scene.add(new THREE.HemisphereLight(0xfff2dd, 0x3e2c1c, 0.85));
    const sun = new THREE.DirectionalLight(0xffd9a0, 1.5);
    sun.position.set(6, 12, -4);
    sun.castShadow = true;
    sun.shadow.camera.left = -9;
    sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 9;
    sun.shadow.camera.bottom = -9;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // --- packed-earth patch (swept circle) ---
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(7.4, 56),
      new THREE.MeshStandardMaterial({ color: 0x7a5a38, roughness: 1 }),
    );
    patch.rotation.x = -Math.PI / 2;
    patch.receiveShadow = true;
    boardGroup.add(patch);
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(7.4, 7.85, 56),
      new THREE.MeshStandardMaterial({ color: 0x5a4128, roughness: 1 }),
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.005;
    rim.receiveShadow = true;
    boardGroup.add(rim);

    // --- etched lines: hand-scratched grooves with a deterministic wobble ---
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0x2e2013, roughness: 1 });
    const pitMat = new THREE.MeshStandardMaterial({ color: 0x241812, roughness: 1 });
    const up = new THREE.Vector3(0, 1, 0);
    const addGroove = (p: THREE.Vector3, q: THREE.Vector3, width: number) => {
      const len = p.distanceTo(q);
      const groove = new THREE.Mesh(new THREE.PlaneGeometry(len + 0.08, width), grooveMat);
      groove.rotation.x = -Math.PI / 2;
      groove.position.copy(p).add(q).multiplyScalar(0.5);
      groove.position.y = 0.02;
      const dir = q.clone().sub(p).normalize();
      groove.rotateOnWorldAxis(up, -Math.atan2(dir.z, dir.x));
      groove.receiveShadow = true;
      boardGroup.add(groove);
    };
    for (const [a, b] of board.edges) {
      const pa = worldPos(board, a);
      const pb = worldPos(board, b);
      // Scratched, not ruled: the midpoint wanders a little off the straight line.
      const dir = pb.clone().sub(pa).normalize();
      const perp = new THREE.Vector3(-dir.z, 0, dir.x);
      const mid = pa.clone().add(pb).multiplyScalar(0.5)
        .add(perp.multiplyScalar((hashStr(a + ">" + b) - 0.5) * 0.24));
      const width = 0.12 + hashStr(b + ">" + a) * 0.07;
      addGroove(pa, mid, width);
      addGroove(mid, pb, width);
    }
    const pitGeo = new THREE.CircleGeometry(0.17, 20);
    for (const p of board.points) {
      const pit = new THREE.Mesh(pitGeo, pitMat);
      pit.rotation.x = -Math.PI / 2;
      const w = worldPos(board, p.id);
      pit.position.set(w.x, 0.025, w.z);
      pit.receiveShadow = true;
      boardGroup.add(pit);
    }

    // --- pieces (one mesh per occupied point slot) ---
    const matA = new THREE.MeshStandardMaterial({ color: 0x2b2724, roughness: 0.9, flatShading: true });
    const matB = new THREE.MeshStandardMaterial({ color: 0xd9cdb4, roughness: 0.95, flatShading: true });
    const slotMeshes = new Map<string, THREE.Mesh>();
    const tweens: Tween[] = [];
    const travelling = new Set<THREE.Mesh>();

    const spawnPiece = (pointId: string, side: Side, animate: boolean) => {
      const mesh = new THREE.Mesh(makeStoneGeometry(pointId, side), side === "A" ? matA : matB);
      const w = worldPos(board, pointId);
      mesh.position.set(w.x, REST_Y, w.z);
      mesh.rotation.y = hashStr(pointId + side) * Math.PI * 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { kind: "piece", point: pointId };
      boardGroup.add(mesh);
      slotMeshes.set(pointId, mesh);
      if (animate) {
        mesh.scale.setScalar(0.01);
        tweens.push({ mesh, points: [], t: 0, dur: 0.28, kind: "pop" });
      }
      return mesh;
    };

    const removePiece = (pointId: string, animate: boolean) => {
      const mesh = slotMeshes.get(pointId);
      if (!mesh) return;
      slotMeshes.delete(pointId);
      if (animate) {
        tweens.push({ mesh, points: [], t: 0, dur: 0.3, kind: "shrink", onDone: () => boardGroup.remove(mesh) });
      } else {
        boardGroup.remove(mesh);
      }
    };

    const rebuildAll = (occ: Record<string, Side>) => {
      for (const pid of [...slotMeshes.keys()]) removePiece(pid, false);
      tweens.length = 0;
      travelling.clear();
      for (const [pid, side] of Object.entries(occ)) spawnPiece(pid, side, false);
    };

    rebuildAll(P().occupant);

    // --- selection ring + target markers + capture hints + last-move marker ---
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.52, 0.66, 32),
      new THREE.MeshBasicMaterial({ color: 0xb3261e, transparent: true, opacity: 0.95, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    boardGroup.add(ring);

    const markerGeo = new THREE.CircleGeometry(0.2, 20);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xe0a526, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
    const hintGeo = new THREE.RingGeometry(0.5, 0.6, 32);
    const hintMat = new THREE.MeshBasicMaterial({ color: 0xe0a526, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    let markers: THREE.Mesh[] = [];
    let hintRings: THREE.Mesh[] = [];
    let lastSelKey = "";
    const refreshMarkers = () => {
      const { selected: sel, selectedMoves: moves, captureFrom } = P();
      const key = (sel ?? "-") + "|" + moves.map((m) => m.to).sort().join(",")
        + "|" + [...captureFrom].sort().join(",");
      if (key === lastSelKey) return;
      lastSelKey = key;
      for (const m of markers) boardGroup.remove(m);
      for (const h of hintRings) boardGroup.remove(h);
      markers = [];
      hintRings = [];
      if (!sel) {
        ring.visible = false;
      } else {
        const w = worldPos(board, sel);
        ring.position.set(w.x, 0.04, w.z);
        ring.visible = true;
      }
      const seen = new Set<string>();
      for (const mv of moves) {
        if (seen.has(mv.to)) continue;
        seen.add(mv.to);
        const mk = new THREE.Mesh(markerGeo, markerMat);
        const mw = worldPos(board, mv.to);
        mk.rotation.x = -Math.PI / 2;
        mk.position.set(mw.x, 0.05, mw.z);
        mk.userData = { kind: "marker", point: mv.to };
        boardGroup.add(mk);
        markers.push(mk);
      }
      // When captures are compulsory, mark exactly the stones that can capture.
      if (captureFrom.length > 0) {
        for (const pid of captureFrom) {
          if (pid === sel) continue;
          const hw = worldPos(board, pid);
          const h = new THREE.Mesh(hintGeo, hintMat);
          h.rotation.x = -Math.PI / 2;
          h.position.set(hw.x, 0.04, hw.z);
          boardGroup.add(h);
          hintRings.push(h);
        }
      }
    };
    refreshMarkers();

    // --- last-move marker: turmeric ring where the stone landed,
    //     gamosa-red discs on the points stones were taken from ---
    const lastMoveGroup = new THREE.Group();
    boardGroup.add(lastMoveGroup);
    const clearGroup = (g: THREE.Group) => {
      for (let i = g.children.length - 1; i >= 0; i--) {
        const c = g.children[i] as THREE.Mesh;
        g.remove(c);
        c.geometry.dispose();
        (c.material as THREE.Material).dispose();
      }
    };
    const refreshLastMove = () => {
      clearGroup(lastMoveGroup);
      const lm = P().lastMove;
      if (!lm) return;
      const w = worldPos(board, lm.to);
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.5, 0.62, 32),
        new THREE.MeshBasicMaterial({ color: 0xe0a526, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
      );
      r.rotation.x = -Math.PI / 2;
      r.position.set(w.x, 0.045, w.z);
      lastMoveGroup.add(r);
      for (const cp of lm.captures) {
        const cw = worldPos(board, cp);
        const d = new THREE.Mesh(
          new THREE.CircleGeometry(0.15, 16),
          new THREE.MeshBasicMaterial({ color: 0xb3261e, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
        );
        d.rotation.x = -Math.PI / 2;
        d.position.set(cw.x, 0.045, cw.z);
        lastMoveGroup.add(d);
      }
    };

    // --- move animation driver ---
    let lastSeqApplied = P().moveSeq;
    const applyMoveVisual = () => {
      const { lastMove: lm, occupant: occ } = P();
      if (!lm) {
        rebuildAll(occ);
        lastSelKey = "";
        refreshMarkers();
        refreshLastMove();
        return;
      }
      for (const cp of lm.captures) removePiece(cp, true);
      const mesh = slotMeshes.get(lm.from);
      if (mesh) {
        slotMeshes.delete(lm.from);
        const pts = lm.path.map((pid) => {
          const w = worldPos(board, pid);
          return new THREE.Vector3(w.x, REST_Y, w.z);
        });
        slotMeshes.set(lm.to, mesh);
        mesh.userData.point = lm.to;
        travelling.add(mesh);
        tweens.push({
          mesh,
          points: pts,
          t: 0,
          dur: 0.45,
          kind: "travel",
          onDone: () => travelling.delete(mesh),
        });
      } else {
        rebuildAll(occ);
      }
      lastSelKey = "";
      refreshMarkers();
      refreshLastMove();
    };

    apiRef.current = {
      onMove: () => {
        if (P().moveSeq !== lastSeqApplied) {
          lastSeqApplied = P().moveSeq;
          applyMoveVisual();
        }
      },
      onSelection: () => refreshMarkers(),
    };

    // --- picking ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const castAt = (e: PointerEvent): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...slotMeshes.values(), ...markers], false);
      return hits.length > 0 ? (hits[0].object.userData.point as string) : null;
    };
    const onPointerDown = (e: PointerEvent) => {
      const pid = castAt(e);
      if (pid) P().onSelectPoint(pid);
    };
    const onPointerMove = (e: PointerEvent) => {
      const pid = castAt(e);
      let cursor = "default";
      if (pid) {
        const { activePoints: act, selected: sel } = P();
        const isMarker = markers.some((m) => m.userData.point === pid);
        if (act.includes(pid) || isMarker || pid === sel) cursor = "pointer";
      }
      renderer.domElement.style.cursor = cursor;
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    // --- sizing ---
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      // Zoom in on narrow/portrait screens so the board fills the frame.
      const zoom = camera.aspect < 0.85 ? 0.72 : camera.aspect < 1.2 ? 0.86 : 1;
      camera.position.set(0, 10.5 * zoom, -8.5 * zoom);
      camera.lookAt(0, 0, -0.5);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // --- frame loop ---
    const clock = new THREE.Clock();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const stepTween = (tw: Tween, dt: number): boolean => {
      tw.t += dt / tw.dur;
      const k = Math.min(1, tw.t);
      if (tw.kind === "travel" && tw.points.length > 1) {
        const segs = tw.points.length - 1;
        const f = k * segs;
        const i = Math.min(segs - 1, Math.floor(f));
        const local = f - i;
        tw.mesh.position.lerpVectors(tw.points[i], tw.points[i + 1], local);
        if (!reduceMotion) tw.mesh.position.y += Math.sin(local * Math.PI) * 0.7;
      } else if (tw.kind === "shrink") {
        tw.mesh.scale.setScalar(Math.max(0.01, 1 - k));
      } else if (tw.kind === "pop") {
        const s = k < 0.7 ? (k / 0.7) * 1.15 : 1.15 - ((k - 0.7) / 0.3) * 0.15;
        tw.mesh.scale.setScalar(Math.max(0.01, s));
      }
      if (k >= 1) {
        if (tw.kind === "travel") tw.mesh.position.copy(tw.points[tw.points.length - 1]);
        if (tw.kind === "pop") tw.mesh.scale.setScalar(1);
        tw.onDone?.();
        return true;
      }
      return false;
    };

    const tick = () => {
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;

      for (let i = tweens.length - 1; i >= 0; i--) {
        if (stepTween(tweens[i], reduceMotion ? 1 : dt)) tweens.splice(i, 1);
      }

      // selection lift (skips pieces mid-travel so the hop isn't flattened)
      const sel = P().selected;
      for (const [pid, mesh] of slotMeshes) {
        if (travelling.has(mesh)) continue;
        const targetY = pid === sel ? REST_Y + 0.3 : REST_Y;
        mesh.position.y += (targetY - mesh.position.y) * Math.min(1, dt * 12);
      }
      if (ring.visible && !reduceMotion) {
        ring.scale.setScalar(1 + Math.sin(t * 5) * 0.07);
        for (const m of markers) m.scale.setScalar(1 + Math.sin(t * 5 + 1) * 0.12);
        for (const h of hintRings) h.scale.setScalar(1 + Math.sin(t * 5 + 2) * 0.1);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      apiRef.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push prop changes into the scene every render.
  useEffect(() => {
    apiRef.current?.onMove();
    apiRef.current?.onSelection();
  });

  return (
    <div
      ref={mountRef}
      // The 3D canvas is presentational; the keyboard/screen-reader board
      // beside it is the operable representation of the same game.
      aria-hidden="true"
      style={{ width: "100%", height: "100%", minHeight: 320, touchAction: "manipulation" }}
    />
  );
}
