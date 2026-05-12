import GenericDetailEditor from '../components/GenericDetailEditor';

/**
 * Catch-all plugin used when no source-specific plugin matches a descriptor.
 * NavItem generic fallback handles display (labelField from itemShape).
 * Editor delegates to GenericDetailEditor via descriptor's get action.
 */
export const defaultPlugin = {
  match: { serviceCode: '*' },
  name: 'default',
  Editor: GenericDetailEditor,
  hasItemChildren: () => false,
};
