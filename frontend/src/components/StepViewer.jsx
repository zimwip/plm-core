import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ViewportGizmo } from 'three-viewport-gizmo';
import { dstApi } from '../services/api';
import { ChevronRightIcon, ChevronLeftIcon } from './Icons';

let _occtReady = null;
function loadOcct() {
  if (!_occtReady) {
    _occtReady = import('occt-import-js').then(mod =>
      mod.default({ locateFile: () => '/occt/occt-import-js.wasm' })
    );
  }
  return _occtReady;
}

// nodes: [{ nodeId, nodeLabel, stateColor, depth, parts: [{ uuid, fileName, sizeBytes }] }]
export default function StepViewer({ nodes = [], loading = false, onNavigateToNode }) {
  const mountRef    = useRef(null);
  const sceneRef    = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef   = useRef(null);
  const controlsRef = useRef(null);
  const gizmoRef    = useRef(null);
  const rafRef      = useRef(null);
  const groupsRef   = useRef({});     // uuid → THREE.Group
  const loadingRef  = useRef(new Set());
  const partNodeMapRef  = useRef({}); // uuid → nodeId
  const partColorRef    = useRef({}); // uuid → stateColor
  const onNavRef    = useRef(onNavigateToNode);

  useEffect(() => { onNavRef.current = onNavigateToNode; }, [onNavigateToNode]);

  const [partStates,      setPartStates]      = useState({});
  // { [uuid]: { phase: 'loading'|'ready'|'error', error, visible } }

  const [removedUuids,    setRemovedUuids]    = useState(() => new Set());
  const [collapsedNodes,  setCollapsedNodes]  = useState(() => new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Rebuild part → node maps; also patch outline materials on already-loaded groups
  useEffect(() => {
    const nodeMap  = {};
    const colorMap = {};
    nodes.forEach(n => n.parts.forEach(p => {
      nodeMap[p.uuid]  = n.nodeId;
      colorMap[p.uuid] = n.stateColor || '#6b7280';
    }));
    partNodeMapRef.current = nodeMap;
    partColorRef.current   = colorMap;

    // Patch materials on groups that were built before the correct color was known
    Object.entries(colorMap).forEach(([uuid, color]) => {
      const group = groupsRef.current[uuid];
      if (!group) return;
      const olColor = new THREE.Color(color);
      group.traverse(obj => {
        if (obj.isMesh && obj.userData.isOutline) obj.material.color.copy(olColor);
      });
    });
  }, [nodes]);

  const allParts    = nodes.flatMap(n => n.parts);
  const activeParts = allParts.filter(p => !removedUuids.has(p.uuid));
  const activeKey   = activeParts.map(p => p.uuid).join(',');

  // ── Scene init (once) ────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth  || 600;
    const h = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1c1c2a);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(8, 12, 6);
    scene.add(sun);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.0001, 100000);
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
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

    // ResizeObserver tracks split drag + maximize transitions, not just window resize
    const ro = new ResizeObserver(() => onResize());
    ro.observe(container);

    function onCanvasClick(e) {
      if (!e.ctrlKey && !e.metaKey) return;
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / container.clientWidth)  *  2 - 1,
        ((e.clientY - rect.top)  / container.clientHeight) * -2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const meshes = [];
      scene.traverse(obj => {
        if (obj.isMesh && !obj.userData.isOutline && obj.visible) meshes.push(obj);
      });
      const hits = raycaster.intersectObjects(meshes, false);
      if (!hits.length) return;
      let obj = hits[0].object;
      while (obj && !obj.name) obj = obj.parent;
      if (!obj?.name) return;
      const nodeId = partNodeMapRef.current[obj.name];
      if (nodeId && onNavRef.current) onNavRef.current(nodeId);
    }
    renderer.domElement.addEventListener('click', onCanvasClick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      renderer.domElement.removeEventListener('click', onCanvasClick);
      gizmo.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load new parts ───────────────────────────────────────────
  useEffect(() => {
    for (const part of activeParts) {
      const { uuid } = part;
      if (groupsRef.current[uuid] || loadingRef.current.has(uuid)) continue;

      loadingRef.current.add(uuid);
      setPartStates(prev => ({ ...prev, [uuid]: { phase: 'loading', error: null, visible: true } }));

      (async () => {
        try {
          const buf  = await dstApi.downloadFile(uuid);
          const occt = await loadOcct();
          const res  = occt.ReadStepFile(new Uint8Array(buf), null);

          if (!res?.success || !res.meshes?.length) throw new Error('No geometry found');

          const outlineColor = partColorRef.current[uuid] || '#6b7280';
          const group = buildGroup(res.meshes, outlineColor);
          group.name = uuid;
          sceneRef.current?.add(group);
          groupsRef.current[uuid] = group;
          fitCamera();
          setPartStates(prev => ({ ...prev, [uuid]: { phase: 'ready', error: null, visible: true } }));
        } catch (e) {
          setPartStates(prev => ({ ...prev, [uuid]: { phase: 'error', error: e.message, visible: false } }));
        } finally {
          loadingRef.current.delete(uuid);
        }
      })();
    }
  }, [activeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────
  function fitCamera() {
    const scene    = sceneRef.current;
    const camera   = cameraRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera) return;

    const box = new THREE.Box3();
    scene.traverse(obj => { if (obj.isMesh && !obj.userData.isOutline && obj.visible) box.expandByObject(obj); });
    if (box.isEmpty()) return;

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

  function toggleVisibility(uuid) {
    const group = groupsRef.current[uuid];
    if (!group) return;
    const next = !group.visible;
    group.visible = next;
    setPartStates(prev => ({ ...prev, [uuid]: { ...prev[uuid], visible: next } }));
  }

  function removePart(uuid) {
    const group = groupsRef.current[uuid];
    if (group) {
      disposeGroup(group);
      sceneRef.current?.remove(group);
      delete groupsRef.current[uuid];
    }
    loadingRef.current.delete(uuid);
    setRemovedUuids(prev => new Set([...prev, uuid]));
    setPartStates(prev => { const n = { ...prev }; delete n[uuid]; return n; });
  }

  function toggleNodeCollapse(nodeId) {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      return next;
    });
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
              const nodeActiveParts = node.parts.filter(p => !removedUuids.has(p.uuid));
              if (nodeActiveParts.length === 0) return null;
              const isCollapsed = collapsedNodes.has(node.nodeId);
              const dotColor    = node.stateColor || '#6b7280';
              return (
                <div key={node.nodeId}>
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
                    const st  = partStates[part.uuid] || {};
                    const vis = st.visible !== false;
                    return (
                      <div key={part.uuid} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: `4px 8px 4px ${14 + node.depth * 12}px`,
                        fontSize: 12, borderBottom: '1px solid var(--border)',
                      }}>
                        <input
                          type="checkbox"
                          checked={vis}
                          disabled={st.phase !== 'ready'}
                          onChange={() => toggleVisibility(part.uuid)}
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
                          {st.phase === 'loading' && '…'}
                          {st.phase === 'error'   && '✗'}
                        </span>
                        <button
                          className="panel-icon-btn"
                          onClick={() => removePart(part.uuid)}
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

      {/* Three.js canvas */}
      <div ref={mountRef} style={{ flex: 1, overflow: 'hidden', minWidth: 0, position: 'relative' }} />
    </div>
  );
}

function buildGroup(meshes, outlineColor = '#6b7280') {
  const group   = new THREE.Group();
  const olColor = new THREE.Color(outlineColor);
  for (const mesh of meshes) {
    const pos = mesh.attributes?.position;
    if (!pos) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos.array), 3));
    const nor = mesh.attributes?.normal;
    if (nor) geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nor.array), 3));
    if (mesh.index) geo.setIndex(new THREE.BufferAttribute(new Uint32Array(mesh.index.array), 1));
    if (!nor) geo.computeVertexNormals();
    const color = mesh.color
      ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2])
      : new THREE.Color(0x5b9cf6);

    const mainMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide }));
    group.add(mainMesh);

    // Inverted-hull outline — back-face rendered, slightly scaled, lifecycle state color
    const outlineMesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: olColor, side: THREE.BackSide }),
    );
    outlineMesh.scale.setScalar(1.025);
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
