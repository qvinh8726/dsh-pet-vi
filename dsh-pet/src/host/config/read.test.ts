import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, type TestContext } from 'node:test';
import { fileURLToPath } from 'node:url';
import type { ConfigPaths } from './constants.ts';
import { readAllConfig } from './read.ts';

function fixture(context: TestContext): ConfigPaths {
  const root = mkdtempSync(join(tmpdir(), 'dsh-pet-voice-migration-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const petDir = join(root, 'pet');
  mkdirSync(petDir);
  return {
    defaultFile: fileURLToPath(new URL('../../../assets/config.jsonc', import.meta.url)),
    userFile: join(root, 'main-config.jsonc'),
    petDir,
  };
}

const ORIGINAL_DEFAULT = 'edge/zh-CN-XiaoyiNeural';

for (const retired of ['edge/vi-VN-HoaiMyNeural', 'edge/vi-VN-NamMinhNeural']) {
  test(`读取迁移 ${retired}：主配置与继承条目使用原音色，磁盘不变且可重复读取`, (context) => {
    const paths = fixture(context);
    const saved = JSON.stringify({ voiceName: retired });
    writeFileSync(paths.userFile, saved);
    const packPath = join(paths.petDir, 'friend-config.jsonc');
    const pack = JSON.stringify({ pets: [{ id: 'friend', name: 'Bạn' }] });
    writeFileSync(packPath, pack);
    for (let index = 0; index < 2; index++) {
      const merged = readAllConfig(paths);
      assert.equal(merged.main.voiceName, ORIGINAL_DEFAULT);
      assert.equal(merged.friend.voiceName, ORIGINAL_DEFAULT);
    }
    assert.equal(readFileSync(paths.userFile, 'utf8'), saved);
    assert.equal(readFileSync(packPath, 'utf8'), pack);
  });

  test(`种类覆盖 ${retired}：只迁移种类音色，保留自定义主配置`, (context) => {
    const paths = fixture(context);
    writeFileSync(paths.userFile, JSON.stringify({ voiceName: 'custom/my-voice' }));
    writeFileSync(
      join(paths.petDir, 'friend-config.jsonc'),
      JSON.stringify({ voiceName: retired, pets: [{ id: 'friend', name: 'Bạn' }] }),
    );
    const merged = readAllConfig(paths);
    assert.equal(merged.main.voiceName, 'custom/my-voice');
    assert.equal(merged.friend.voiceName, ORIGINAL_DEFAULT);
  });
}

for (const retained of [
  'edge/zh-CN-XiaoxiaoNeural',
  'edge/zh-CN-XiaoyiNeural',
  'edge/zh-CN-YunxiNeural',
  'edge/zh-CN-YunjianNeural',
  'custom/my-voice',
  'custom/vi-VN-HoaiMyNeural',
  'custom/vi-VN-NamMinhNeural',
  'edge/en-US-AriaNeural',
]) {
  test(`合法自定义音色 ${retained}：读取时保留`, (context) => {
    const paths = fixture(context);
    writeFileSync(paths.userFile, JSON.stringify({ voiceName: retained }));
    assert.equal(readAllConfig(paths).main.voiceName, retained);
  });
}

test('无用户配置：默认使用原 Edge 晓伊音色', (context) => {
  const paths = fixture(context);
  assert.equal(readAllConfig(paths).main.voiceName, ORIGINAL_DEFAULT);
});
