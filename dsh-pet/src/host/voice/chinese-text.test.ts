/** 中文旁路集成：可见越南语不变，provider 只能收到独立中文，失败不回读原文。 */
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, type TestContext } from 'node:test';
import { configuredChineseTranslator, createChineseSpeechPolicy } from './chinese-text.ts';
import { createVoiceService, MAX_QUEUE, type SpeechTextPolicy } from './speak.ts';
import { registerVoiceProvider, resetVoiceProviders } from './registry.ts';

/** 注册隔离 provider；只记录真正交给 TTS 的正文，不连接收费服务。 */
async function service(t: TestContext, policy?: SpeechTextPolicy) {
  const root = await mkdtemp(join(tmpdir(), 'pet-zh-speech-'));
  const spoken: string[] = [];
  resetVoiceProviders();
  registerVoiceProvider({
    id: 'edge',
    name: 'Giọng Trung',
    voices: [{ id: 'zh-CN-XiaoyiNeural', name: 'Hiểu Y' }],
    synthesize: async ({ text }) => {
      spoken.push(text);
      return new Uint8Array([1, 2, 3]);
    },
  });
  t.after(async () => {
    resetVoiceProviders();
    await rm(root, { recursive: true, force: true });
  });
  const make = (speechText?: SpeechTextPolicy, totalTimeoutMs?: number) =>
    createVoiceService({
      userRoot: root,
      configuredVoice: () => 'edge/zh-CN-XiaoyiNeural',
      ...(speechText ? { speechText } : {}),
      ...(totalTimeoutMs ? { totalTimeoutMs } : {}),
    });
  return { spoken, voice: make(policy), make };
}

const DISPLAY = 'Chủ nhân ơi, hôm nay mình cùng đọc sách nhé!';
const SPOKEN = '主人，今天我们一起看书吧！';

test('dynamic Vietnamese stays untouched while TTS receives Chinese and replays from audio cache', async (t) => {
  let translated = 0;
  const policy = createChineseSpeechPolicy(async (text) => {
    assert.equal(text, DISPLAY);
    translated++;
    return SPOKEN;
  });
  const { voice, spoken } = await service(t, policy);
  const input = Object.freeze({ text: DISPLAY });
  assert.equal((await voice.speak(input)).ok, true);
  assert.equal((await voice.speak(input)).ok, true);
  assert.equal(input.text, DISPLAY);
  assert.deepEqual(spoken, [SPOKEN]);
  assert.equal(translated, 1);
});

test('old Vietnamese audio cache cannot be reused by the Chinese policy', async (t) => {
  const { make, spoken } = await service(t);
  assert.equal((await make().speak({ text: DISPLAY })).ok, true);
  const localized = make(createChineseSpeechPolicy(async () => SPOKEN));
  assert.equal((await localized.speak({ text: DISPLAY })).ok, true);
  assert.deepEqual(spoken, [DISPLAY, SPOKEN]);
});

test('fixed upstream phrase uses exact Chinese without invoking a model', async (t) => {
  const { voice, spoken } = await service(
    t,
    createChineseSpeechPolicy(async () => {
      throw new Error('must not translate fixed phrase');
    }),
  );
  const input = Object.freeze({ text: 'Ngủ no rồi nè, chủ nhân ơi!' });
  assert.equal((await voice.speak(input)).ok, true);
  assert.equal(input.text, 'Ngủ no rồi nè, chủ nhân ơi!');
  assert.deepEqual(spoken, ['睡饱啦，主人！']);
});

test('Vietnamese user title is translated only in the speech copy of an original reminder template', async (t) => {
  const displayed = 'Còn 25 phút nữa là đến giờ "Uống nước" rồi nè';
  const { voice, spoken } = await service(
    t,
    createChineseSpeechPolicy(async (text) => {
      assert.equal(text, 'Uống nước');
      return '喝水';
    }),
  );
  const input = Object.freeze({ text: displayed });
  assert.equal((await voice.speak(input)).ok, true);
  assert.equal(input.text, displayed);
  assert.deepEqual(spoken, ['「喝水」还有25分钟就到点啦']);
});

test('ASCII Vietnamese titles translate separately while the upstream Chinese shell remains exact', async () => {
  const policy = createChineseSpeechPolicy(async (text) => {
    assert.equal(text, 'Di hop');
    return '开会';
  });
  assert.equal(
    await policy.prepare('Còn 25 phút nữa là đến giờ "Di hop" rồi nè', new AbortController().signal),
    '「开会」还有25分钟就到点啦',
  );
});

test('unknown mixed Chinese and unaccented Vietnamese cannot bypass translation', async () => {
  const policy = createChineseSpeechPolicy(async (text) => {
    assert.equal(text, '主人，Di hop nhe');
    return '主人，去开会吧';
  });
  assert.equal(await policy.prepare('主人，Di hop nhe', new AbortController().signal), '主人，去开会吧');
  await assert.rejects(
    createChineseSpeechPolicy(async () => '主人，Di hop nhe').prepare(DISPLAY, new AbortController().signal),
    /không nhận|Không nhận/,
  );
});

test('original Chinese and numeric speech require no translation provider', async () => {
  const policy = createChineseSpeechPolicy(async () => {
    throw new Error('must not call');
  });
  const signal = new AbortController().signal;
  assert.equal(await policy.prepare('主人，早上好！', signal), '主人，早上好！');
  assert.equal(await policy.prepare('123，456。', signal), '123，456。');
});

for (const response of ['', 'Vẫn là tiếng Việt', '你好, chủ nhân!', '中'.repeat(501)]) {
  test(`invalid translated speech is rejected: ${response.slice(0, 20)}`, async (t) => {
    const { voice, spoken } = await service(
      t,
      createChineseSpeechPolicy(async () => response),
    );
    const result = await voice.speak({ text: DISPLAY });
    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.reason, 'generate-error');
    assert.deepEqual(spoken, []);
  });
}

test('translation failure releases queue, never synthesizes Vietnamese and can recover', async (t) => {
  let attempts = 0;
  const { voice, spoken } = await service(
    t,
    createChineseSpeechPolicy(async () => {
      if (++attempts === 1) throw new Error('offline');
      return SPOKEN;
    }),
  );
  assert.equal((await voice.speak({ text: DISPLAY })).ok, false);
  assert.equal((await voice.speak({ text: DISPLAY })).ok, true);
  assert.deepEqual(spoken, [SPOKEN]);
});

test('translation occupies the same bounded synthesis queue', async (t) => {
  let release!: (text: string) => void;
  let began!: () => void;
  const started = new Promise<void>((resolve) => {
    began = resolve;
  });
  const waiting = new Promise<string>((resolve) => {
    release = resolve;
  });
  const { voice } = await service(
    t,
    createChineseSpeechPolicy(async () => {
      began();
      return waiting;
    }),
  );
  const requests = Array.from({ length: MAX_QUEUE }, (_, index) => voice.speak({ text: DISPLAY + index }));
  await started;
  const full = await voice.speak({ text: DISPLAY + 'full' });
  assert.equal(full.ok, false);
  assert.equal(!full.ok && full.reason, 'voice-busy');
  release(SPOKEN);
  assert.ok((await Promise.all(requests)).every((result) => result.ok));
});

test('translation timeout fails gracefully before synthesizing and does not poison the queue', async (t) => {
  const keepAlive = setTimeout(() => {}, 1000);
  t.after(() => clearTimeout(keepAlive));
  const policy = createChineseSpeechPolicy(async () => new Promise<string>(() => {}));
  const { voice, spoken } = await service(t, { ...policy, timeoutMs: 10 });
  const result = await voice.speak({ text: DISPLAY });
  assert.equal(result.ok, false);
  assert.deepEqual(spoken, []);
  assert.equal((await voice.speak({ text: '主人，早上好！' })).ok, true);
  assert.deepEqual(spoken, ['主人，早上好！']);
});

test('caller cancellation aborts translation, does not synthesize and frees the queue', async (t) => {
  const controller = new AbortController();
  let started!: () => void;
  let translationSignal: AbortSignal | undefined;
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  const { voice, spoken } = await service(
    t,
    createChineseSpeechPolicy(async (_, signal) => {
      translationSignal = signal;
      started();
      return new Promise<string>(() => {});
    }),
  );
  const request = voice.speak({ text: DISPLAY }, controller.signal);
  await began;
  controller.abort();
  assert.equal((await request).ok, false);
  assert.equal(translationSignal?.aborted, true);
  assert.deepEqual(spoken, []);
  assert.equal((await voice.speak({ text: '主人，早上好！' })).ok, true);
});

test('a cancelled queued request never invokes its translator or TTS', async (t) => {
  let release!: (value: string) => void;
  let started!: () => void;
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  const waiting = new Promise<string>((resolve) => {
    release = resolve;
  });
  let calls = 0;
  const { voice, spoken } = await service(
    t,
    createChineseSpeechPolicy(async () => {
      calls++;
      started();
      return waiting;
    }),
  );
  const first = voice.speak({ text: DISPLAY });
  await began;
  const cancel = new AbortController();
  const second = voice.speak({ text: DISPLAY + '2' }, cancel.signal);
  cancel.abort();
  assert.equal((await second).ok, false);
  release(SPOKEN);
  assert.equal((await first).ok, true);
  assert.equal(calls, 1);
  assert.deepEqual(spoken, [SPOKEN]);
});

test('whole-request deadline includes translation, rejects late completion and does not cache it', async (t) => {
  const keepAlive = setTimeout(() => {}, 1000);
  t.after(() => clearTimeout(keepAlive));
  let release!: (value: string) => void;
  let receivedSignal: AbortSignal | undefined;
  const policy = createChineseSpeechPolicy(async (_, signal) => {
    receivedSignal = signal;
    return new Promise<string>((resolve) => {
      release = resolve;
    });
  });
  const { make, spoken } = await service(t);
  const voice = make(policy, 250);
  assert.equal((await voice.speak({ text: DISPLAY })).ok, false);
  assert.equal(receivedSignal?.aborted, true);
  release(SPOKEN);
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(spoken, []);
  assert.equal((await voice.speak({ text: '主人，早上好！' })).ok, true);
});

test('invalid requests never spend a translation call', async (t) => {
  let calls = 0;
  const { voice } = await service(
    t,
    createChineseSpeechPolicy(async () => {
      calls++;
      return SPOKEN;
    }),
  );
  for (const input of [
    { text: '' },
    { text: DISPLAY, rate: 'fast' },
    { text: 'x'.repeat(501) },
    { text: DISPLAY, voice: 'missing/voice' },
  ]) {
    assert.equal((await voice.speak(input)).ok, false);
  }
  assert.equal(calls, 0);
});

test('configured translator uses existing model, no history, separate system and propagates cancellation', async () => {
  const controller = new AbortController();
  let options: Record<string, unknown> | undefined;
  const translate = configuredChineseTranslator({
    agentDefaultModel: { currentSelection: () => ({ provider: 'fake', model: 'test' }) },
    llm: {
      async *stream(value: Record<string, unknown>) {
        options = value;

        yield { type: 'text-delta', index: 0, text: SPOKEN };
      },
    },
  });
  assert.equal(await translate(DISPLAY, controller.signal), SPOKEN);
  assert.equal(options?.provider, 'fake');
  assert.equal(options?.model, 'test');
  assert.equal(options?.signal, controller.signal);
  assert.equal((options?.messages as unknown[]).length, 1);
  assert.match(String(options?.system), /简体中文/);
  assert.match(JSON.stringify(options?.messages), /Chủ nhân/);
  controller.abort();
  await assert.rejects(translate(DISPLAY, controller.signal), { name: 'AbortError' });
});

test('missing configured model is an explicit failure, not Vietnamese speech fallback', async () => {
  const translate = configuredChineseTranslator({
    agentDefaultModel: { currentSelection: () => ({ provider: '', model: '' }) },
  });
  await assert.rejects(translate(DISPLAY, new AbortController().signal), /Cần cấu hình mô hình/);
});
