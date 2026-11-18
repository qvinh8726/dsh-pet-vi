/**
 * 设置页「测试连接」：用一次最小请求验证地址、模型与密钥，把常见失败翻成可操作的说明。
 *
 * 不复用正式通道：不污染限流窗口、忙状态与暂停标记，超时也是独立的 15 秒。
 * 不判断服务是否已释放（归 ./create），也不校验设置是否已保存（用户可能正在填表单）。
 * @module dsh-pet/src/standalone/ai-provider/test-connection
 */
import { DEFAULT_AI_SETTINGS, type StandaloneAiSettings } from '../ai-config.ts';
import { isAuthenticationFailure, isRateLimitFailure, sdkTextStream, type AiFetch } from '../ai-transport.ts';
import type { TestConnectionInput, TestConnectionResult } from './types.ts';

/** 探测请求的封顶时长：与正式通道的设置超时无关，固定 15 秒。 */
const PROBE_TIMEOUT_MS = 15_000;
/** 收到这么多字符就认为连通，不再等模型把话说完。 */
const PROBE_MAX_CHARS = 40;

/** 三项必填的提示文案；都填了返回 null。 */
function missingField(baseUrl: string, model: string, apiKey: string): string | null {
  if (!baseUrl) return 'Hãy nhập địa chỉ API (Base URL) trước';
  if (!model) return 'Hãy nhập tên mô hình trước';
  if (!apiKey) return 'Hãy nhập khóa API trước';
  return null;
}

/** 把探测失败翻成可操作的一句话；原始 message 只在兜底分支透出。 */
function describeFailure(error: unknown, controller: AbortController): string {
  if (controller.signal.aborted)
    return 'Hết thời gian kết nối (15 giây không phản hồi): hãy kiểm tra mạng hoặc trạng thái máy chủ';
  if (isAuthenticationFailure(error)) return 'Xác thực thất bại (HTTP 401/403): hãy kiểm tra khóa API có đúng không';
  if (isRateLimitFailure(error))
    return 'Bị giới hạn yêu cầu hoặc vượt hạn mức (HTTP 429): hãy kiểm tra số dư tài khoản API hoặc tần suất gọi';
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes('404'))
    return 'Đường dẫn API hoặc mô hình không tồn tại (HTTP 404): hãy kiểm tra địa chỉ API (thường kết thúc bằng /v1) và tên mô hình';
  if (raw.includes('ECONNREFUSED') || raw.includes('fetch failed')) {
    return 'Không kết nối được tới máy chủ: hãy kiểm tra địa chỉ và cổng có đúng không, máy chủ có đang chạy không';
  }
  return `Kết nối thất bại: ${raw}`;
}

/**
 * 跑一次探测请求。
 * @param fetcher - 传输实现（生产是官方 SDK 的 fetch）。
 * @param current - 当前已保存的设置：输入里缺省的字段从这里取。
 * @param input - 用户在表单里填的值。
 * @returns 成功时带一句模型回复；失败时 message 说明该改哪里。
 */
export async function testAiConnection(
  fetcher: AiFetch,
  current: StandaloneAiSettings,
  input: TestConnectionInput,
): Promise<TestConnectionResult> {
  const protocol = input.protocol === 'anthropic' ? 'anthropic' : (input.protocol ?? current.protocol);
  const baseUrl = (input.baseUrl !== undefined ? input.baseUrl : current.baseUrl).trim();
  const model = (input.model !== undefined ? input.model : current.model).trim();
  const apiKey = (input.apiKey !== undefined && input.apiKey !== '' ? input.apiKey : current.apiKey).trim();
  const missing = missingField(baseUrl, model, apiKey);
  if (missing !== null) return { ok: false, message: missing };

  const settings: StandaloneAiSettings = {
    ...DEFAULT_AI_SETTINGS,
    protocol: protocol as 'openai-compatible' | 'anthropic',
    baseUrl,
    model,
    apiKey,
    maxTokens: 32,
    timeoutMs: PROBE_TIMEOUT_MS,
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const probe = sdkTextStream(
      settings,
      { system: '', messages: [{ role: 'user', content: 'hi' }] },
      controller.signal,
      fetcher,
    );
    let reply = '';
    for await (const chunk of probe) {
      if (chunk.refusal) return { ok: false, message: 'Mô hình từ chối trả lời yêu cầu kiểm tra này' };
      if (!chunk.text) continue;
      reply += chunk.text;
      if (reply.length >= PROBE_MAX_CHARS) break;
    }
    return reply.trim()
      ? { ok: true, message: 'Kết nối thành công! Mô hình phản hồi bình thường.', reply: reply.trim() }
      : { ok: true, message: 'Kết nối thành công! API đã phản hồi.', reply: '(Mô hình trả về nội dung trống)' };
  } catch (error) {
    return { ok: false, message: describeFailure(error, controller) };
  } finally {
    clearTimeout(timer);
  }
}
