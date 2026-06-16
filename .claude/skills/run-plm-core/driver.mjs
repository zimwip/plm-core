#!/usr/bin/env node
// PLM Core run-driver. Drives the running compose stack through the spe-api
// gateway (curl-equivalent API smoke) and the React frontend (headless chromium
// screenshot). The stack must already be up — see SKILL.md "Build / Run".
//
// Usage:
//   node driver.mjs api            # gateway + data-plane smoke (login -> me -> data)
//   node driver.mjs shot [out.png] # screenshot the auto-logged-in SPA
//   node driver.mjs all            # both (default)
//
// Env:
//   BASE_URL   default http://localhost:3000  (nginx -> spe-api gateway)
//   X_USER     default user-admin             (SSO-style login, no password)
//   CHROMIUM   default /usr/lib64/chromium-browser/headless_shell
//
// Exit non-zero on the first failed check.

import { writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const USER = process.env.X_USER || 'user-admin';
const CHROMIUM = process.env.CHROMIUM || '/usr/lib64/chromium-browser/headless_shell';

const ok = (m) => console.log(`  \x1b[32mOK\x1b[0m  ${m}`);
const bad = (m) => { console.error(`  \x1b[31mFAIL\x1b[0m ${m}`); process.exitCode = 1; };

async function login() {
  const r = await fetch(`${BASE}/api/spe/auth/login`, { method: 'POST', headers: { 'X-User': USER } });
  if (!r.ok) throw new Error(`login HTTP ${r.status}`);
  const b = await r.json();
  if (!b.token) throw new Error('login returned no token');
  return b;
}

async function apiSmoke() {
  console.log(`API smoke against ${BASE} as ${USER}`);
  let token;
  try {
    const b = await login();
    token = b.token;
    ok(`login -> ${b.username} (admin=${b.isAdmin})`);
  } catch (e) { bad(String(e.message)); return; }

  const auth = { Authorization: `Bearer ${token}`, 'X-PLM-ProjectSpace': 'ps-default' };
  const checks = [
    ['GET /api/spe/auth/me',   `${BASE}/api/spe/auth/me`],
    ['GET /api/pno/users',     `${BASE}/api/pno/users`],
    ['GET /api/psm/nodes',     `${BASE}/api/psm/nodes`],
  ];
  for (const [label, url] of checks) {
    try {
      const r = await fetch(url, { headers: auth });
      r.ok ? ok(`${label} -> ${r.status}`) : bad(`${label} -> ${r.status}`);
    } catch (e) { bad(`${label} -> ${e.message}`); }
  }
}

async function screenshot(out = 'plm-core.png') {
  console.log(`Screenshot ${BASE} -> ${out}`);
  const puppeteer = (await import('puppeteer-core')).default;
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1600,1000'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });
    // App auto-logs-in (default user-alice) then loads data. Wait for real content.
    await page.waitForFunction(
      () => document.querySelector('#root') && document.querySelector('#root').children.length > 0,
      { timeout: 30000 },
    );
    await new Promise((r) => setTimeout(r, 2500)); // settle async data + render
    const title = await page.title();
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    await page.screenshot({ path: out, fullPage: false });
    writeFileSync(out.replace(/\.png$/, '') + '.txt', await page.evaluate(() => document.body.innerText));
    if (bodyLen < 50) bad(`page near-empty (innerText ${bodyLen} chars) — login/render failed`);
    else ok(`rendered "${title}" (${bodyLen} chars text) -> ${out}`);
    if (errors.length) console.error('  page errors:', errors.slice(0, 3).join(' | '));
  } finally {
    await browser.close();
  }
}

const cmd = process.argv[2] || 'all';
if (cmd === 'api') await apiSmoke();
else if (cmd === 'shot') await screenshot(process.argv[3]);
else if (cmd === 'all') { await apiSmoke(); await screenshot(process.argv[3]); }
else { console.error(`unknown command: ${cmd}`); process.exit(2); }
