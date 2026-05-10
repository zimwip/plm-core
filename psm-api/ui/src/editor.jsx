/**
 * PSM editor plugin — microfrontend entry point.
 *
 * Exported as an ES module; react + react-dom are external (provided by the
 * shell via importmap). No imports from shell-internal files.
 *
 * Plugin contract:
 *   { id, zone, init(shellAPI), matches(descriptor), Component }
 *
 * Component props (injected by the shell's editor zone renderer):
 *   { shellAPI, tab, ctx }
 *
 * Phase 3 note: the full NodeEditor lives in the shell bundle and is rendered
 * by the shell's EditorArea when this plugin is selected. This entry point
 * satisfies the plugin registry contract and exposes the matches() predicate
 * so the shell knows which tabs this plugin owns. The Component below delegates
 * rendering to the shell via shellAPI.emit('psm:renderEditor', { tab, ctx }),
 * keeping a clean boundary until the editor is fully migrated to this subproject.
 */
import React, { useEffect, useRef } from 'react';

let _shellAPI = null;

/**
 * Editor component — rendered by the shell inside the editor zone.
 *
 * For Phase 3 we use a portal-style delegation: the shell's EditorArea still
 * owns the NodeEditor render tree; this component acts as a mount point that
 * signals the shell to inject its NodeEditor here.
 *
 * When the shell's EditorArea is updated in Phase 4+ to call
 * plugin.Component directly, this can be replaced with the full editor.
 */
function PsmEditorComponent({ shellAPI, tab, ctx }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!shellAPI || !containerRef.current) return;

    // Signal the shell to render its NodeEditor into this container.
    // The shell's EditorArea listens for this event and uses ReactDOM.createPortal
    // or a direct render into the provided element.
    shellAPI.emit('psm:mount-editor', {
      tab,
      ctx,
      container: containerRef.current,
    });

    return () => {
      shellAPI.emit('psm:unmount-editor', { tab });
    };
  }, [tab?.id]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    />
  );
}

export default {
  id: 'psm-editor',
  zone: 'editor',

  init(shellAPI) {
    _shellAPI = shellAPI;
  },

  matches(descriptor) {
    return descriptor?.serviceCode === 'psm' && descriptor?.itemCode === 'node';
  },

  Component: PsmEditorComponent,
};
