/** 浏览器错误只在展示层归一，不隐藏服务端错误详情。 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { uiErrorText } from './ui-error.ts';

describe('uiErrorText', () => {
  test('网络错误 → 越南语连接说明', () => {
    for (const message of [
      'Failed to fetch',
      'fetch failed',
      'NetworkError when attempting to fetch resource.',
      'Load failed',
    ]) {
      assert.equal(
        uiErrorText(new TypeError(message)),
        'Không kết nối được với dịch vụ. Hãy kiểm tra kết nối rồi thử lại.',
      );
    }
  });

  test('取消与超时 → 各自对应的越南语说明', () => {
    assert.equal(uiErrorText(new DOMException('This operation was aborted', 'AbortError')), 'Đã hủy yêu cầu.');
    assert.equal(
      uiErrorText(new DOMException('The operation timed out', 'TimeoutError')),
      'Yêu cầu đã hết thời gian chờ. Hãy thử lại.',
    );
  });

  test('浏览器权限与设备异常 → 越南语说明，不改变错误对象', () => {
    const denied = new DOMException('Permission denied', 'NotAllowedError');
    assert.equal(uiErrorText(denied), 'Chưa được cấp quyền truy cập. Hãy kiểm tra quyền của trình duyệt rồi thử lại.');
    assert.equal(denied.message, 'Permission denied');
    assert.equal(
      uiErrorText(new DOMException('Requested device not found', 'NotFoundError')),
      'Không tìm thấy thiết bị hoặc nguồn chia sẻ phù hợp.',
    );
    assert.equal(
      uiErrorText(new DOMException('Could not start source', 'NotReadableError')),
      'Không đọc được thiết bị hoặc nguồn chia sẻ. Có thể ứng dụng khác đang sử dụng.',
    );
    assert.equal(
      uiErrorText(new DOMException('Blocked', 'SecurityError')),
      'Trình duyệt đã chặn thao tác này vì yêu cầu bảo mật.',
    );
  });

  test('JSON 解析失败 → 越南语无效响应说明', () => {
    assert.equal(
      uiErrorText(new SyntaxError('Unexpected end of JSON input')),
      'Phản hồi từ dịch vụ không hợp lệ. Hãy thử lại.',
    );
  });

  test('业务错误与任意文本 → 原样保留，不误翻用户内容', () => {
    assert.equal(uiErrorText(new Error('Không tìm thấy pet: main')), 'Không tìm thấy pet: main');
    assert.equal(uiErrorText('HTTP 503: provider unavailable'), 'HTTP 503: provider unavailable');
    assert.equal(
      uiErrorText('Failed to fetch a picture was the story title'),
      'Failed to fetch a picture was the story title',
    );
    assert.equal(uiErrorText(null), 'null');
    const unusual = new Error('Giữ nguyên chi tiết lỗi');
    unusual.name = 'toString';
    assert.equal(uiErrorText(unusual), 'Giữ nguyên chi tiết lỗi');
  });
});
