import React, { useEffect, useState } from 'react';
import StepViewer from './StepViewer';
import { eventBus } from '../shell/EventBus';

function applyMatrixOverrides(nodes, overrides) {
  if (!overrides || Object.keys(overrides).length === 0) return nodes;
  return nodes.map(node => ({
    ...node,
    parts: node.parts.map(part => {
      const iKey = part.instanceKey || part.uuid;
      const hashIdx = iKey.indexOf('#');
      if (hashIdx === -1) return part; // root file, no link in path
      const linkPath = iKey.slice(hashIdx + 1);
      // Only override depth-1 children (linkPath has no slashes) — world matrix = local matrix
      if (!overrides[linkPath]) return part;
      return { ...part, matrix: overrides[linkPath] };
    }),
  }));
}

function extractLinkId(instanceKey) {
  if (!instanceKey) return null;
  const hashIdx = instanceKey.indexOf('#');
  if (hashIdx === -1) return null;
  return instanceKey.slice(hashIdx + 1).split('/')[0] || null;
}

export default function StepPreviewPanel({ data, tab, ctx }) {
  const { nodes = [], loading = false } = data || {};
  const [matrixOverrides, setMatrixOverrides] = useState({});
  const [highlightedLinkId, setHighlightedLinkId] = useState(null);

  // Clear overrides when the editor switches to a different node or tab
  const primaryNodeId = nodes[0]?.nodeId;
  const tabId = tab?.id;
  useEffect(() => {
    setMatrixOverrides({});
    setHighlightedLinkId(null);
  }, [tabId, primaryNodeId]);

  // Subscribe to editor events
  useEffect(() => {
    const unsubPos = eventBus.on('psm:link:positionChange', ({ linkId, matrix }) => {
      setMatrixOverrides(prev => {
        if (matrix === null) {
          const next = { ...prev };
          delete next[linkId];
          return next;
        }
        return { ...prev, [linkId]: matrix };
      });
    });
    const unsubSel = eventBus.on('psm:link:selected', ({ linkId }) => {
      setHighlightedLinkId(linkId ?? null);
    });
    return () => { unsubPos(); unsubSel(); };
  }, []);

  const effectiveNodes = applyMatrixOverrides(nodes, matrixOverrides);

  const highlightedInstanceKeys = highlightedLinkId
    ? effectiveNodes.flatMap(n =>
        n.parts
          .filter(p => extractLinkId(p.instanceKey || p.uuid) === highlightedLinkId)
          .map(p => p.instanceKey || p.uuid)
      )
    : [];

  function handlePartSelected(instanceKey, _nodeId) {
    const linkId = extractLinkId(instanceKey);
    setHighlightedLinkId(linkId);
    eventBus.emit({ type: 'psm:part:selected', linkId });
  }

  return (
    <StepViewer
      nodes={effectiveNodes}
      loading={loading}
      highlightedInstanceKeys={highlightedInstanceKeys}
      onNavigateToNode={ctx?.onNavigate
        ? (nid) => ctx.onNavigate(nid, undefined, { serviceCode: 'psm' })
        : undefined}
      onPartSelected={handlePartSelected}
    />
  );
}
