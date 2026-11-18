/**
 * 设置页 HTML 外壳：左侧固定分区导航 + 右侧内容区，配置页把桌宠与 AI 两块合并在一处。
 *
 * 页面只在本机回环上由 ./server 提供；CSP 是 `style-src 'self'`，所以这里不许出现内联样式，
 * 也不许内联脚本。桌宠配置面板的内容依赖 GET /config，初始只有一句占位文案。
 * 图标走设置页自己的公开资源路径（/standalone-ai/icon.png），内容读自包内 assets/logo.png，
 * 不复制第二份图；不能用插件路由 /logo——浏览器取 favicon 不带 Origin 也不带令牌，会被判成文件来源而 403。
 * 导航项以 `data-tab` 声明，脚本按约定找 `panel-<tab>`，新增分区只需照此加一对按钮与面板。
 * @module dsh-pet/src/standalone/settings-page/chrome
 */

/** 设置页 HTML。 */
export const settingsPage = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><base href="/"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cài đặt pet</title><link rel="icon" type="image/png" href="/standalone-ai/icon.png"><link rel="stylesheet" href="/standalone-ai/settings.css">
<script src="/standalone-ai/settings.js" defer></script><script src="/standalone-ai/chat-panel.js" defer></script></head><body>
<main class="shell">
<aside class="side">
<div class="brand"><img class="brandLogo" src="/standalone-ai/icon.png" alt=""><span>Pet</span></div>
<nav class="nav" aria-label="Các mục cài đặt"><div class="navList" role="tablist">
<button type="button" class="navCell" role="tab" id="tab-chat" data-tab="chat" data-title="Trò chuyện" aria-controls="panel-chat" aria-selected="true"><svg class="navGlyph" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3.4h10a1.1 1.1 0 0 1 1.1 1.1v5.6A1.1 1.1 0 0 1 13 11.2H8.2L5 13.6v-2.4H3a1.1 1.1 0 0 1-1.1-1.1V4.5A1.1 1.1 0 0 1 3 3.4Z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg><span class="navLabel">Trò chuyện</span></button>
<button type="button" class="navCell" role="tab" id="tab-config" data-tab="config" data-title="Cấu hình" aria-controls="panel-config" aria-selected="false"><svg class="navGlyph" viewBox="0 0 16 16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M2.6 4.6h10.8M2.6 11.4h10.8"/><circle cx="6.2" cy="4.6" r="1.6" fill="currentColor" stroke="none"/><circle cx="9.8" cy="11.4" r="1.6" fill="currentColor" stroke="none"/></g></svg><span class="navLabel">Cấu hình</span></button>
</div></nav>
<div class="sideFoot">Chế độ độc lập</div>
</aside>
<div class="main">
<div class="topbar"><h1 class="pageTitle" id="page-title">Trò chuyện</h1><span class="dirty" id="dirty" hidden>Có thay đổi chưa lưu</span></div>
<div class="options">
<section class="panel" id="panel-config" role="tabpanel" aria-labelledby="tab-config" hidden>
<div class="scroll">
<div id="pet-cards"><p class="empty">Đang đọc cấu hình trên máy…</p></div>
<div class="footer"><p class="status" id="pet-status" role="status" aria-live="polite"></p><button class="btn primary" id="pet-save" type="button" disabled>Lưu</button></div>
<form id="settings" aria-describedby="privacy">
<div class="card"><div class="cardHead"><h2 class="cardTitle">Kết nối mô hình</h2></div>
<p class="cardHint">Chế độ độc lập tự kết nối tới nhà cung cấp, không đi qua DSH; mọi cấu hình chỉ lưu trên máy này.</p>
<div class="field"><span class="fieldLabel" id="service-label">Nhà cung cấp</span><div id="service-host"></div><p class="fieldHint" id="service-note">Chọn xong sẽ tự điền giao thức và địa chỉ; khóa API và mô hình được lưu riêng cho từng nhà cung cấp, đổi qua lại không ghi đè lên nhau. Nhà cung cấp tùy chỉnh không có API tra số dư.</p></div>
<div class="field"><span class="fieldLabel" id="protocol-label">Giao thức API</span><div id="protocol-host"></div></div>
<div class="field"><label for="baseUrl">Địa chỉ API (Base URL)</label><input id="baseUrl" name="baseUrl" type="url" placeholder="https://example.com/v1" maxlength="2048" spellcheck="false" aria-describedby="endpoint-note"><p class="fieldHint" id="endpoint-note">Địa chỉ API gốc do nhà cung cấp đưa, hỗ trợ HTTP và HTTPS, thường kết thúc bằng /v1. Đừng đặt khóa API vào địa chỉ.</p></div>
<div class="field"><label for="model">Tên mô hình</label><div class="combo" id="model-combo"><input id="model" name="model" type="text" maxlength="200" placeholder="Nhập hoặc lấy ID mô hình từ nhà cung cấp, vd deepseek-chat" spellcheck="false" aria-describedby="model-note"><button id="model-toggle" class="comboToggle" type="button" aria-label="Lấy danh sách và chọn mô hình" aria-haspopup="listbox" aria-expanded="false"></button></div><p class="fieldHint" id="model-note">Có thể nhập tay; bấm mũi tên bên phải để lấy danh sách mô hình từ endpoint rồi chọn. Việc lấy danh sách chỉ dùng địa chỉ và khóa API đang nhập, không lưu lại.</p><p class="status" id="model-result" role="status" aria-live="polite"></p></div>
<div class="field"><label for="apiKey"><span id="key-label">Khóa API</span> <span class="hintInline" id="key-state">Chưa đọc</span></label><input id="apiKey" name="apiKey" type="password" autocomplete="new-password" maxlength="8192" placeholder="Để trống để giữ khóa đã lưu" aria-describedby="key-note"><div class="keyActions" id="key-actions" hidden><button id="key-delete" class="btn ghost" type="button">Xóa khóa đã lưu</button></div><p id="key-note" class="fieldHint">Khóa API chỉ ghi vào cấu hình trên máy, không hiển thị lại. Để trống sẽ giữ khóa đã lưu của nhà cung cấp này; muốn xóa hẳn thì bấm nút phía trên.</p></div>
<div class="field"><label for="deepseekApiKey">Khóa giọng nói DeepSeek <span class="hintInline" id="deepseek-key-state">Chưa đọc</span></label><input id="deepseekApiKey" name="deepseekApiKey" type="password" autocomplete="new-password" maxlength="4096" placeholder="Để trống để giữ khóa đã lưu" aria-describedby="deepseek-key-note"><div class="keyActions" id="deepseek-key-actions" hidden><button id="deepseek-key-delete" class="btn ghost" type="button">Xóa khóa giọng nói đã lưu</button></div><p id="deepseek-key-note" class="fieldHint">Chỉ dùng cho tổng hợp và nhận dạng giọng nói DeepSeek, lưu riêng với khóa trò chuyện ở trên, nên dù trò chuyện qua nhà cung cấp khác vẫn dùng được giọng nói DeepSeek. Để trống thì lần lượt dùng "khóa đã lưu khi chọn nhà cung cấp DeepSeek chính thức", cuối cùng mới dùng thông tin xác thực của DSH.</p></div>
<div class="field"><p class="fieldHint" id="balance-note">Tra số dư theo nhà cung cấp ở trên, dùng khóa đã lưu của nhà cung cấp đó; nhà cung cấp tùy chỉnh không có API tra số dư.</p><div class="testRow"><button id="balance-btn" class="btn ghost" type="button" disabled>Kiểm tra số dư</button><span id="balance-result" class="status" role="status" aria-live="polite"></span></div></div>
<div class="testRow"><button id="test-btn" class="btn" type="button">Kiểm tra kết nối</button><span id="test-result" class="status" role="status" aria-live="polite"></span></div>
</div>
<p id="privacy" class="fineprint">Mọi cấu hình và khóa API chỉ lưu trên máy này.</p>
<div class="footer"><p class="status" id="status" role="status" aria-live="polite">Đang đọc cài đặt trên máy…</p><button id="save" class="btn primary" type="submit" disabled>Lưu</button></div>
</form>
</div>
</section>
<section class="panel" id="panel-chat" role="tabpanel" aria-labelledby="tab-chat">
<div class="pet-chat-host" id="pet-chat-root"></div>
</section>
</div>
</div>
</main>
<noscript>Cần bật JavaScript để lưu cài đặt. Hãy mở trang này từ menu chuột phải của pet.</noscript>
</body></html>`;
