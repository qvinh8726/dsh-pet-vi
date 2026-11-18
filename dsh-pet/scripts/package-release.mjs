#!/usr/bin/env node
/** Tạo ZIP độc lập và mã SHA-256 từ bản Windows đã build; không ghi đè gói cũ. */
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const output = join(root, 'dist-app');
const directory = join(output, 'win-unpacked');
const base = `DSH-Pet-Viet-${version}-Windows-x64`;
const installer = join(output, `${base}-Setup.exe`);
const archive = join(output, `${base}.zip`);

if (process.platform !== 'win32') throw new Error('Lệnh đóng gói ZIP này cần chạy trên Windows.');
if (!existsSync(installer) || !existsSync(join(directory, 'dsh-pet-vi.exe'))) {
  throw new Error('Chưa có bản Windows đầy đủ. Hãy chạy npm run build và npm run dist trước.');
}
if (existsSync(archive)) throw new Error(`Gói đã tồn tại, không tự ghi đè: ${archive}`);

const code = await new Promise((done, reject) => {
  const child = spawn(
    join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'),
    [
      '-NoProfile',
      '-Command',
      'Compress-Archive -LiteralPath $env:DSH_PET_ZIP_SOURCE -DestinationPath $env:DSH_PET_ZIP_OUTPUT -CompressionLevel Optimal',
    ],
    {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, DSH_PET_ZIP_SOURCE: directory, DSH_PET_ZIP_OUTPUT: archive },
    },
  );
  child.on('error', reject);
  child.on('exit', done);
});
if (code !== 0) throw new Error(`Không tạo được ZIP (mã thoát ${code}).`);

const sums = [];
for (const name of [`${base}-Setup.exe`, `${base}.zip`]) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(join(output, name))) hash.update(chunk);
  sums.push(`${hash.digest('hex')}  ${name}`);
}
writeFileSync(join(output, 'SHA256SUMS.txt'), sums.join('\n') + '\n', 'utf8');
console.log('[release] Đã tạo ZIP và SHA256SUMS.txt.');
console.log(sums.join('\n'));
