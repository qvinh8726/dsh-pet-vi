/** 常见浏览器异常的越南语展示；服务端业务错误与用户内容保持原文。 */

/** 只翻译已知的浏览器错误，不改变错误分类或请求行为。 */
export function uiErrorText(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/^(Failed to fetch|fetch failed|NetworkError when attempting to fetch resource\.?|Load failed)$/i.test(message)) {
    return 'Không kết nối được với dịch vụ. Hãy kiểm tra kết nối rồi thử lại.';
  }
  if (error instanceof Error && error.name === 'AbortError') return 'Đã hủy yêu cầu.';
  if (error instanceof Error && error.name === 'TimeoutError') return 'Yêu cầu đã hết thời gian chờ. Hãy thử lại.';
  if (error instanceof Error) {
    const browserMessages: Readonly<Record<string, string>> = {
      NotAllowedError: 'Chưa được cấp quyền truy cập. Hãy kiểm tra quyền của trình duyệt rồi thử lại.',
      PermissionDeniedError: 'Chưa được cấp quyền truy cập. Hãy kiểm tra quyền của trình duyệt rồi thử lại.',
      NotFoundError: 'Không tìm thấy thiết bị hoặc nguồn chia sẻ phù hợp.',
      NotReadableError: 'Không đọc được thiết bị hoặc nguồn chia sẻ. Có thể ứng dụng khác đang sử dụng.',
      SecurityError: 'Trình duyệt đã chặn thao tác này vì yêu cầu bảo mật.',
    };
    const translated = browserMessages[error.name];
    if (typeof translated === 'string') return translated;
  }
  if (error instanceof SyntaxError && /JSON|Unexpected (?:token|end)/i.test(message)) {
    return 'Phản hồi từ dịch vụ không hợp lệ. Hãy thử lại.';
  }
  return message;
}
