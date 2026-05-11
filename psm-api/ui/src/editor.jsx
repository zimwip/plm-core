/**
 * PSM editor plugin — microfrontend entry point.
 *
 * Exported as an ES module; react + react-dom are external (provided by the
 * shell via importmap). No imports from shell-internal files.
 *
 * Plugin contract:
 *   { id, zone, init(shellAPI), matches(descriptor), Component }
 *
 * Component props (injected by the shell's EditorArea):
 *   { tab, ctx }
 *
 * All shell services (api, store, hooks, components) are accessed via shellAPI
 * which is passed down to NodeEditor as a prop.
 */
import NodeEditor from './NodeEditor';
import { initPsmApi } from './psmApi';

let _shellAPI = null;

function PsmEditorComponent({ tab, ctx }) {
  return (
    <NodeEditor
      shellAPI={_shellAPI}
      nodeId={tab.nodeId}
      userId={ctx.userId}
      tx={ctx.tx}
      nodeTypes={ctx.nodeTypes}
      stateColorMap={ctx.stateColorMap}
      activeSubTab={tab.activeSubTab || 'attributes'}
      onSubTabChange={key => ctx.onSubTabChange(tab.id, key)}
      toast={ctx.toast}
      onAutoOpenTx={ctx.onAutoOpenTx}
      onDescriptionLoaded={ctx.onDescriptionLoaded}
      onRefreshItemData={ctx.onRefreshItemData}
      itemData={ctx.itemData}
      onOpenCommentsForVersion={ctx.onOpenCommentsForVersion}
      onCommentAttribute={ctx.onCommentAttribute}
      onNavigate={ctx.onNavigate}
      onRegisterPreview={ctx.onRegisterPreview}
    />
  );
}

export default {
  id: 'psm-editor',
  zone: 'editor',

  init(shellAPI) {
    _shellAPI = shellAPI;
    initPsmApi(shellAPI);
  },

  matches(descriptor) {
    return descriptor?.serviceCode === 'psm' && descriptor?.itemCode === 'node';
  },

  Component: PsmEditorComponent,
};
