const STORAGE_KEY = 'plm-theme';

const THEMES = ['dark', 'light', 'system'];

function resolveTheme(pref) {
  if (pref === 'dark' || pref === 'light') return pref;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyToDOM(resolved) {
  document.documentElement.setAttribute('data-theme', resolved);
}

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) || 'dark';
}

export function setTheme(pref) {
  localStorage.setItem(STORAGE_KEY, pref);
  applyToDOM(resolveTheme(pref));
}

export function initTheme() {
  const pref = getTheme();
  applyToDOM(resolveTheme(pref));

  // Listen for OS preference changes when "system" is selected
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    const current = getTheme();
    if (current === 'system') applyToDOM(resolveTheme('system'));
  });
}

export { THEMES };
