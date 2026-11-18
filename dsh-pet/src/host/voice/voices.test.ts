/**
 * 内置音色清单的行为测试（src/host/voice/voices.ts）。
 * 只钉住「默认音色必须真的在清单里且唯一标记」这条契约。
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_VOICE, VOICES } from './voices.ts';

test('DEFAULT_VOICE：必须在清单里，且恰好一个 default', () => {
  assert.equal(
    VOICES.some((voice) => voice.id === DEFAULT_VOICE),
    true,
    '默认音色不能落在清单外',
  );
  const defaults = VOICES.filter((voice) => voice.default);
  assert.equal(defaults.length, 1, 'default 标记必须唯一');
  assert.equal(defaults[0]?.id, DEFAULT_VOICE);
  assert.equal(DEFAULT_VOICE, 'vi-VN-HoaiMyNeural');
  assert.ok(VOICES.some((voice) => voice.id === 'vi-VN-NamMinhNeural'));
  for (const id of ['zh-CN-XiaoxiaoNeural', 'zh-CN-XiaoyiNeural', 'zh-CN-YunxiNeural', 'zh-CN-YunjianNeural']) {
    assert.ok(
      VOICES.some((voice) => voice.id === id),
      `既有配置中的音色不能丢失: ${id}`,
    );
  }
});

test('清单里的音色 id 不含 provider 前缀：前缀由注册表统一加', () => {
  for (const voice of VOICES) {
    assert.equal(voice.id.includes('/'), false, `音色 id 不能自带前缀: ${voice.id}`);
  }
});
