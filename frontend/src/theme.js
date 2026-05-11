import { kvApi } from './services/api.js';

const STORAGE_KEY = 'plm-theme';
const UI_PREF_GROUP = 'UI_PREF';

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

/** Called after login to sync theme from backend. localStorage is the first-paint fallback. */
export async function loadThemeFromBackend(userId) {
  try {
    const res = await kvApi.getSingle(userId, UI_PREF_GROUP, 'theme');
    if (res?.value) {
      setTheme(res.value);
    }
  } catch {
    // backend unavailable — keep localStorage value
  }
}

/** Called when the user changes theme selection. Persists to backend and localStorage. */
export async function saveThemeToBackend(userId, pref) {
  try {
    await kvApi.setSingle(userId, UI_PREF_GROUP, 'theme', pref);
  } catch {
    // best-effort — localStorage already updated by setTheme
  }
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
