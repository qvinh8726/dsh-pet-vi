/**
 * 模型字段的可手填下拉：输入框持有值，右侧箭头拉取候选并弹出菜单。
 *
 * 拉到的列表只留在内存，地址或协议一改就作废，避免拿 A 家的模型去配 B 家。
 * @module dsh-pet/src/standalone/settings-page/script/model-picker
 */

/** 生成模型选择片段。 */
export function modelPickerScript(): string {
  return `
const AI_MODELS_URL = '/standalone-ai/models';

/** 上一次拉到的候选；null 表示还没拉过，需要先请求。 */
let modelOptions = null;

function modelLabel(model) {
  return model.name && model.name !== model.id ? model.name + '（' + model.id + '）' : model.id;
}

function openModelMenu(trigger) {
  if (!modelOptions) return;
  openSelectMenu(
    trigger,
    modelOptions,
    byId('model').value.trim(),
    (picked) => {
      byId('model').value = picked;
      markDirty(true);
      setStatus(byId('model-result'), 'Đã điền tên mô hình, nhớ bấm Lưu nhé.', 'ok');
    },
    byId('model-combo'),
    // 上百个模型时手翻不现实：顶部给一个过滤框，输入即筛。
    'Tìm ID hoặc tên mô hình',
  );
}

function forgetModelOptions() {
  modelOptions = null;
  setStatus(byId('model-result'), '');
}

async function fetchModelOptions(trigger) {
  const result = byId('model-result');
  trigger.disabled = true;
  setStatus(result, 'Đang lấy danh sách mô hình từ endpoint…');
  try {
    const response = await fetch(AI_MODELS_URL, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'X-DSH-Pet-Token': TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: protocolSelect ? protocolSelect.getValue() : 'openai-compatible',
        baseUrl: byId('baseUrl').value.trim(),
        apiKey: byId('apiKey').value,
      }),
    });
    if (response.status === 403) throw new Error('Phiên mở trang đã hết hạn. Hãy mở lại cài đặt từ menu của pet.');
    const data = await response.json().catch(() => null);
    if (!data) throw new Error('API trên máy không trả về kết quả, vui lòng thử lại.');
    if (!data.ok) throw new Error(data.message || 'Lấy danh sách thất bại');
    const models = data.models || [];
    if (!models.length) {
      setStatus(result, 'Endpoint không trả về mô hình nào, hãy nhập tay.', 'error');
      return;
    }
    modelOptions = models.map((model) => ({ value: model.id, label: modelLabel(model) }));
    setStatus(result, 'Đã lấy ' + models.length + ' mô hình, chọn một cái để điền vào.', 'ok');
    openModelMenu(trigger);
  } catch (error) {
    setStatus(result, error && error.message ? error.message : String(error), 'error');
  } finally {
    trigger.disabled = false;
  }
}

function wireModelPicker() {
  const toggle = byId('model-toggle');
  if (!toggle) return;
  toggle.append(chevron());
  toggle.addEventListener('click', () => {
    if (modelOptions) openModelMenu(toggle);
    else void fetchModelOptions(toggle);
  });
  byId('baseUrl').addEventListener('input', forgetModelOptions);
}
`;
}
