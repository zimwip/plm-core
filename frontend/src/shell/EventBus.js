// PlmEvent shape: { type: 'svc:item:verb', serviceCode, itemCode, id, payload }

const _exact = {};    // type → handler[]
const _patterns = []; // { glob: string[], handler }

function matchGlob(typeSegs, globSegs) {
  if (typeSegs.length !== globSegs.length) return false;
  return globSegs.every((g, i) => g === '*' || g === typeSegs[i]);
}

export const eventBus = {
  emit(event) {
    if (import.meta.env?.DEV && !event?.type) {
      console.warn('[EventBus] emit() called without type:', event);
    }
    const type = event?.type;
    if (!type) return;
    (_exact[type] || []).slice().forEach(fn => fn(event));
    const typeSegs = type.split(':');
    _patterns.forEach(({ glob, handler }) => {
      if (matchGlob(typeSegs, glob)) handler(event);
    });
  },

  on(type, handler) {
    (_exact[type] ??= []).push(handler);
    return () => this.off(type, handler);
  },

  onPattern(glob, handler) {
    const entry = { glob: glob.split(':'), handler };
    _patterns.push(entry);
    return () => {
      const idx = _patterns.indexOf(entry);
      if (idx !== -1) _patterns.splice(idx, 1);
    };
  },

  off(type, handler) {
    _exact[type] = (_exact[type] || []).filter(fn => fn !== handler);
  },
};
