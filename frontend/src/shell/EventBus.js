const _listeners = {};

export const eventBus = {
  emit(event, payload) {
    (_listeners[event] || []).slice().forEach(fn => fn(payload));
  },
  on(event, handler) {
    (_listeners[event] ??= []).push(handler);
    return () => this.off(event, handler);
  },
  off(event, handler) {
    _listeners[event] = (_listeners[event] || []).filter(fn => fn !== handler);
  },
};
