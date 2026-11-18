/** 用真实生成通道与受控 fetch 验证单槽位交接，不访问真实模型。 */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { PET_SPEECH_CALL_IDENTITY } from '../../shared/speech-call.ts';
import { createAiConfig } from '../ai-config.ts';
import { createLlmFacade, type StandaloneModelService } from '../llm-facade.ts';
import { createTextStream } from './stream.ts';
import type { AiRuntime } from './types.ts';

const silent = { info() {}, warn() {}, error() {}, debug() {} };
const options = {
  provider: 'standalone',
  model: 'test-model',
  messages: [{ role: 'user', content: 'hello' }],
};
const speechOptions = { ...options, sessionId: PET_SPEECH_CALL_IDENTITY };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function openAiResponse(text: string): Response {
  const chunk = { choices: [{ index: 0, delta: { content: text } }] };
  return new Response(`data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`, {
    headers: { 'content-type': 'text/event-stream' },
  });
}

async function collect(stream: AsyncIterable<unknown>): Promise<string> {
  let result = '';
  for await (const part of stream) {
    assert.ok(typeof part === 'object' && part !== null && 'text' in part && typeof part.text === 'string');
    result += part.text;
  }
  return result;
}

async function fixture(
  fetcher: typeof fetch,
  run: (service: { llm: ReturnType<typeof createLlmFacade>; runtime: AiRuntime }) => Promise<void>,
): Promise<void> {
  const home = mkdtempSync(join(tmpdir(), 'pet-speech-priority-'));
  const store = createAiConfig(home);
  const runtime: AiRuntime = {
    store,
    logger: silent,
    fetcher,
    disposed: false,
    paused: false,
    saving: false,
    active: undefined,
    ready: () => !runtime.disposed && !runtime.paused && !runtime.saving,
  };
  try {
    await store.save({
      service: 'custom',
      keys: { CUSTOM_API_KEY: 'test-secret' },
      profiles: {
        custom: {
          protocol: 'openai-compatible',
          baseUrl: 'https://example.test/v1',
          model: 'test-model',
        },
      },
    });
    const ai: StandaloneModelService = {
      currentSelection: () => ({ provider: 'standalone', model: 'test-model' }),
      listProviders: () => [],
      listModels: async () => [],
      resolveModelInfo: async () => undefined,
      stream: createTextStream(runtime),
      isReady: runtime.ready,
      balanceAuth: () => ({ provider: 'custom', apiKey: 'test-secret' }),
      deepseekKey: () => '',
      dispose: () => runtime.active?.abort(),
    };
    await run({ llm: createLlmFacade(ai), runtime });
  } finally {
    runtime.disposed = true;
    runtime.active?.abort();
    rmSync(home, { recursive: true, force: true });
  }
}

test('前台接管：语音读取挂起 → 先取消语音再成功生成，晚到传输错误不暂停前台', async () => {
  const backgroundStarted = deferred<AbortSignal>();
  const backgroundResponse = deferred<Response>();
  let calls = 0;
  let backgroundSignal: AbortSignal | undefined;
  await fixture(
    async (_url, init) => {
      assert.ok(init?.signal);
      if (++calls === 1) {
        backgroundSignal = init.signal;
        backgroundStarted.resolve(init.signal);
        // 故意不响应取消：生成通道必须自己取消等待，而不是等 fetch 收尾。
        return await backgroundResponse.promise;
      }
      assert.equal(backgroundSignal?.aborted, true, '前台发出传输前，后台必须已经取消');
      return openAiResponse('foreground');
    },
    async ({ llm, runtime }) => {
      const backgroundFailure = assert.rejects(collect(llm.stream(speechOptions)), /bị hủy|quá thời gian/);
      const signal = await backgroundStarted.promise;
      assert.equal(signal.aborted, false);
      assert.equal(await collect(llm.stream(options)), 'foreground', '前台不能收到正在忙碌错误');
      await backgroundFailure;
      assert.equal(signal.aborted, true);
      backgroundResponse.resolve(new Response('test-secret', { status: 401 }));
      assert.equal(await collect(llm.stream(options)), 'foreground', '旧后台迟到的错误不能暂停模型');
      assert.equal(runtime.ready(), true);
      assert.equal(calls, 3);
    },
  );
});

test('延迟清理：语音暂停在 yield → 旧 finally 不能清空新前台槽位', async () => {
  const foregroundStarted = deferred<AbortSignal>();
  const foregroundResponse = deferred<Response>();
  let calls = 0;
  await fixture(
    async (_url, init) => {
      if (++calls === 1) return openAiResponse('speech');
      assert.ok(init?.signal);
      foregroundStarted.resolve(init.signal);
      return await foregroundResponse.promise;
    },
    async ({ llm }) => {
      const background = llm.stream(speechOptions)[Symbol.asyncIterator]();
      assert.deepEqual(await background.next(), { done: false, value: { type: 'text', text: 'speech' } });
      const foreground = collect(llm.stream(options));
      const signal = await foregroundStarted.promise;
      // 后台生成器仍暂停在 yield，这次 next 才会进入被取消请求的 finally。
      await assert.rejects(background.next(), /bị hủy|quá thời gian/);
      await assert.rejects(collect(llm.stream(options)), /đang bận/, '旧 finally 不得释放前台槽位');
      assert.equal(signal.aborted, false, '旧清理不得取消前台控制器');
      assert.equal(calls, 2, '交接不扩大并发上限');
      foregroundResponse.resolve(openAiResponse('foreground'));
      assert.equal(await foreground, 'foreground');
    },
  );
});

test('后台退让：前台请求挂起 → 语音和另一个前台都拒绝，原前台不受影响', async () => {
  const started = deferred<AbortSignal>();
  const response = deferred<Response>();
  let calls = 0;
  await fixture(
    async (_url, init) => {
      calls++;
      assert.ok(init?.signal);
      started.resolve(init.signal);
      return await response.promise;
    },
    async ({ llm }) => {
      const foreground = collect(llm.stream(options));
      const signal = await started.promise;
      await assert.rejects(collect(llm.stream(speechOptions)), /đang bận/);
      await assert.rejects(collect(llm.stream(options)), /đang bận/);
      assert.equal(calls, 1, '被拒请求不能触发网络调用');
      assert.equal(signal.aborted, false, '低优先级调用不能中止前台');
      response.resolve(openAiResponse('foreground'));
      assert.equal(await foreground, 'foreground');
    },
  );
});

test('后台不可抢占后台；仅专用 sessionId 降级，请求 priority 字段不能改变调度', async () => {
  const started = deferred<AbortSignal>();
  const response = deferred<Response>();
  let calls = 0;
  await fixture(
    async (_url, init) => {
      if (++calls === 1) {
        assert.ok(init?.signal);
        started.resolve(init.signal);
        return await response.promise;
      }
      return openAiResponse('foreground');
    },
    async ({ llm }) => {
      const backgroundFailure = assert.rejects(
        collect(llm.stream({ ...speechOptions, priority: 'foreground' })),
        /bị hủy|quá thời gian/,
      );
      const signal = await started.promise;
      await assert.rejects(collect(llm.stream(speechOptions)), /đang bận/);
      assert.equal(signal.aborted, false, '后台不能中止另一个后台');
      assert.equal(await collect(llm.stream({ ...options, priority: 'background' })), 'foreground');
      await backgroundFailure;
      response.resolve(openAiResponse('late speech'));
      assert.equal(calls, 2);
    },
  );
});

test('选择与取消边界：非法模型、服务商或已取消前台均不能中止正在生成的语音', async () => {
  const started = deferred<AbortSignal>();
  const response = deferred<Response>();
  let calls = 0;
  await fixture(
    async (_url, init) => {
      calls++;
      assert.ok(init?.signal);
      started.resolve(init.signal);
      return await response.promise;
    },
    async ({ llm }) => {
      const background = collect(llm.stream(speechOptions));
      const signal = await started.promise;
      await assert.rejects(collect(llm.stream({ ...options, provider: 'other' })), /Mô hình được chọn/);
      await assert.rejects(collect(llm.stream({ ...options, model: 'other' })), /Mô hình được chọn/);
      const cancelled = new AbortController();
      cancelled.abort();
      await assert.rejects(collect(llm.stream({ ...options, signal: cancelled.signal })), /bị hủy/);
      assert.equal(signal.aborted, false);
      assert.equal(calls, 1);
      response.resolve(openAiResponse('speech'));
      assert.equal(await background, 'speech');
    },
  );
});

test('限流不变：前台与语音的 429 都脱敏且不重试，之后前台仍可生成', async () => {
  for (const request of [options, speechOptions]) {
    let calls = 0;
    await fixture(
      async () =>
        ++calls === 1 ? new Response('test-secret https://private.test', { status: 429 }) : openAiResponse('recovered'),
      async ({ llm, runtime }) => {
        await assert.rejects(collect(llm.stream(request)), {
          message: 'Nhà cung cấp AI độc lập đã giới hạn tần suất yêu cầu. Vui lòng đợi một chút.',
        });
        assert.equal(calls, 1, '429 仍然不允许 SDK 重试');
        assert.equal(runtime.ready(), true, '限流不能暂停全局 AI');
        assert.equal(await collect(llm.stream(options)), 'recovered');
        assert.equal(calls, 2);
      },
    );
  }
});
