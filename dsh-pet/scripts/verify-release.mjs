#!/usr/bin/env node
/** Kiểm tra bản Windows đã đóng gói bằng hồ sơ tạm, không đọc cấu hình thật của người dùng. */
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { _electron as electron, chromium } from 'playwright';

const sourceExecutable = resolve(process.argv[2] || 'dist-app/win-unpacked/dsh-pet-vi.exe');
const artifacts = resolve(process.env.DSH_PET_RELEASE_ARTIFACTS || 'temp/release-verification');
await mkdir(artifacts, { recursive: true });
const temporary = await mkdtemp(join(tmpdir(), 'dsh-pet-vi-release-'));
const inPlace = process.env.DSH_PET_VERIFY_IN_PLACE === '1';
const independentDirectory = inPlace ? resolve(sourceExecutable, '..') : join(temporary, 'application');
if (!inPlace) await cp(resolve(sourceExecutable, '..'), independentDirectory, { recursive: true });
const executablePath = join(independentDirectory, 'dsh-pet-vi.exe');
const home = join(temporary, 'dsh-home');
await mkdir(join(home, 'dsh-pet'), { recursive: true });
const preload = join(temporary, 'isolate.cjs');
await writeFile(
  preload,
  `const {app}=require('electron'); app.setPath('appData',${JSON.stringify(temporary)}); globalThis.__playwright_run=()=>{};`,
);
const env = {
  ...process.env,
  DSH_HOME: home,
  DSH_PET_USER_DATA_DIR: join(temporary, 'electron-profile'),
  DSH_PET_FORCE_DSF: '1',
  DSH_PET_LOG_DEBUG: '1',
};
for (const key of ['ELECTRON_RUN_AS_NODE', 'NODE_OPTIONS', 'DSH_PET_BRIDGE', 'DSH_PET_HOST_PID', 'DSH_PET_SMOKE']) {
  delete env[key];
}
let application;
let browser;
const summary = { executablePath, temporary, checks: [] };
try {
  application = await electron.launch({ executablePath, args: ['-r', preload], env, timeout: 45_000 });
  let page = await application.firstWindow({ timeout: 30_000 });
  page.setDefaultTimeout(15_000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.locator('.pet-sprite').waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll('video')].some((v) => v.readyState >= 2));
  assert.equal(await page.locator('#pet-error.visible').count(), 0);
  summary.checks.push('Khởi động EXE không cần node_modules, nạp pet và video thành công');
  const state = await application.evaluate(({ app, Menu }) => ({
    version: app.getVersion(),
    appData: app.getPath('appData'),
    userData: app.getPath('userData'),
    applicationMenu: Menu.getApplicationMenu()?.items.map((item) => item.label) ?? [],
  }));
  assert.equal(state.version, '1.0.0-vi');
  assert.deepEqual(state.applicationMenu, ['Tệp', 'Chỉnh sửa', 'Hiển thị', 'Cửa sổ']);
  assert.ok(state.userData.startsWith(temporary), `Hồ sơ không được cách ly: ${state.userData}`);
  const debug = await page.evaluate(() => ({
    configUrl: window.__dshPetDebug?.configUrl,
    href: location.href,
    videos: [...document.querySelectorAll('video')].map((v) => v.currentSrc || v.src),
  }));
  const configUrl = await application.evaluate(() => process.env.DSH_PET_CONFIG_URL);
  const origin = new URL(configUrl).origin;
  const token = await application.evaluate(() => new URL(process.env.DSH_PET_SITE_URL).hash.slice('#token='.length));
  const headers = { 'X-DSH-Pet-Token': token };
  const health = await fetch(`${origin}/health`, { headers }).then((r) => r.json());
  assert.equal(health.version, '1.0.0-vi');
  assert.equal((await fetch(`${origin}/standalone-ai/settings`)).status, 403);
  summary.checks.push('Máy chủ cục bộ hoạt động, trang AI không cho đọc cấu hình khi thiếu token');
  const api = async (path, options = {}) => {
    const response = await fetch(`${origin}/dsh-pet-7340${path}`, {
      ...options,
      headers: { ...headers, 'content-type': 'application/json', ...options.headers },
    });
    assert.ok(response.ok, `${path}: HTTP ${response.status}`);
    return response.json();
  };
  const config = await api('/config');
  await page.locator('.pet-hit').first().dispatchEvent('contextmenu', { button: 2, clientX: 240, clientY: 220 });
  await page.locator('.dsh-pet-menu-column').first().waitFor();
  const menuText = await page.locator('.dsh-pet-menu').innerText();
  assert.match(menuText, /Trò chuyện|Đối thoại|Cài đặt|cài đặt/);
  assert.doesNotMatch(menuText, /[\p{Script=Han}]/u);
  await page.screenshot({ path: join(artifacts, 'desktop-menu-vi.png') });
  await page.keyboard.press('Escape');
  summary.checks.push('Menu chuột phải hiển thị tiếng Việt, không lộ nhãn Trung');
  const petId = encodeURIComponent(config.main.pets[0].id);
  assert.equal((await api('/sleep?pet=' + petId, { method: 'POST' })).sleeping, true);
  assert.equal((await api('/wake?pet=' + petId, { method: 'POST' })).sleeping, false);
  summary.checks.push('Luồng đi ngủ và thức dậy giữ đúng trạng thái');
  const originalName = config.main.pets[0].name;
  config.main.pets[0].name = 'Cá voi nhỏ — tiếng Việt có dấu';
  await api('/config', { method: 'PUT', body: JSON.stringify(config.main) });
  assert.equal((await api('/config')).main.pets[0].name, 'Cá voi nhỏ — tiếng Việt có dấu');
  config.main.pets[0].name = originalName;
  await api('/config', { method: 'PUT', body: JSON.stringify(config.main) });
  summary.checks.push('Đọc/ghi cấu hình Unicode và giữ nguyên mô hình cấu hình');
  browser = await chromium.launch();
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 900, height: 800 } });
  const settings = await context.newPage();
  await settings.goto(`${origin}/standalone-ai/#token=${token}`);
  await settings.getByRole('tab', { name: 'Cấu hình', exact: true }).click();
  await settings.getByText('Kết nối mô hình', { exact: true }).waitFor();
  const body = await settings.locator('body').innerText();
  assert.doesNotMatch(body, /[\p{Script=Han}]/u);
  assert.equal(await settings.evaluate(() => document.documentElement.lang), 'vi');
  assert.equal(await settings.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await settings.screenshot({ path: join(artifacts, 'standalone-settings-vi.png'), fullPage: true });
  summary.checks.push('Trang cài đặt độc lập dùng tiếng Việt trên trình duyệt en-US và không tràn ngang');
  assert.deepEqual(errors, []);
  summary.state = state;
  summary.debug = debug;
  summary.result = 'PASS';
} catch (error) {
  summary.result = 'FAIL';
  summary.error = String(error.stack || error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await application?.close();
  const log = await readFile(join(home, 'dsh-pet', 'logs.txt'), 'utf8').catch(() => '');
  await writeFile(join(artifacts, 'application.log'), log);
  await writeFile(join(artifacts, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}
