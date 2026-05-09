import React from 'react';
import StepViewer from './StepViewer';

export default function StepPreviewPanel({ data, tab, ctx }) {
  const { nodes = [], loading = false } = data || {};
  return (
    <StepViewer
      nodes={nodes}
      loading={loading}
      onNavigateToNode={ctx?.onNavigate
        ? (nid) => ctx.onNavigate(nid, undefined, { serviceCode: 'psm', itemCode: 'node' })
        : undefined}
    />
  );
}
