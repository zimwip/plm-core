import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ViewportGizmo } from 'three-viewport-gizmo';
import { getSessionToken, getProjectSpaceId } from '../services/api';
import { stepWorker as _stepWorker } from '../workers/stepWorkerInstance';
import { ChevronRightIcon, ChevronLeftIcon } from './Icons';

// nodes: [{ nodeId, nodeLabel, stateColor, depth, instanceId, parts: [{ uuid, fileName, sizeBytes, instanceKey, matrix }] }]
export default function StepViewer({ nodes = [], loading = false, onNavigateToNode, highlightedInstanceKeys = [], onPartSelected }) {
  const mountRef    = useRef(null);
  const sceneRef    = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef   = useRef(null);
  const controlsRef = useRef(null);
  const gizmoRef    = useRef(null);
  const rafRef      = useRef(null);
  const groupsRef   = useRef({});     // instanceKey → THREE.Group
  const loadingRef  = useRef(new Set());
  const partNodeMapRef  = useRef({}); // instanceKey → nodeId
  const partColorRef    = useRef({}); // instanceKey → stateColor
  const onNavRef         = useRef(onNavigateToNode);
  const hoveredUuidRef   = useRef(null);
  const selectedKeysRef  = useRef(new Set());
  const onPartSelectedRef = useRef(onPartSelected);
  const meshDataRef    = useRef({});  // uuid → meshes array (cache for multi-instance)
  const activePartsRef = useRef([]);  // current activeParts (for worker handler closure)
  const onResizeRef    = useRef(null);

  useEffect(() => { onNavRef.current = onNavigateToNode; }, [onNavigateToNode]);
  useEffect(() => { onPartSelectedRef.current = onPartSelected; }, [onPartSelected]);

  const [partStates,      setPartStates]      = useState({});
  // { [uuid]: { phase: 'loading'|'ready'|'error', error, visible } }
  const [downloadProgress, setDownloadProgress] = useState({});
  // { [uuid]: { loaded, total } } — bytes received during chunked Range fetch

  const [removedKeys,     setRemovedKeys]     = useState(() => new Set());
  const [collapsedNodes,  setCollapsedNodes]  = useState(() => new Set());

  // Reset manual removals when the primary node changes (editor switched to different node)
  const primaryNodeId = nodes[0]?.nodeId;
  useEffect(() => {
    setRemovedKeys(new Set());
    origMatricesRef.current = {};
    explodeDataRef.current  = null;
    explodeFactorRef.current = 0;
    if (explodeAnimRef.current) { cancelAnimationFrame(explodeAnimRef.current); explodeAnimRef.current = null; }
    setExplodeActive(false);
    setExplodeFactor(0);
    setExplodeAnim(null);
  }, [primaryNodeId]); // eslint-disable-line react-hooks/exhaustive-deps
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Explode / clip / lighting state ─────────────────────────
  const [explodeActive, setExplodeActive] = useState(false);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const explodeFactorRef = useRef(0);
  const [explodeAnim,  setExplodeAnim]  = useState(null); // {from,to} during transition, null otherwise
  const [clipEnabled,  setClipEnabled]  = useState(false);
  const [clipAxis,     setClipAxis]     = useState('Y');
  const [clipPos,      setClipPos]      = useState(0);
  const [sceneBounds,  setSceneBounds]  = useState(null);
  const [renderMode,   setRenderMode]   = useState('cartoon'); // 'cartoon' | 'realistic'
  const renderModeRef  = useRef('cartoon');
  const origMatricesRef = useRef({});
  const explodeDataRef  = useRef(null); // cached directions for animation fast-path
  const explodeAnimRef  = useRef(null); // RAF handle for animation loop
  const isDraggingRef   = useRef(false); // true while any toolbar slider is being dragged
  const planeHelperRef  = useRef(null);
  const clipPlaneRef    = useRef(null);
  const ambientLightRef = useRef(null);
  const sunLightRef     = useRef(null);
  const hemiLightRef    = useRef(null);

  // Rebuild part → node maps; also patch outline materials on already-loaded groups
  useEffect(() => {
    const nodeMap  = {};
    const colorMap = {};
    nodes.forEach(n => n.parts.forEach(p => {
      const key = p.instanceKey || p.uuid;
      nodeMap[key]  = n.nodeId;
      colorMap[key] = n.stateColor || '#6b7280';
    }));
    partNodeMapRef.current = nodeMap;
    partColorRef.current   = colorMap;

    // Patch outline color on groups built before the lifecycle state color was known
    Object.entries(colorMap).forEach(([key, color]) => {
      const group = groupsRef.current[key];
      if (!group) return;
      const olColor = new THREE.Color(color);
      group.traverse(obj => {
        if (obj.isMesh && obj.userData.isOutline) obj.material.uniforms.color.value.copy(olColor);
      });
    });
  }, [nodes]);

  const allParts    = nodes.flatMap(n => n.parts);
  const activeParts = allParts.filter(p => !removedKeys.has(p.instanceKey || p.uuid));
  const activeKey   = activeParts.map(p => `${p.instanceKey || p.uuid}@${p.matrix ? p.matrix.join(',') : 'I'}`).join('|');
  activePartsRef.current = activeParts;

  // ── Scene init (once) ────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth  || 600;
    const h = container.clientHeight || 400;

    const getSceneBg = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--scene-bg').trim();
      return new THREE.Color(raw || '#1c1c2a');
    };

    const scene = new THREE.Scene();
    scene.background = getSceneBg();

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    ambientLightRef.current = ambient;

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(8, 12, 6);
    scene.add(sun);
    sunLightRef.current = sun;

    const hemi = new THREE.HemisphereLight(0xb1e1ff, 0x4a4a3a, 0);
    scene.add(hemi);
    hemiLightRef.current = hemi;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.0001, 100000);
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    const gizmo = new ViewportGizmo(camera, renderer, { size: 80, container });
    gizmo.attachControls(controls);

    sceneRef.current    = scene;
    rendererRef.current = renderer;
    cameraRef.current   = camera;
    controlsRef.current = controls;
    gizmoRef.current    = gizmo;

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      gizmo.render();
    }
    animate();

    function onResize() {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      gizmo.update();
    }

    onResizeRef.current = onResize;

    const themeObserver = new MutationObserver(() => {
      if (sceneRef.current) sceneRef.current.background = getSceneBg();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ResizeObserver tracks split drag + maximize transitions, not just window resize
    const ro = new ResizeObserver(() => onResize());
    ro.observe(container);

    const raycaster = new THREE.Raycaster();
    const mouseVec  = new THREE.Vector2();

    function pickUuid(e) {
      const rect = container.getBoundingClientRect();
      mouseVec.set(
        ((e.clientX - rect.left) / container.clientWidth)  *  2 - 1,
        ((e.clientY - rect.top)  / container.clientHeight) * -2 + 1,
      );
      raycaster.setFromCamera(mouseVec, camera);
      const meshes = [];
      scene.traverse(obj => {
        if (obj.isMesh && !obj.userData.isOutline && obj.visible) meshes.push(obj);
      });
      const hits = raycaster.intersectObjects(meshes, false);
      if (!hits.length) return null;
      let obj = hits[0].object;
      while (obj && !obj.name) obj = obj.parent;
      return obj?.name || null;
    }

    function applyHover(uuid) {
      const prev = hoveredUuidRef.current;
      if (prev === uuid) return;
      if (prev) {
        const isSelected = selectedKeysRef.current.has(prev);
        const g = groupsRef.current[prev];
        if (g) g.traverse(obj => {
          if (!obj.isMesh) return;
          if (obj.userData.isOutline) {
            obj.material.uniforms.color.value.set(isSelected ? '#3b82f6' : (partColorRef.current[prev] || '#6b7280'));
          } else {
            obj.material.emissive.set(isSelected ? 0x1a3a6e : 0x000000);
          }
        });
      }
      if (uuid) {
        const g = groupsRef.current[uuid];
        if (g) g.traverse(obj => {
          if (!obj.isMesh) return;
          if (obj.userData.isOutline) {
            obj.material.uniforms.color.value.set(0xffffff);
          } else {
            obj.material.emissive.set(0x222222);
          }
        });
      }
      hoveredUuidRef.current = uuid;
      renderer.domElement.style.cursor = uuid ? 'pointer' : 'default';
    }

    function onMouseMove(e) { applyHover(pickUuid(e)); }
    function onMouseLeave()  { applyHover(null); }

    function onCanvasClick(e) {
      const uuid = pickUuid(e);
      if (e.ctrlKey || e.metaKey) {
        if (!uuid) return;
        const nodeId = partNodeMapRef.current[uuid];
        if (nodeId && onNavRef.current) onNavRef.current(nodeId);
      } else {
        onPartSelectedRef.current?.(uuid || null, uuid ? partNodeMapRef.current[uuid] : null);
      }
    }

    renderer.domElement.addEventListener('mousemove',  onMouseMove);
    renderer.domElement.addEventListener('mouseleave', onMouseLeave);
    renderer.domElement.addEventListener('click', onCanvasClick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      themeObserver.disconnect();
      ro.disconnect();
      renderer.domElement.removeEventListener('mousemove',  onMouseMove);
      renderer.domElement.removeEventListener('mouseleave', onMouseLeave);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      gizmo.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Worker message handler ───────────────────────────────────
  useEffect(() => {
    const handler = ({ data }) => {
      const { type, uuid } = data;
      if (!loadingRef.current.has(uuid)) return;
      if (type === 'progress') {
        if (data.loaded !== undefined) {
          setDownloadProgress(prev => ({ ...prev, [uuid]: { loaded: data.loaded, total: data.total } }));
        }
        return;
      }
      loadingRef.current.delete(uuid);
      if (type === 'ready') {
        setDownloadProgress(prev => { const n = { ...prev }; delete n[uuid]; return n; });
        // Cache mesh data for multi-instance reuse
        meshDataRef.current[uuid] = data.meshes;
        // Find all active instances of this uuid
        const instances = activePartsRef.current.filter(p => p.uuid === uuid);
        const newStates = {};
        for (const p of instances) {
          const key = p.instanceKey || p.uuid;
          if (groupsRef.current[key]) continue;
          const outlineColor = partColorRef.current[key] || '#6b7280';
          const group = renderModeRef.current === 'realistic'
            ? buildGroupRealistic(data.meshes)
            : buildGroup(data.meshes, outlineColor);
          group.name = key;
          if (p.matrix) {
            const m4 = new THREE.Matrix4();
            m4.set(
              p.matrix[0],  p.matrix[1],  p.matrix[2],  p.matrix[3],
              p.matrix[4],  p.matrix[5],  p.matrix[6],  p.matrix[7],
              p.matrix[8],  p.matrix[9],  p.matrix[10], p.matrix[11],
              p.matrix[12], p.matrix[13], p.matrix[14], p.matrix[15]
            );
            group.matrix.copy(m4);
            group.matrixAutoUpdate = false;
          }
          sceneRef.current?.add(group);
          groupsRef.current[key] = group;
          newStates[key] = { phase: 'ready', error: null, visible: true };
        }
        fitCamera();
        if (Object.keys(newStates).length > 0) {
          explodeDataRef.current = null;
          if (explodeFactorRef.current > 0 && !explodeAnimRef.current) applyExplode(explodeFactorRef.current);
          setPartStates(prev => ({ ...prev, ...newStates }));
        }
      } else if (type === 'error') {
        setDownloadProgress(prev => { const n = { ...prev }; delete n[uuid]; return n; });
        const instances = activePartsRef.current.filter(p => p.uuid === uuid);
        const newStates = {};
        for (const p of instances) {
          const key = p.instanceKey || p.uuid;
          newStates[key] = { phase: 'error', error: data.message, visible: false };
        }
        if (Object.keys(newStates).length > 0) {
          setPartStates(prev => ({ ...prev, ...newStates }));
        }
      }
    };
    _stepWorker.addEventListener('message', handler);
    return () => _stepWorker.removeEventListener('message', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync scene: remove stale, load/instantiate new ──────────
  useEffect(() => {
    const instanceKeys = new Set(activeParts.map(p => p.instanceKey || p.uuid));
    const rawUuids     = new Set(activeParts.map(p => p.uuid));

    // Remove stale groups
    let sceneChanged = false;
    for (const key of Object.keys(groupsRef.current)) {
      if (!instanceKeys.has(key)) {
        disposeGroup(groupsRef.current[key]);
        sceneRef.current?.remove(groupsRef.current[key]);
        delete groupsRef.current[key];
        delete origMatricesRef.current[key];
        sceneChanged = true;
      }
    }
    if (sceneChanged) explodeDataRef.current = null;
    for (const uuid of [...loadingRef.current]) {
      if (!rawUuids.has(uuid)) loadingRef.current.delete(uuid);
    }
    setPartStates(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (!instanceKeys.has(key)) delete next[key];
      }
      return next;
    });

    // Create/load new instances; update matrix in-place for existing groups
    const newStates = {};
    let needFit = false;
    for (const part of activeParts) {
      const key = part.instanceKey || part.uuid;
      if (groupsRef.current[key]) {
        // Group exists — update matrix if it changed (e.g. re-import updated position attr)
        if (part.matrix) {
          const m4 = new THREE.Matrix4();
          m4.set(
            part.matrix[0],  part.matrix[1],  part.matrix[2],  part.matrix[3],
            part.matrix[4],  part.matrix[5],  part.matrix[6],  part.matrix[7],
            part.matrix[8],  part.matrix[9],  part.matrix[10], part.matrix[11],
            part.matrix[12], part.matrix[13], part.matrix[14], part.matrix[15]
          );
          if (!groupsRef.current[key].matrix.equals(m4)) {
            groupsRef.current[key].matrix.copy(m4);
            groupsRef.current[key].matrixAutoUpdate = false;
            needFit = true;
          }
        }
        continue;
      }

      if (meshDataRef.current[part.uuid]) {
        // Cached — create instance immediately without re-loading
        const outlineColor = partColorRef.current[key] || '#6b7280';
        const group = renderModeRef.current === 'realistic'
          ? buildGroupRealistic(meshDataRef.current[part.uuid])
          : buildGroup(meshDataRef.current[part.uuid], outlineColor);
        group.name = key;
        if (part.matrix) {
          const m4 = new THREE.Matrix4();
          m4.set(
            part.matrix[0],  part.matrix[1],  part.matrix[2],  part.matrix[3],
            part.matrix[4],  part.matrix[5],  part.matrix[6],  part.matrix[7],
            part.matrix[8],  part.matrix[9],  part.matrix[10], part.matrix[11],
            part.matrix[12], part.matrix[13], part.matrix[14], part.matrix[15]
          );
          group.matrix.copy(m4);
          group.matrixAutoUpdate = false;
        }
        sceneRef.current?.add(group);
        groupsRef.current[key] = group;
        newStates[key] = { phase: 'ready', error: null, visible: true };
        needFit = true;
      } else if (!loadingRef.current.has(part.uuid)) {
        loadingRef.current.add(part.uuid);
        newStates[key] = { phase: 'loading', error: null, visible: true };
        _stepWorker.postMessage({ type: 'load', uuid: part.uuid, kind: part.kind || 'design', token: getSessionToken(), projectSpace: getProjectSpaceId() });
      } else {
        // In-flight load — set loading state for this instance key
        newStates[key] = { phase: 'loading', error: null, visible: true };
      }
    }
    if (needFit) fitCamera();
    if (Object.keys(newStates).length > 0) {
      explodeDataRef.current = null; // invalidate direction cache on new geometry
      if (explodeFactorRef.current > 0 && !explodeAnimRef.current) applyExplode(explodeFactorRef.current);
      setPartStates(prev => ({ ...prev, ...newStates }));
    }
  }, [activeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────
  function fitCamera() {
    onResizeRef.current?.();
    const scene    = sceneRef.current;
    const camera   = cameraRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera) return;

    // Force matrixWorld update before bounding-box traversal — necessary for
    // groups with matrixAutoUpdate=false (custom position matrices from BOM links)
    // whose matrixWorld has not yet been computed by the RAF loop's renderer.render().
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3();
    scene.traverse(obj => { if (obj.isMesh && obj.visible) box.expandByObject(obj); });
    if (box.isEmpty()) return;

    setSceneBounds({
      x: [box.min.x, box.max.x],
      y: [box.min.y, box.max.y],
      z: [box.min.z, box.max.z],
    });

    const center = new THREE.Vector3();
    const size   = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const d = Math.max(size.x, size.y, size.z) || 1;
    camera.near = d * 0.0001;
    camera.far  = d * 200;
    camera.position.set(center.x + d * 1.5, center.y + d, center.z + d * 2);
    camera.lookAt(center);
    if (controls) { controls.target.copy(center); controls.update(); }
    camera.updateProjectionMatrix();
  }

  function applyExplode(factor) {
    const scene = sceneRef.current;
    if (!scene) return;
    // Store original matrices on first call (before any displacement)
    for (const [key, group] of Object.entries(groupsRef.current)) {
      if (!origMatricesRef.current[key]) origMatricesRef.current[key] = group.matrix.clone();
    }
    // Reset all groups to original matrices
    for (const [key, group] of Object.entries(groupsRef.current)) {
      const orig = origMatricesRef.current[key];
      if (orig) { group.matrix.copy(orig); group.matrixAutoUpdate = false; }
    }
    if (factor === 0) return;

    // Build direction + distance cache — only on first call per assembly change.
    // scene.updateMatrixWorld() lives HERE only, never in the animation hot path.
    if (!explodeDataRef.current) {
      scene.updateMatrixWorld(true);
      const sceneBox = new THREE.Box3();
      scene.traverse(obj => { if (obj.isMesh && obj.visible) sceneBox.expandByObject(obj); });
      if (sceneBox.isEmpty()) return;
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));

      const snapToAxis = (vec) => {
        const ax = Math.abs(vec.x), ay = Math.abs(vec.y), az = Math.abs(vec.z);
        if (ax >= ay && ax >= az) return new THREE.Vector3(Math.sign(vec.x) || 1, 0, 0);
        if (ay >= ax && ay >= az) return new THREE.Vector3(0, Math.sign(vec.y) || 1, 0);
        return new THREE.Vector3(0, 0, Math.sign(vec.z) || 1);
      };

      // Build nodeId → clusterId map from nodes prop (DFS-ordered, depth field).
      // Cluster = depth-1 node (direct child of root assembly): nacelle, engine, pylon, etc.
      const nodeToCluster = {};
      let curCluster = null;
      for (const n of nodes) {
        if (n.depth === 0)      curCluster = null;
        else if (n.depth === 1) curCluster = n.nodeId;
        nodeToCluster[n.nodeId] = curCluster;
      }

      // Group 3D parts: clusterId → nodeId → [{ key, center, radius }]
      const byCluster = {};
      for (const [key, group] of Object.entries(groupsRef.current)) {
        const nodeId    = partNodeMapRef.current[key] || '__root__';
        const clusterId = nodeToCluster[nodeId] ?? '__root__';
        if (!byCluster[clusterId])         byCluster[clusterId] = {};
        if (!byCluster[clusterId][nodeId]) byCluster[clusterId][nodeId] = [];
        const bbox = new THREE.Box3().setFromObject(group);
        byCluster[clusterId][nodeId].push({
          key,
          center: bbox.getCenter(new THREE.Vector3()),
          radius: bbox.getSize(new THREE.Vector3()).length() * 0.5,
        });
      }

      // Explosion origin = mean of all part centers (robust vs bounding box pulled by outlier sub-assemblies)
      let nParts = 0;
      const explosionOrigin = new THREE.Vector3();
      for (const nm of Object.values(byCluster))
        for (const parts of Object.values(nm))
          for (const p of parts) { explosionOrigin.add(p.center); nParts++; }
      if (nParts > 0) explosionOrigin.divideScalar(nParts);

      // Compute cluster geometry + classify
      const clusterList = Object.entries(byCluster).map(([clusterId, nodeMap]) => {
        const allParts = Object.values(nodeMap).flat();
        const clusterCenter = allParts.reduce(
          (acc, p) => { acc.x+=p.center.x; acc.y+=p.center.y; acc.z+=p.center.z; return acc; },
          new THREE.Vector3(),
        ).divideScalar(allParts.length);
        const clusterRadius = allParts.reduce((m, p) => Math.max(m, p.center.distanceTo(clusterCenter) + p.radius), 0);
        const clusterVec  = clusterCenter.clone().sub(explosionOrigin);
        const clusterDist = clusterVec.length();
        return { clusterId, nodeMap, clusterCenter, clusterRadius, clusterVec, clusterDist };
      });

      // Outer casing threshold: nacelle wraps engine → largest cluster radius
      const maxClusterRadius = clusterList.reduce((m, c) => Math.max(m, c.clusterRadius), 0);
      const outerThreshold   = maxClusterRadius * 0.55;

      clusterList.forEach((ci, idx) => {
        const { clusterVec, clusterDist, clusterRadius } = ci;
        if (clusterDist < 1e-6) {
          const phi = Math.acos(1 - 2 * (idx + 0.5) / Math.max(clusterList.length, 1));
          const theta = goldenAngle * idx;
          ci.clusterDir = new THREE.Vector3(Math.sin(phi)*Math.cos(theta), Math.cos(phi), Math.sin(phi)*Math.sin(theta));
          ci.isAxisAligned = false;
        } else if (clusterRadius >= outerThreshold) {
          ci.clusterDir = clusterVec.clone().divideScalar(clusterDist);  // nacelle: natural outward
          ci.isAxisAligned = false;
        } else {
          ci.clusterDir = snapToAxis(clusterVec);  // engine stages, pylon: snap to principal axis
          ci.isAxisAligned = true;
        }
        ci.origPosAlongAxis    = ci.clusterCenter.dot(ci.clusterDir);
        ci.naturalClusterDist  = Math.max(clusterDist, clusterRadius * 1.2);
      });

      // Cumulative 1D packing at cluster level (non-blocking along each axis)
      const byClusterAxis = {};
      clusterList.forEach(ci => {
        if (!ci.isAxisAligned) { ci.effectiveClusterDist = ci.naturalClusterDist; return; }
        (byClusterAxis[`${ci.clusterDir.x},${ci.clusterDir.y},${ci.clusterDir.z}`] ??= []).push(ci);
      });
      for (const group of Object.values(byClusterAxis)) {
        group.sort((a, b) => a.origPosAlongAxis - b.origPosAlongAxis);
        let prevExploded = -Infinity, prevRadius = 0;
        for (const ci of group) {
          const gap      = ci.clusterRadius * 0.15;
          const exploded = Math.max(ci.origPosAlongAxis + ci.naturalClusterDist, prevExploded + prevRadius + ci.clusterRadius + gap);
          ci.effectiveClusterDist = Math.max(exploded - ci.origPosAlongAxis, 0);
          prevExploded = exploded; prevRadius = ci.clusterRadius;
        }
      }

      // Build per-part entries — 3-level hierarchy: cluster → node → part
      const entries = [];
      for (const { clusterCenter, clusterDir, effectiveClusterDist, nodeMap } of clusterList) {
        for (const [, parts] of Object.entries(nodeMap)) {
          // Node centroid relative to cluster center
          const nodeCenter = parts.reduce(
            (acc, p) => { acc.x+=p.center.x; acc.y+=p.center.y; acc.z+=p.center.z; return acc; },
            new THREE.Vector3(),
          ).divideScalar(parts.length);
          const nodeRadius = parts.reduce((m, p) => Math.max(m, p.center.distanceTo(nodeCenter) + p.radius), 0);
          const nodeVec    = nodeCenter.clone().sub(clusterCenter);
          const nodeDist   = nodeVec.length();
          const nodeDir    = nodeDist > 1e-6 ? nodeVec.clone().divideScalar(nodeDist) : clusterDir.clone();
          const effectiveNodeDist = Math.max(nodeDist, nodeRadius * 1.0);

          const perpBase = Math.abs(nodeDir.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
          const perpAxis = perpBase.clone().cross(nodeDir).normalize();

          parts.forEach(({ key, center, radius: partRadius }, partIdx) => {
            const partVec  = center.clone().sub(nodeCenter);
            const partDist = partVec.length();
            let partDir;
            if (partDist > 1e-6) {
              partDir = partVec.clone().divideScalar(partDist);
            } else {
              const angle = (2 * Math.PI * partIdx) / Math.max(parts.length, 1);
              partDir = perpAxis.clone().applyAxisAngle(nodeDir, angle);
              if (partDir.length() < 0.1) partDir = nodeDir.clone();
            }
            const effectivePartDist = Math.max(partDist, partRadius * 1.2);
            entries.push({ key, clusterDir, effectiveClusterDist, nodeDir, effectiveNodeDist, partDir, effectivePartDist });
          });
        }
      }
      explodeDataRef.current = { entries };
    }

    // Hot path — pure matrix math, no scene traversal, scratch objects reused (no GC)
    const { entries } = explodeDataRef.current;
    const scale = factor * 2.0;
    for (const { key, clusterDir, effectiveClusterDist, nodeDir, effectiveNodeDist, partDir, effectivePartDist } of entries) {
      const group = groupsRef.current[key];
      const orig  = origMatricesRef.current[key];
      if (!group || !orig) continue;
      _explodeVec.set(
        (clusterDir.x * effectiveClusterDist + nodeDir.x * effectiveNodeDist + partDir.x * effectivePartDist) * scale,
        (clusterDir.y * effectiveClusterDist + nodeDir.y * effectiveNodeDist + partDir.y * effectivePartDist) * scale,
        (clusterDir.z * effectiveClusterDist + nodeDir.z * effectiveNodeDist + partDir.z * effectivePartDist) * scale,
      );
      _explodeMat.makeTranslation(_explodeVec.x, _explodeVec.y, _explodeVec.z);
      group.matrix.multiplyMatrices(_explodeMat, orig);
      group.matrixAutoUpdate = false;
    }
  }

  // Static explode — only runs when NOT transitioning; slider changes go through explodeFactorRef
  useEffect(() => {
    if (explodeAnim !== null) return;
    applyExplode(explodeFactor);
  }, [explodeFactor]); // eslint-disable-line

  // One-shot transition: eased tween from explodeAnim.from → explodeAnim.to, then stop
  useEffect(() => {
    if (explodeAnimRef.current) { cancelAnimationFrame(explodeAnimRef.current); explodeAnimRef.current = null; }
    if (explodeAnim === null) return;
    explodeDataRef.current = null;
    const { from, to } = explodeAnim;
    const duration = 600;
    const start = performance.now();
    const tick = () => {
      const raw = Math.min((performance.now() - start) / duration, 1);
      const ease = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      const factor = from + (to - from) * ease;
      explodeFactorRef.current = factor;
      applyExplode(factor);
      if (raw < 1) {
        explodeAnimRef.current = requestAnimationFrame(tick);
      } else {
        explodeAnimRef.current = null;
        setExplodeFactor(to);
        setExplodeAnim(null);
        if (to === 0) setExplodeActive(false);
      }
    };
    explodeAnimRef.current = requestAnimationFrame(tick);
    return () => { if (explodeAnimRef.current) { cancelAnimationFrame(explodeAnimRef.current); explodeAnimRef.current = null; } };
  }, [explodeAnim]); // eslint-disable-line

  // Clip plane effect
  useEffect(() => {
    const renderer = rendererRef.current;
    const scene    = sceneRef.current;
    if (!renderer || !scene) return;
    if (planeHelperRef.current) {
      scene.remove(planeHelperRef.current);
      planeHelperRef.current.geometry?.dispose();
      planeHelperRef.current.material?.dispose();
      planeHelperRef.current = null;
    }
    if (!clipEnabled) { renderer.clippingPlanes = []; clipPlaneRef.current = null; return; }
    // normal points inward (negative axis) → clips above clipPos, keeps below
    const axisNormals = { X: new THREE.Vector3(-1, 0, 0), Y: new THREE.Vector3(0, -1, 0), Z: new THREE.Vector3(0, 0, -1) };
    const plane = new THREE.Plane(axisNormals[clipAxis], clipPos);
    clipPlaneRef.current = plane;
    renderer.clippingPlanes = [plane];
    // PlaneHelper size from scene bounding box diagonal
    const box = new THREE.Box3();
    scene.updateMatrixWorld(true);
    scene.traverse(obj => { if (obj.isMesh && obj.visible) box.expandByObject(obj); });
    const helperSize = box.isEmpty() ? 10 : box.getSize(new THREE.Vector3()).length() * 1.2;
    const helper = new THREE.PlaneHelper(plane, helperSize, 0x88aaff);
    scene.add(helper);
    planeHelperRef.current = helper;
  }, [clipEnabled, clipAxis, clipPos]); // eslint-disable-line

  // Render mode effect — switches lighting and rebuilds all groups with correct material
  useEffect(() => {
    renderModeRef.current = renderMode;
    // Lighting: realistic gets warm physical sun + hemisphere; cartoon gets flat studio
    const a = ambientLightRef.current;
    const s = sunLightRef.current;
    const h = hemiLightRef.current;
    if (a && s && h) {
      if (renderMode === 'realistic') {
        a.intensity = 0.2;  a.color.set(0xfff0d0);
        s.intensity = 3.0;  s.color.set(0xfff4e0); s.position.set(10, 20, 8);
        h.intensity = 1.0;
      } else {
        a.intensity = 0.7;  a.color.set(0xffffff);
        s.intensity = 1.2;  s.color.set(0xffffff); s.position.set(8, 12, 6);
        h.intensity = 0;
      }
    }
    rebuildAllGroups(renderMode);
  }, [renderMode]); // eslint-disable-line

  function toggleVisibility(key) {
    const group = groupsRef.current[key];
    if (!group) return;
    const next = !group.visible;
    group.visible = next;
    setPartStates(prev => ({ ...prev, [key]: { ...prev[key], visible: next } }));
  }

  function removePart(key) {
    const group = groupsRef.current[key];
    if (group) {
      disposeGroup(group);
      sceneRef.current?.remove(group);
      delete groupsRef.current[key];
    }
    setRemovedKeys(prev => new Set([...prev, key]));
    setPartStates(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  function toggleNodeCollapse(nodeId) {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      return next;
    });
  }

  function applySelection(keys) {
    for (const key of selectedKeysRef.current) {
      if (hoveredUuidRef.current === key) continue;
      const g = groupsRef.current[key];
      if (!g) continue;
      g.traverse(obj => {
        if (!obj.isMesh) return;
        if (obj.userData.isOutline) {
          obj.material.uniforms.color.value.set(partColorRef.current[key] || '#6b7280');
        } else {
          obj.material.emissive.set(0x000000);
        }
      });
    }
    selectedKeysRef.current = new Set(keys);
    for (const key of selectedKeysRef.current) {
      if (hoveredUuidRef.current === key) continue;
      const g = groupsRef.current[key];
      if (!g) continue;
      g.traverse(obj => {
        if (!obj.isMesh) return;
        if (obj.userData.isOutline) {
          obj.material.uniforms.color.value.set('#3b82f6');
        } else {
          obj.material.emissive.set(0x1a3a6e);
        }
      });
    }
  }

  useEffect(() => {
    applySelection(highlightedInstanceKeys);
  }, [highlightedInstanceKeys]); // eslint-disable-line react-hooks/exhaustive-deps

  function rebuildAllGroups(mode) {
    const scene = sceneRef.current;
    if (!scene) return;
    // Dispose all existing groups
    for (const group of Object.values(groupsRef.current)) { disposeGroup(group); scene.remove(group); }
    groupsRef.current    = {};
    origMatricesRef.current = {};
    explodeDataRef.current  = null;
    // Rebuild from geometry cache — only parts whose geometry is already fetched
    for (const part of activePartsRef.current) {
      const key    = part.instanceKey || part.uuid;
      const meshes = meshDataRef.current[part.uuid];
      if (!meshes) continue;
      const outlineColor = partColorRef.current[key] || '#6b7280';
      const group = mode === 'realistic'
        ? buildGroupRealistic(meshes)
        : buildGroup(meshes, outlineColor);
      group.name = key;
      if (part.matrix) {
        const m4 = new THREE.Matrix4();
        m4.set(
          part.matrix[0],  part.matrix[1],  part.matrix[2],  part.matrix[3],
          part.matrix[4],  part.matrix[5],  part.matrix[6],  part.matrix[7],
          part.matrix[8],  part.matrix[9],  part.matrix[10], part.matrix[11],
          part.matrix[12], part.matrix[13], part.matrix[14], part.matrix[15],
        );
        group.matrix.copy(m4); group.matrixAutoUpdate = false;
      }
      scene.add(group);
      groupsRef.current[key] = group;
    }
    // Reapply explode and selection if active
    if (explodeFactorRef.current > 0 && !explodeAnimRef.current) applyExplode(explodeFactorRef.current);
    applySelection([...selectedKeysRef.current]);
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* Parts sidebar — collapsable */}
      {sidebarCollapsed ? (
        <div
          style={{
            width: 28, flexShrink: 0, cursor: 'pointer',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 6,
            background: 'var(--surface)',
          }}
          onClick={() => setSidebarCollapsed(false)}
          title="Show parts panel"
        >
          <ChevronRightIcon size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <span style={{
            writingMode: 'vertical-rl', fontSize: 10, fontWeight: 600,
            color: 'var(--muted)', userSelect: 'none', letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            Parts
          </span>
        </div>
      ) : (
        <div style={{
          width: 220, flexShrink: 0,
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '5px 8px 5px 10px', fontSize: 11, fontWeight: 600,
            color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1,
            borderBottom: '1px solid var(--border)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>Parts</span>
            <button
              className="panel-icon-btn"
              onClick={() => setSidebarCollapsed(true)}
              title="Collapse parts panel"
            >
              <ChevronLeftIcon size={13} />
            </button>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div style={{ padding: '6px 10px', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
              Loading…
            </div>
          )}

          {/* Empty state */}
          {!loading && nodes.length === 0 && (
            <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--muted)' }}>
              No parts
            </div>
          )}

          {/* Node groups */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {nodes.map(node => {
              const nodeActiveParts = node.parts.filter(p => !removedKeys.has(p.instanceKey || p.uuid));
              if (nodeActiveParts.length === 0) return null;
              const isCollapsed = collapsedNodes.has(node.nodeId);
              const dotColor    = node.stateColor || '#6b7280';
              return (
                <div key={node.instanceId || node.nodeId}>
                  {/* Group header */}
                  <div
                    onClick={() => toggleNodeCollapse(node.nodeId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: `4px 8px 4px ${8 + node.depth * 12}px`,
                      cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      color: 'var(--muted)', borderBottom: '1px solid var(--border)',
                      background: 'var(--surface)', userSelect: 'none',
                    }}
                  >
                    <span style={{
                      width: 7, height: 7, borderRadius: 2, background: dotColor,
                      flexShrink: 0, display: 'inline-block',
                    }} />
                    <span style={{
                      flex: 1, minWidth: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }} title={node.nodeLabel}>
                      {node.nodeLabel}
                    </span>
                    <span style={{ fontSize: 9, flexShrink: 0 }}>{isCollapsed ? '▶' : '▼'}</span>
                  </div>

                  {/* Part rows */}
                  {!isCollapsed && nodeActiveParts.map(part => {
                    const partKey = part.instanceKey || part.uuid;
                    const st  = partStates[partKey] || {};
                    const vis = st.visible !== false;
                    return (
                      <div key={partKey} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: `4px 8px 4px ${14 + node.depth * 12}px`,
                        fontSize: 12, borderBottom: '1px solid var(--border)',
                      }}>
                        <input
                          type="checkbox"
                          checked={vis}
                          disabled={st.phase !== 'ready'}
                          onChange={() => toggleVisibility(partKey)}
                          style={{ flexShrink: 0, cursor: st.phase === 'ready' ? 'pointer' : 'default' }}
                        />
                        <span style={{
                          flex: 1, minWidth: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          color: st.phase === 'error' ? 'var(--danger, #e05252)' : 'inherit',
                          opacity: vis ? 1 : 0.45,
                        }} title={st.phase === 'error' ? st.error : part.fileName}>
                          {part.fileName || part.uuid}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>
                          {st.phase === 'loading' && (downloadProgress[part.uuid]
                            ? `${Math.round(downloadProgress[part.uuid].loaded / downloadProgress[part.uuid].total * 100)}%`
                            : '…'
                          )}
                          {st.phase === 'error'   && '✗'}
                        </span>
                        <button
                          className="panel-icon-btn"
                          onClick={() => removePart(partKey)}
                          title="Remove from scene"
                          style={{ fontSize: 13, lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Three.js canvas + toolbar overlay */}
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0, position: 'relative' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* 3D controls toolbar */}
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '4px 7px', fontSize: 11,
          userSelect: 'none',
        }}>
          {/* Explode view */}
          <button
            className="panel-icon-btn"
            style={{ fontWeight: 600, color: explodeActive ? 'var(--accent, #3b82f6)' : 'var(--muted)', padding: '1px 4px' }}
            title="Exploded view"
            onClick={() => {
              if (isDraggingRef.current) return;
              if (explodeAnim !== null) return;
              explodeDataRef.current = null;
              if (explodeActive) {
                setExplodeAnim({ from: explodeFactor, to: 0 });
              } else {
                setExplodeActive(true);
                setExplodeFactor(0.5);
                explodeFactorRef.current = 0.5;
                setExplodeAnim({ from: 0, to: 0.5 });
              }
            }}
          >
            Explode
          </button>
          {explodeActive && <>
            <input type="range" min={0} max={2} step={0.01} value={explodeFactor}
              style={{ width: 72, cursor: 'pointer', opacity: explodeAnim !== null ? 0.4 : 1 }}
              title="Explode factor"
              disabled={explodeAnim !== null}
              onPointerDown={() => { isDraggingRef.current = true; }}
              onPointerUp={() => { setTimeout(() => { isDraggingRef.current = false; }, 0); }}
              onChange={e => {
                const v = parseFloat(e.target.value);
                explodeFactorRef.current = v;
                setExplodeFactor(v);
              }}
            />
          </>}

          <div style={{ width: 1, height: 14, background: 'var(--border)', margin: '0 2px' }} />

          {/* Clipping plane */}
          <button
            className="panel-icon-btn"
            style={{ fontWeight: 600, color: clipEnabled ? 'var(--accent, #3b82f6)' : 'var(--muted)', padding: '1px 4px' }}
            title="Section plane"
            onClick={() => {
              if (isDraggingRef.current) return;
              const enabling = !clipEnabled;
              if (enabling && sceneBounds) setClipPos(sceneBounds[clipAxis.toLowerCase()][1]);
              setClipEnabled(enabling);
            }}
          >
            Section
          </button>
          {clipEnabled && <>
            {['X', 'Y', 'Z'].map(a => (
              <button key={a} className="panel-icon-btn"
                style={{ fontWeight: clipAxis === a ? 700 : 400, color: clipAxis === a ? 'var(--accent, #3b82f6)' : 'var(--muted)', padding: '1px 3px' }}
                onClick={() => {
                  if (isDraggingRef.current) return;
                  setClipAxis(a);
                  if (sceneBounds) setClipPos((sceneBounds[a.toLowerCase()][0] + sceneBounds[a.toLowerCase()][1]) / 2);
                }}
              >{a}</button>
            ))}
            <input type="range"
              min={sceneBounds ? sceneBounds[clipAxis.toLowerCase()][0] : -10}
              max={sceneBounds ? sceneBounds[clipAxis.toLowerCase()][1] : 10}
              step={sceneBounds ? (sceneBounds[clipAxis.toLowerCase()][1] - sceneBounds[clipAxis.toLowerCase()][0]) / 200 : 0.1}
              value={clipPos}
              style={{ width: 72, cursor: 'pointer' }}
              onPointerDown={() => { isDraggingRef.current = true; }}
              onPointerUp={() => { setTimeout(() => { isDraggingRef.current = false; }, 0); }}
              onChange={e => setClipPos(parseFloat(e.target.value))}
            />
          </>}

          <div style={{ width: 1, height: 14, background: 'var(--border)', margin: '0 2px' }} />

          {/* Render mode */}
          <button
            className="panel-icon-btn"
            style={{ fontWeight: 600, color: renderMode === 'realistic' ? 'var(--accent, #3b82f6)' : 'var(--muted)', padding: '1px 4px' }}
            title={renderMode === 'realistic' ? 'Switch to cartoon view' : 'Switch to realistic view'}
            onClick={() => {
              if (isDraggingRef.current) return;
              setRenderMode(m => m === 'cartoon' ? 'realistic' : 'cartoon');
            }}
          >
            {renderMode === 'realistic' ? 'Design' : 'Realistic'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Pre-allocated scratch objects for applyExplode hot path — avoids GC pressure during animation
const _explodeVec = new THREE.Vector3();
const _explodeMat = new THREE.Matrix4();

function buildGroupRealistic(meshes) {
  const group = new THREE.Group();
  for (const mesh of meshes) {
    if (!mesh.positions) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
    if (mesh.normals) geo.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
    if (mesh.indices) geo.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
    const color = mesh.color
      ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2])
      : new THREE.Color(0x5b9cf6);
    group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color, roughness: 0.38, metalness: 0.12, side: THREE.DoubleSide,
    })));
  }
  return group;
}

// meshes: [{ positions: Float32Array, normals: Float32Array|null, indices: Uint32Array|null, color: [r,g,b]|null }]
function buildGroup(meshes, outlineColor = '#6b7280') {
  const group   = new THREE.Group();
  const olColor = new THREE.Color(outlineColor);
  for (const mesh of meshes) {
    if (!mesh.positions) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
    if (mesh.normals) geo.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
    if (mesh.indices) geo.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
    const color = mesh.color
      ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2])
      : new THREE.Color(0x5b9cf6);

    group.add(new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color, side: THREE.DoubleSide })));

    // BackSide screen-space extrusion — cartoon hard edge in lifecycle color.
    // clipping: true → respects renderer.clippingPlanes (section plane).
    const outlineMesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      clipping: true,
      side: THREE.BackSide,
      uniforms: { color: { value: olColor.clone() }, thickness: { value: 0.007 } },
      vertexShader: `
#include <clipping_planes_pars_vertex>
uniform float thickness;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vec4 clipPos    = projectionMatrix * mvPosition;
  vec3 viewNorm   = normalize(normalMatrix * normal);
  vec2 sn         = viewNorm.xy;
  float snLen     = length(sn);
  vec2 offset     = snLen > 1e-4 ? sn / snLen : vec2(0.0);
  clipPos.xy     += offset * thickness * clipPos.w;
  gl_Position     = clipPos;
  #include <clipping_planes_vertex>
}`,
      fragmentShader: `
#include <clipping_planes_pars_fragment>
uniform vec3 color;
void main() {
  #include <clipping_planes_fragment>
  gl_FragColor = vec4(color, 1.0);
}`,
    }));
    outlineMesh.renderOrder = 1;
    outlineMesh.userData.isOutline = true;
    group.add(outlineMesh);
  }
  return group;
}

function disposeGroup(group) {
  group.traverse(obj => {
    obj.geometry?.dispose();
    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
    else obj.material?.dispose();
  });
}
