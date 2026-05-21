const _registry = new Map(); // "svc:type" | "svc:" → Component
let _default = null;

export function registerSearchItemPlugin(serviceCode, itemCode, Component) {
  _registry.set(itemCode ? `${serviceCode}:${itemCode}` : `${serviceCode}:`, Component);
}

export function registerDefaultSearchItemPlugin(Component) {
  _default = Component;
}

// Exact match → service-level wildcard → global default
export function lookupSearchItemPlugin(serviceCode, itemCode) {
  return _registry.get(`${serviceCode}:${itemCode}`)
    ?? _registry.get(`${serviceCode}:`)
    ?? _default;
}
