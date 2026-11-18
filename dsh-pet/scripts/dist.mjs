#!/usr/bin/env node
/**
 * Đóng gói ứng dụng Windows độc lập từ bản Electron đã có hoặc tải chính thức khi được cho phép.
 * Không tự phát hành lên GitHub; chỉ tạo bộ cài hoặc thư mục chạy trực tiếp.
 * @module dsh-pet/scripts/dist
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const ELECTRON_REL =
  process.platform === 'win32'
    ? 'electron.exe'
    : process.platform === 'darwin'
      ? join('Electron.app', 'Contents', 'MacOS', 'Electron')
      : 'electron';

/** Chỉ tải Electron khi DSH_PET_ALLOW_ELECTRON_DOWNLOAD=1. */
function resolveElectronDist() {
  const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh');
  const candidates = [
    process.env.DSH_PET_ELECTRON_DIST,
    process.env.DSH_PET_ELECTRON_PATH ? dirname(process.env.DSH_PET_ELECTRON_PATH) : undefined,
    join(dshHome, 'electron'),
  ].filter((value) => Boolean(value));
  for (const dir of candidates) {
    if (existsSync(join(dir, ELECTRON_REL))) return dir;
  }
  if (process.env.DSH_PET_ALLOW_ELECTRON_DOWNLOAD === '1') {
    console.warn('[dist] Chưa có Electron cục bộ; electron-builder sẽ tải bản chính thức.');
    return undefined;
  }
  console.error(
    '[dist] Không tìm thấy Electron. Chạy `npm run ensure:electron` trước, ' +
      'hoặc đặt DSH_PET_ELECTRON_DIST trỏ đến thư mục Electron đã giải nén.',
  );
  process.exit(1);
}

const target = process.argv[2] ?? 'nsis';
if (!['dir', 'nsis'].includes(target)) {
  console.error(`[dist] Đích không hợp lệ: ${target}. Chỉ hỗ trợ nsis (bộ cài) hoặc dir (thư mục chạy trực tiếp).`);
  process.exit(2);
}

const electronDist = resolveElectronDist();
const env = { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: 'false' };
if (electronDist) {
  env.DSH_PET_ELECTRON_DIST = electronDist;
  env.ELECTRON_SKIP_BINARY_DOWNLOAD = '1';
} else {
  delete env.DSH_PET_ELECTRON_DIST;
  delete env.ELECTRON_SKIP_BINARY_DOWNLOAD;
}

console.log(`[dist] Electron: ${electronDist ?? '(tải từ nguồn chính thức)'}`);
console.log(`[dist] Đích: Windows x64 / ${target}`);
const cli = join(root, 'node_modules', 'electron-builder', 'out', 'cli', 'cli.js');
const args = [cli, '--win', target, '--x64', '--publish', 'never'];
if (electronDist) args.push(`--config.electronDist=${electronDist}`);
const child = spawn(process.execPath, args, { cwd: root, env, stdio: 'inherit' });
child.on('error', (error) => {
  console.error(`[dist] Không khởi động được công cụ đóng gói: ${error.message}`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 1));
