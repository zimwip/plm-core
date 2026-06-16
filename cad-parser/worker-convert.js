// OCCT → GLB conversion worker.
//
// Loads its own occt-import-js (WASM) instance, then on each message converts
// STEP bytes to a binary glTF (GLB). occt-import-js is single-threaded WASM and
// ReadStepFile is synchronous — running it here keeps the main event loop free
// and lets the ConvertPool convert independent parts in parallel.

import { parentPort } from 'worker_threads';
import { join } from 'path';
import initOcct from 'occt-import-js';

// wasm ships next to this file (bundled deploy) — no node_modules path.
// __dirname is injected by the esbuild banner (this file only runs bundled).
const occtReady = initOcct({
  locateFile: (path) => join(__dirname, path),
});

const LINEAR_DEFLECTION  = parseFloat(process.env.OCCT_LINEAR_DEFLECTION  ?? '0.05');
const ANGULAR_DEFLECTION = parseFloat(process.env.OCCT_ANGULAR_DEFLECTION ?? '0.3');
const DEFLECTION_TYPE    = process.env.OCCT_DEFLECTION_TYPE ?? 'BRepRelative';

parentPort.on('message', async ({ step }) => {
  try {
    const occt = await occtReady;
    const result = occt.ReadStepFile(new Uint8Array(step), {
      linearDeflection:     LINEAR_DEFLECTION,
      angularDeflection:    ANGULAR_DEFLECTION,
      linearDeflectionType: DEFLECTION_TYPE,
    });
    if (!result?.success || !result.meshes?.length) {
      parentPort.postMessage({ error: 'No geometry found' });
      return;
    }
    const meshes = result.meshes.map(m => ({
      positions: new Float32Array(m.attributes.position.array),
      normals:   m.attributes?.normal ? new Float32Array(m.attributes.normal.array) : null,
      indices:   m.index             ? new Uint32Array(m.index.array)               : null,
      color:     m.color ?? null,
    }));
    const glb = buildGlb(meshes);
    const ab = glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength);
    parentPort.postMessage({ glb: ab, meshCount: meshes.length }, [ab]);
  } catch (err) {
    parentPort.postMessage({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GLB serialiser — minimal binary glTF writer.
// ---------------------------------------------------------------------------
function buildGlb(meshes) {
  function align4(n) { return (n + 3) & ~3; }

  const bufParts   = [];
  const bufferViews = [];
  const accessors  = [];
  const gltfMeshes = [];
  const materials  = [];
  let byteOffset   = 0;

  function pushBytes(typedArray) {
    const bytes = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    bufParts.push(bytes);
    byteOffset += bytes.byteLength;
  }

  function padTo4() {
    const r = byteOffset % 4;
    if (r === 0) return;
    const pad = new Uint8Array(4 - r);
    bufParts.push(pad);
    byteOffset += pad.byteLength;
  }

  for (let mi = 0; mi < meshes.length; mi++) {
    const { positions, normals, indices, color } = meshes[mi];
    const vertCount = positions.length / 3;
    const primAttrs = {};

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < positions.length; i += 3) {
      if (positions[i]   < minX) minX = positions[i];   if (positions[i]   > maxX) maxX = positions[i];
      if (positions[i+1] < minY) minY = positions[i+1]; if (positions[i+1] > maxY) maxY = positions[i+1];
      if (positions[i+2] < minZ) minZ = positions[i+2]; if (positions[i+2] > maxZ) maxZ = positions[i+2];
    }
    const posView = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: positions.byteLength, target: 34962 });
    pushBytes(positions);
    primAttrs.POSITION = accessors.length;
    accessors.push({ bufferView: posView, byteOffset: 0, componentType: 5126, count: vertCount, type: 'VEC3',
                     min: [minX, minY, minZ], max: [maxX, maxY, maxZ] });

    if (normals) {
      const normView = bufferViews.length;
      bufferViews.push({ buffer: 0, byteOffset, byteLength: normals.byteLength, target: 34962 });
      pushBytes(normals);
      primAttrs.NORMAL = accessors.length;
      accessors.push({ bufferView: normView, byteOffset: 0, componentType: 5126, count: vertCount, type: 'VEC3' });
    }

    const primitive = { attributes: primAttrs, mode: 4 };
    if (indices) {
      padTo4();
      const idxView = bufferViews.length;
      bufferViews.push({ buffer: 0, byteOffset, byteLength: indices.byteLength, target: 34963 });
      pushBytes(indices);
      primitive.indices = accessors.length;
      accessors.push({ bufferView: idxView, byteOffset: 0, componentType: 5125, count: indices.length, type: 'SCALAR' });
    }

    const r = color ? color[0] : 0.357, g = color ? color[1] : 0.608, b = color ? color[2] : 0.965;
    primitive.material = materials.length;
    materials.push({ pbrMetallicRoughness: { baseColorFactor: [r, g, b, 1.0], metallicFactor: 0.1, roughnessFactor: 0.8 }, doubleSided: true });
    gltfMeshes.push({ primitives: [primitive] });
  }

  const totalBin = align4(byteOffset);
  const binBuf   = Buffer.alloc(totalBin, 0);
  let off = 0;
  for (const part of bufParts) { binBuf.set(part, off); off += part.byteLength; }

  const gltf = {
    asset: { version: '2.0', generator: 'cad-parser/occt-import-js' },
    scene: 0,
    scenes: [{ nodes: gltfMeshes.map((_, i) => i) }],
    nodes:  gltfMeshes.map((_, i) => ({ mesh: i })),
    meshes: gltfMeshes, materials, accessors, bufferViews,
    buffers: [{ byteLength: totalBin }],
  };
  const jsonBuf = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPad = Buffer.alloc(align4(jsonBuf.length), 0x20);
  jsonBuf.copy(jsonPad);

  const totalLen = 12 + 8 + jsonPad.length + 8 + binBuf.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // "glTF"
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const jsonChunkHdr = Buffer.alloc(8);
  jsonChunkHdr.writeUInt32LE(jsonPad.length, 0);
  jsonChunkHdr.writeUInt32LE(0x4E4F534A, 4); // "JSON"

  const binChunkHdr = Buffer.alloc(8);
  binChunkHdr.writeUInt32LE(binBuf.length, 0);
  binChunkHdr.writeUInt32LE(0x004E4942, 4); // "BIN\0"

  return Buffer.concat([header, jsonChunkHdr, jsonPad, binChunkHdr, binBuf]);
}
