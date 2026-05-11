export const psmNodeDescriptor = Object.freeze({
  serviceCode: 'psm',
  itemCode:    'node',
  itemKey:     null,
  get:         Object.freeze({ httpMethod: 'GET', path: '/nodes/{id}/description' }),
});
