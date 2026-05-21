import { useState, useEffect, useRef, Fragment } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

const IDENTITY = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function parseMat16(val) {
  if (val == null) return null;
  const parts = String(val).split(',').map(Number);
  return parts.length === 16 && !parts.some(isNaN) ? parts : null;
}

function plmToM4(m) {
  const m4 = new THREE.Matrix4();
  m4.set(m[0],m[1],m[2],m[3], m[4],m[5],m[6],m[7], m[8],m[9],m[10],m[11], m[12],m[13],m[14],m[15]);
  return m4;
}

function m4ToPlm(m4) {
  const e = m4.elements; // column-major: e[col*4+row]
  return [e[0],e[4],e[8],e[12], e[1],e[5],e[9],e[13], e[2],e[6],e[10],e[14], e[3],e[7],e[11],e[15]];
}

function decomposeMat(m) {
  const pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  plmToM4(m).decompose(pos, q, sc);
  const eu = new THREE.Euler().setFromQuaternion(q, 'XYZ');
  return { tx: pos.x, ty: pos.y, tz: pos.z, rx: eu.x*R2D, ry: eu.y*R2D, rz: eu.z*R2D };
}

function composeTRS(t) {
  return m4ToPlm(new THREE.Matrix4().compose(
    new THREE.Vector3(t.tx, t.ty, t.tz),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(t.rx*D2R, t.ry*D2R, t.rz*D2R, 'XYZ')),
    new THREE.Vector3(1,1,1)
  ));
}

function pivotToPlm(pivot) {
  return m4ToPlm(new THREE.Matrix4().compose(pivot.position, pivot.quaternion, new THREE.Vector3(1,1,1)));
}

function fmtN(n) {
  if (Math.abs(n) < 1e-9) return '0';
  return String(parseFloat(n.toPrecision(7)));
}

function toStrMap(t) {
  return { tx: fmtN(t.tx), ty: fmtN(t.ty), tz: fmtN(t.tz), rx: fmtN(t.rx), ry: fmtN(t.ry), rz: fmtN(t.rz) };
}

// ─── Three.js preview sub-component ────────────────────────────────────────
// Mounted lazily (show3D=true) to avoid consuming a WebGL context eagerly.
// Receives the parent's matRef directly — the animate loop reads matRef.current
// every rAF frame, so typing in TRS inputs updates the preview with zero lag
// (no useEffect / React re-render needed for the Three.js side).
function ThreePreview({ matRef, readOnly, onMatChange, tcMode }) {
  const canvasRef = useRef(null);
  const cbRef     = useRef(onMatChange);
  const tcRef     = useRef(null);

  useEffect(() => { cbRef.current = onMatChange; });
  useEffect(() => { tcRef.current?.setMode(tcMode); }, [tcMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 256, H = 200;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x14141e);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.001, 100000);
    camera.position.set(3, 2.5, 4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.GridHelper(6, 6, 0x3a3a5a, 0x2a2a42));
    scene.add(new THREE.AxesHelper(1.5));
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(5, 8, 5);
    scene.add(sun);

    const pivot = new THREE.Group();
    pivot.add(new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.36, 0.16),
      new THREE.MeshPhongMaterial({ color: 0x3399ff, transparent: true, opacity: 0.8 })
    ));
    pivot.add(new THREE.AxesHelper(0.7));
    scene.add(pivot);

    // Apply initial matrix from parent ref
    plmToM4(matRef.current).decompose(pivot.position, pivot.quaternion, pivot.scale);
    pivot.updateMatrixWorld(true);

    const orbit = new OrbitControls(camera, canvas);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.1;

    let tc = null;
    let isDragging = false;

    if (!readOnly) {
      tc = new TransformControls(camera, canvas);
      tc.attach(pivot);
      tc.setMode(tcMode);
      scene.add(tc);
      tcRef.current = tc;

      tc.addEventListener('dragging-changed', e => {
        orbit.enabled = !e.value;
        isDragging = e.value;
        // After drag ends, re-sync lastMat so the loop doesn't re-apply
        if (!e.value) lastMat = matRef.current; // eslint-disable-line no-use-before-define
      });

      tc.addEventListener('change', () => {
        const m = pivotToPlm(pivot);
        matRef.current = m;    // update parent ref synchronously
        cbRef.current?.(m);    // notify parent → setMat + setInputs + emit
      });
    }

    // Animate: read matRef.current each frame — zero-latency sync from TRS inputs.
    // Skip during drag (TransformControls owns the pivot).
    let lastMat = matRef.current;
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging && matRef.current !== lastMat) {
        lastMat = matRef.current;
        plmToM4(lastMat).decompose(pivot.position, pivot.quaternion, pivot.scale);
        pivot.updateMatrixWorld(true);
      }
      orbit.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      orbit.dispose();
      tc?.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      tcRef.current = null;
    };
  }, []); // eslint-disable-line

  return (
    <canvas ref={canvasRef} width={256} height={200}
      style={{ borderRadius: 4, display: 'block', width: 256, height: 200 }} />
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export function PositionMatrixEditor({ value, onChange, readOnly }) {
  const matRef      = useRef(parseMat16(value) ?? [...IDENTITY]);
  const cbRef       = useRef(onChange);
  const suppressRef = useRef(false);

  const initMat = parseMat16(value) ?? [...IDENTITY];
  const [mat,     setMat]     = useState(initMat);
  const [inputs,  setInputs]  = useState(() => toStrMap(decomposeMat(initMat)));
  const [showRaw, setShowRaw] = useState(false);
  const [show3D,  setShow3D]  = useState(false);
  const [tcMode,  setTcMode]  = useState('translate');

  useEffect(() => { cbRef.current = onChange; });

  // Sync external value changes (not our own emissions)
  useEffect(() => {
    const m = parseMat16(value);
    if (!m) return;
    if (suppressRef.current) { suppressRef.current = false; return; }
    matRef.current = m;
    setMat(m);
    setInputs(toStrMap(decomposeMat(m)));
  }, [value]); // eslint-disable-line

  function emit(m) {
    suppressRef.current = true;
    cbRef.current?.(m.join(','));
  }

  function handleTRS(field, str) {
    if (readOnly) return;
    setInputs(prev => ({ ...prev, [field]: str }));
    const n = parseFloat(str);
    if (isNaN(n)) return;
    const newMat = composeTRS({ ...decomposeMat(matRef.current), [field]: n });
    matRef.current = newMat;   // synchronous — animate loop sees it next rAF
    setMat(newMat);
    emit(newMat);
  }

  function handleCell(i, str) {
    if (readOnly) return;
    const n = parseFloat(str);
    if (isNaN(n)) return;
    const m = [...matRef.current];
    m[i] = n;
    matRef.current = m;
    setMat(m);
    setInputs(toStrMap(decomposeMat(m)));
    emit(m);
  }

  function handleMatFromThree(m) {
    matRef.current = m;
    setMat(m);
    setInputs(toStrMap(decomposeMat(m)));
    emit(m);
  }

  const sectionLbl = { fontSize: 10, color: 'var(--muted, #888)', marginBottom: 4 };
  const grid2      = { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 6px', alignItems: 'center' };
  const axisLbl    = { fontSize: 10, color: 'var(--muted, #888)', fontFamily: 'var(--mono, monospace)' };
  const cellInp    = { padding: '2px 4px', fontSize: 11, width: '100%' };
  const btnBase    = { flex: 1, fontSize: 10, padding: '2px 0', border: '1px solid var(--border, #3a3a5a)', borderRadius: 3, cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

        {/* TRS inputs */}
        <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={sectionLbl}>Translation</div>
            <div style={grid2}>
              {[['tx','X'],['ty','Y'],['tz','Z']].map(([f,l]) => (
                <Fragment key={f}>
                  <span style={axisLbl}>{l}</span>
                  <input type="number" step="any" className="field-input" style={cellInp}
                    value={inputs[f]} disabled={readOnly}
                    onChange={e => handleTRS(f, e.target.value)} />
                </Fragment>
              ))}
            </div>
          </div>
          <div>
            <div style={sectionLbl}>Rotation (°)</div>
            <div style={grid2}>
              {[['rx','X'],['ry','Y'],['rz','Z']].map(([f,l]) => (
                <Fragment key={f}>
                  <span style={axisLbl}>{l}</span>
                  <input type="number" step="any" className="field-input" style={cellInp}
                    value={inputs[f]} disabled={readOnly}
                    onChange={e => handleTRS(f, e.target.value)} />
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* 3D preview (lazy — only mounts on click to avoid WebGL context exhaustion) */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {show3D ? (
            <>
              <ThreePreview matRef={matRef} readOnly={readOnly} onMatChange={handleMatFromThree} tcMode={tcMode} />
              {!readOnly && (
                <div style={{ display: 'flex', gap: 4 }}>
                  {['translate','rotate'].map(m => (
                    <button key={m} style={{
                      ...btnBase,
                      background: tcMode === m ? 'var(--accent, #3399ff)' : 'var(--surface2, #1e1e2e)',
                      color: tcMode === m ? '#fff' : 'var(--fg, #ccc)',
                    }} onClick={() => setTcMode(m)}>
                      {m === 'translate' ? 'Translate' : 'Rotate'}
                    </button>
                  ))}
                  <button style={{ ...btnBase, flex: '0 0 auto', padding: '2px 6px', background: 'var(--surface2, #1e1e2e)', color: 'var(--muted, #888)' }}
                    onClick={() => setShow3D(false)}>✕</button>
                </div>
              )}
            </>
          ) : (
            <button style={{ ...btnBase, flex: 'none', padding: '4px 10px', fontSize: 11, background: 'var(--surface2, #1e1e2e)', color: 'var(--fg, #ccc)' }}
              onClick={() => setShow3D(true)}>
              ▷ 3D
            </button>
          )}
        </div>
      </div>

      {/* Raw 4×4 toggle */}
      <div>
        <button style={{ fontSize: 10, color: 'var(--muted, #888)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
          onClick={() => setShowRaw(v => !v)}>
          {showRaw ? '▼' : '▶'} Raw 4×4 matrix
        </button>
        {showRaw && (
          <div style={{ marginTop: 4, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, fontFamily: 'var(--mono, monospace)' }}>
            {mat.map((v, i) => (
              <input key={i} type="number" step="any" className="field-input"
                style={{ padding: '2px 4px', fontSize: 10, textAlign: 'right', width: '100%' }}
                value={parseFloat(v.toFixed(8))}
                disabled={readOnly}
                onChange={e => handleCell(i, e.target.value)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
