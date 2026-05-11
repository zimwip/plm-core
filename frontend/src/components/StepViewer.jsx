import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ViewportGizmo } from 'three-viewport-gizmo';
import { getSessionToken, getProjectSpaceId } from '../services/api';
import { stepWorker as _stepWorker } from '../workers/stepWorkerInstance';
import { ChevronRightIcon, ChevronLeftIcon } from './Icons';

// nodes: [{ nodeId, nodeLabel, stateColor, depth, instanceId, parts: [{ uuid, fileName, sizeBytes, instanceKey, matrix }] }]
export default function StepViewer({ nodes = [], loading = false, onNavigateToNode }) {
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
  const onNavRef      = useRef(onNavigateToNode);
  const hoveredUuidRef = useRef(null);
  const meshDataRef    = useRef({});  // uuid → meshes array (cache for multi-instance)
  const activePartsRef = useRef([]);  // current activeParts (for worker handler closure)

  useEffect(() => { onNavRef.current = onNavigateToNode; }, [onNavigateToNode]);

  const [partStates,      setPartStates]      = useState({});
  // { [uuid]: { phase: 'loading'|'ready'|'error', error, visible } }

  const [removedKeys,     setRemovedKeys]     = useState(() => new Set());
  const [collapsedNodes,  setCollapsedNodes]  = useState(() => new Set());

  // Reset manual removals when the primary node changes (editor switched to different node)
  const primaryNodeId = nodes[0]?.nodeId;
  useEffect(() => { setRemovedKeys(new Set()); }, [primaryNodeId]); // eslint-disable-line react-hooks/exhaustive-deps
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

    // Patch materials on groups that were built before the correct color was known
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
        const g = groupsRef.current[prev];
        if (g) g.traverse(obj => {
          if (!obj.isMesh) return;
          if (obj.userData.isOutline) {
            obj.material.uniforms.color.value.set(partColorRef.current[prev] || '#6b7280');
          } else {
            obj.material.emissive.set(0x000000);
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
            obj.material.emissive.set(0x666666);
          }
        });
      }
      hoveredUuidRef.current = uuid;
      renderer.domElement.style.cursor = uuid ? 'pointer' : 'default';
    }

    function onMouseMove(e) { applyHover(pickUuid(e)); }
    function onMouseLeave()  { applyHover(null); }

    function onCanvasClick(e) {
      if (!e.ctrlKey && !e.metaKey) return;
      const uuid = pickUuid(e);
      if (!uuid) return;
      const nodeId = partNodeMapRef.current[uuid];
      if (nodeId && onNavRef.current) onNavRef.current(nodeId);
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
      loadingRef.current.delete(uuid);
      if (type === 'ready') {
        // Cache mesh data for multi-instance reuse
        meshDataRef.current[uuid] = data.meshes;
        // Find all active instances of this uuid
        const instances = activePartsRef.current.filter(p => p.uuid === uuid);
        const newStates = {};
        for (const p of instances) {
          const key = p.instanceKey || p.uuid;
          if (groupsRef.current[key]) continue;
          const outlineColor = partColorRef.current[key] || '#6b7280';
          const group = buildGroup(data.meshes, outlineColor);
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
          setPartStates(prev => ({ ...prev, ...newStates }));
        }
      } else if (type === 'error') {
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
    for (const key of Object.keys(groupsRef.current)) {
      if (!instanceKeys.has(key)) {
        disposeGroup(groupsRef.current[key]);
        sceneRef.current?.remove(groupsRef.current[key]);
        delete groupsRef.current[key];
      }
    }
    for (const uuid of [...loadingRef.current]) {
      if (!rawUuids.has(uuid)) loadingRef.current.delete(uuid);
    }
    for (const uuid of Object.keys(meshDataRef.current)) {
      if (!rawUuids.has(uuid)) delete meshDataRef.current[uuid];
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
        const group = buildGroup(meshDataRef.current[part.uuid], outlineColor);
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
    if (Object.keys(newStates).length > 0) setPartStates(prev => ({ ...prev, ...newStates }));
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
                          {st.phase === 'loading' && '…'}
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

      {/* Three.js canvas */}
      <div ref={mountRef} style={{ flex: 1, overflow: 'hidden', minWidth: 0, position: 'relative' }} />
    </div>
  );
}

// meshes: [{ positions: Float32Array, normals: Float32Array|null, indices: Uint32Array|null, color: [r,g,b]|null }]
function buildGroup(meshes, outlineColor = '#6b7280') {
  const group   = new THREE.Group();
  const olColor = new THREE.Color(outlineColor);
  for (const mesh of meshes) {
    if (!mesh.positions) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
    if (mesh.normals)  geo.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
    if (mesh.indices)  geo.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
    const color = mesh.color
      ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2])
      : new THREE.Color(0x5b9cf6);

    const mainMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide }));
    group.add(mainMesh);

    // Screen-space normal extrusion outline — shifts vertices along their projected view-space
    // normal, so flat faces (normal toward camera → viewNorm.xy ≈ 0) get zero offset and
    // produce no artifact; only silhouette edges where the normal is perpendicular to view
    // get pushed outward.
    const outlineMesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { color: { value: olColor.clone() }, thickness: { value: 0.007 } },
      vertexShader: `
uniform float thickness;
void main() {
  vec4 mvPos    = modelViewMatrix * vec4(position, 1.0);
  vec4 clipPos  = projectionMatrix * mvPos;
  vec3 viewNorm = normalize(normalMatrix * normal);
  vec2 sn       = viewNorm.xy;
  float snLen   = length(sn);
  vec2 offset   = snLen > 1e-4 ? sn / snLen : vec2(0.0);
  clipPos.xy   += offset * thickness * clipPos.w;
  gl_Position   = clipPos;
}`,
      fragmentShader: `
uniform vec3 color;
void main() { gl_FragColor = vec4(color, 1.0); }`,
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
