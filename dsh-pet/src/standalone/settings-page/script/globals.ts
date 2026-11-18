/**
 * 「桌宠配置」面板的全局部分：开关、语音、外观、物理、移动端、对话模型与落盘位置。
 *
 * 全部读写 state.globals（main 条目的全局字段），由 ./pets 的保存一并提交。
 * 卡片按 builder 数组返回，渲染时机由 ./pets 决定——这里不自己找容器。
 * @module dsh-pet/src/standalone/settings-page/script/globals
 */

import { FONT_LABELS } from '../../../shared/fonts.ts';

/** 生成全局卡片片段。 */
export function globalsScript(): string {
  return `
const FONT_LABELS = ${JSON.stringify(FONT_LABELS)};

function globalCards() {
  return [globalFlagsCard, voiceCard, fontCard, physicsCard, motionCard, modelCard, memoryCard, environmentCard, advancedCard];
}

function setGlobal(key, value) {
  state.globals[key] = value;
}

function globalFlagsCard() {
  const g = state.globals;
  return card('Công tắc chung', 'Áp dụng cho mọi pet; lưu xong là ghi ngay vào file.', [
    toggleRow('g-notify', 'Thông báo hệ thống', 'Hiện thông báo hệ thống khi trò chuyện xong, tạo nội dung lỗi, xin cấp quyền...', g.notificationsEnabled, (value) => setGlobal('notificationsEnabled', value)),
    toggleRow('g-notify-focused', 'Nhắc cả khi đang ở cửa sổ này', 'Khi đang mở trang này và cửa sổ ở phía trước vẫn hiện thông báo và đọc trạng thái làm việc. Mặc định tắt.', g.notifyWhenFocused, (value) => setGlobal('notifyWhenFocused', value)),
    toggleRow('g-click', 'Âm thanh khi bấm', 'Phát âm thanh có sẵn khi bấm vào pet.', g.clickSoundEnabled, (value) => setGlobal('clickSoundEnabled', value)),
    toggleRow('g-whisper-image', 'Kèm ảnh khi lẩm bẩm', 'Cho mô hình chọn một meme khi lẩm bẩm.', g.whisperImageEnabled, (value) => setGlobal('whisperImageEnabled', value)),
    toggleRow('g-chat-image', 'Kèm ảnh khi trò chuyện', 'Khi trò chuyện, gửi danh sách meme cho mô hình chọn ảnh hợp ngữ cảnh.', g.chatImageEnabled, (value) => setGlobal('chatImageEnabled', value)),
    toggleRow('g-chat-anim', 'Động tác khi trò chuyện', 'Khi trò chuyện, để mô hình chọn một động tác diễn ngay.', g.chatAnimationEnabled, (value) => setGlobal('chatAnimationEnabled', value)),
    toggleRow('g-confine', 'Giữ trong màn hình hiện tại', 'Ném và tự đi lang thang chỉ diễn ra trong màn hình pet đang đứng.', g.confineToScreen, (value) => setGlobal('confineToScreen', value)),
    toggleRow('g-tray', 'Biểu tượng khay hệ thống', 'Chế độ desktop luôn có biểu tượng ở khay hệ thống; tắt đi thì chỉ tìm lại được từ thanh tác vụ.', g.trayEnabled, (value) => setGlobal('trayEnabled', value)),
  ]);
}

function environmentCard() {
  const g = state.globals;
  const feedback = make('p', { class: 'fieldHint', text: '', hidden: true });
  const show = (text) => {
    feedback.textContent = text;
    feedback.hidden = false;
  };
  const input = make('input', { type: 'text', id: 'g-env-city', value: g.environmentCity || '' });
  input.placeholder = 'Để trống = tự định vị';
  input.addEventListener('input', () => {
    setGlobal('environmentCity', input.value);
    markDirty(true);
    feedback.hidden = true;
  });
  // 检测走宿主已有的环境查询（不带 pet = 纯查询，不点亮气泡），把 IP 定位结果回填。
  // 必带 fresh=1：不带就会读到 10 分钟内的缓存定位，用户点了检测却拿到旧城市。
  // 必带 ip=1：不带就会把配置里已填的城市原样回显，检测按钮等于没作用。
  // 回填后不自动保存——用户可能还要改，统一走页面底部的保存。
  const detect = button('Dò tìm', () => {
    detect.textContent = 'Đang dò…';
    detect.disabled = true;
    callApi('POST', '/environment?fresh=1&ip=1')
      .then((facts) => {
        if (!facts || typeof facts.city !== 'string' || !facts.city) {
          show('Không nhận được thành phố (định vị IP thất bại), hãy nhập tay.');
          return;
        }
        input.value = facts.city;
        setGlobal('environmentCity', facts.city);
        markDirty(true);
        show('Đã điền: ' + facts.city + ' (bấm Lưu để áp dụng)');
      })
      .catch((error) => show('Dò tìm thất bại: ' + (error && error.message ? error.message : String(error))))
      .finally(() => {
        detect.textContent = 'Dò tìm';
        detect.disabled = false;
      });
  });
  return card('Môi trường và định vị', 'Xem thời tiết ở thành phố nào. Để trống = tự định vị theo IP; nhập tên thành phố thì xem theo thành phố đó.', [
    fieldRow('g-env-city', 'Thành phố', make('div', { class: 'row' }, [input, detect]), 'Chỉ cần nhập tên thành phố, vd "Hà Nội" hay "TP Hà Nội" đều được.'),
    feedback,
  ]);
}

function voiceCard() {
  const g = state.globals;
  // 运行时目录优先：宿主注册了 Edge / DeepSeek 就都列出来；拉不到回落构建期的内置清单
  const voices = state.voiceOptions && state.voiceOptions.length > 0
    ? state.voiceOptions
    : VOICES.map((voice) => ({ id: voice.id, name: voice.name, tag: voice.tag, provider: voice.provider }));
  const speechProviders = state.speechProviders || [];
  return card('Giọng nói', 'Bốn loại giọng nói có công tắc riêng, không phụ thuộc nhau; dùng chung giọng đọc, bộ nhận dạng và âm lượng.', [
    toggleRow('g-voice', 'Đọc thủ công', 'Đọc thành tiếng câu lẩm bẩm và câu trả lời trò chuyện khi gọi từ menu chuột phải hoặc lệnh gạch chéo.', g.voiceEnabled, (value) => setGlobal('voiceEnabled', value)),
    selectField('g-voice-name', 'Giọng đọc', g.voiceName, voices.map((voice) => ({ value: voice.id, label: voice.name + (voice.tag ? ' · ' + voice.tag : ''), group: voice.provider })), (value) => setGlobal('voiceName', value)),
    numberField('g-voice-volume', 'Âm lượng (0–1)', g.voiceVolume, (value) => setGlobal('voiceVolume', clampNumber(value, 0, 1, 1)), { min: 0, max: 1, step: 0.05 }),
    toggleRow('g-voice-whisper', 'Đọc cả câu lẩm bẩm định kỳ', 'Đọc thành tiếng câu lẩm bẩm được tạo theo lịch.', g.voiceWhisperEnabled, (value) => setGlobal('voiceWhisperEnabled', value)),
    toggleRow('g-voice-todo', 'Đọc cả nhắc nhở việc cần làm', 'Đọc thành tiếng nhắc nhở việc cần làm khi đến giờ.', g.voiceTodoEnabled, (value) => setGlobal('voiceTodoEnabled', value)),
    toggleRow('g-voice-notify', 'Đọc thông báo', 'Khi tác vụ xong, gặp lỗi hoặc chờ chủ nhân xác nhận thì đọc câu trạng thái làm việc đã cấu hình; trang bị ẩn vẫn đọc.', g.voiceNotifyEnabled, (value) => setGlobal('voiceNotifyEnabled', value)),
    selectField('g-speech-provider', 'Nhận dạng giọng nói', g.speechProvider, speechProviders.map((item) => ({ value: item.id, label: item.name })), (value) => setGlobal('speechProvider', value), 'Giữ để ghi âm, sau đó giao cho bộ nhận dạng nào chuyển thành chữ. Cài plugin tương ứng mới có thêm lựa chọn; bộ đã chọn không dùng được thì báo lỗi rõ ràng, không tự đổi sang bộ khác.'),
  ]);
}

function fontCard() {
  const g = state.globals;
  return card('Giao diện và phông chữ', 'Phông chữ dùng chung cho bong bóng, gợi ý nổi và cửa sổ trò chuyện.', [
    selectField('g-font-family', 'Phông chữ', g.font.family, FONT_IDS.map((id) => ({ value: id, label: FONT_LABELS[id] || id })), (value) => { g.font = Object.assign({}, g.font, { family: value }); }),
    numberField('g-font-size', 'Cỡ chữ (px)', g.font.size, (value) => { g.font = Object.assign({}, g.font, { size: clampNumber(value, 4, 200, 21) }); }, { min: 4, max: 200, step: 1, hint: 'Chỉ áp dụng cho bong bóng và gợi ý nổi, cỡ chữ cửa sổ trò chuyện không đổi.' }),
    toggleRow('g-font-follow', 'Cỡ chữ theo kích thước pet', 'Tắt đi thì luôn dùng cỡ chữ ở trên, không đổi theo kích thước cửa sổ.', g.font.followPet, (value) => { g.font = Object.assign({}, g.font, { followPet: value }); }),
  ]);
}

function physicsCard() {
  const g = state.globals;
  return card('Cảm giác kéo và ném', 'Dùng chung cho mọi pet; thay đổi có hiệu lực sau khi lưu.', [
    make('div', { class: 'grid2' }, [
      numberField('g-gravity', 'Gia tốc trọng trường (px/s²)', g.physics.gravity, (value) => { g.physics = Object.assign({}, g.physics, { gravity: clampNumber(value, 0, 10000, 1400) }); }, { min: 0, max: 10000, step: 10 }),
      numberField('g-restitution', 'Độ nảy khi chạm tường (0–1)', g.physics.restitution, (value) => { g.physics = Object.assign({}, g.physics, { restitution: clampNumber(value, 0, 1, 0.78) }); }, { min: 0, max: 1, step: 0.01 }),
    ]),
    make('div', { class: 'grid2' }, [
      numberField('g-friction', 'Ma sát bề mặt (/s)', g.physics.groundFriction, (value) => { g.physics = Object.assign({}, g.physics, { groundFriction: clampNumber(value, 0, 30, 2.5) }); }, { min: 0, max: 30, step: 0.1 }),
      numberField('g-power', 'Lực ném tổng', g.physics.throwPower, (value) => { g.physics = Object.assign({}, g.physics, { throwPower: clampNumber(value, 0.1, 5, 1) }); }, { min: 0.1, max: 5, step: 0.1 }),
    ]),
    toggleRow('g-ceiling', 'Nảy ở mép trên', 'Tắt đi thì phía trên không có giới hạn, ném có thể bay ra khỏi mép trên màn hình.', g.physics.ceilingBounce !== false, (value) => { g.physics = Object.assign({}, g.physics, { ceilingBounce: value }); }),
    toggleRow('g-collide', 'Pet va chạm nhau', 'Pet đang bay va vào pet khác sẽ bật ra theo động lượng.', g.physics.petCollision !== false, (value) => { g.physics = Object.assign({}, g.physics, { petCollision: value }); }),
    toggleRow('g-spring', 'Kéo kiểu lò xo', 'Bật (mặc định) = khi kéo, pet bám theo con trỏ như có lò xo, hơi trễ một chút, cảm giác mềm; tắt = bám cứng theo thời gian thực, pet dính sát chuột. Không ảnh hưởng lực ném.', g.physics.dragSpring !== false, (value) => { g.physics = Object.assign({}, g.physics, { dragSpring: value }); }),
  ]);
}

function motionCard() {
  const g = state.globals;
  const weights = g.animationWeights;
  const actionId = 'g-motion-action';
  const actionValue = () => String(Math.max(0, 100 - weights.idle - weights.turn - weights.move));
  const syncAction = () => {
    const node = byId(actionId);
    if (node) node.value = actionValue();
  };
  const weightField = (key, label) =>
    numberField('g-motion-' + key, label, weights[key], (value) => {
      const others = weights.idle + weights.turn + weights.move - weights[key];
      const max = Math.max(0, 100 - others);
      weights[key] = Math.round(Math.min(Math.max(value, 0), max));
      syncAction();
    }, { min: 0, max: 100, step: 1 });
  return card('Tần suất động tác', 'Bốn ô: Đứng chờ / Quay đầu / Di chuyển chỉnh được, Động tác ngẫu nhiên tự tính (= 100 − ba ô còn lại). Dùng chung cho mọi pet; pet pack có thể ghi đè trong file loại của mình.', [
    make('div', { class: 'grid2' }, [
      weightField('idle', 'Đứng chờ (%)'),
      weightField('turn', 'Quay đầu (%)'),
      weightField('move', 'Di chuyển (%)'),
      numberField(actionId, 'Động tác ngẫu nhiên (%, tự tính)', actionValue(), () => {}, { min: 0, max: 100, step: 1, readOnly: true }),
    ]),
  ]);
}

function modelCard() {
  const g = state.globals;
  return card('Ngữ cảnh trò chuyện', 'Mô hình và cách kết nối được cấu hình ở mục "Nhà cung cấp AI"; ở đây chỉnh lượng ngữ cảnh giữ lại khi trò chuyện.', [
    make('div', { class: 'grid2' }, [
      numberField('g-memory', 'Số lượt trò chuyện ghi nhớ', g.chatMemoryRounds, (value) => setGlobal('chatMemoryRounds', Math.round(clampNumber(value, 0, 100, 0))), { min: 0, max: 100, step: 1, hint: '0 nghĩa là không kèm lịch sử.' }),
      numberField('g-image-limit', 'Số ảnh kèm tối đa', g.chatImageLimit, (value) => setGlobal('chatImageLimit', Math.round(clampNumber(value, 0, 50, 0))), { min: 0, max: 50, step: 1, hint: '0 nghĩa là không giới hạn.' }),
    ]),
  ]);
}

function memoryCard() {
  const g = state.globals;
  const memoryProviders = state.memoryProviders || [];
  const isPowerContext = g.memory.provider === POWERCONTEXT_ID;
  // PowerContext 的参数只属于它：选中别家时整块隐藏。用 hidden 切换而不是整卡重渲染——
  // 重渲染会把正在输入的光标位置丢掉。
  const details = make('div', { class: 'grid2', hidden: !isPowerContext }, [
    textField('g-pc-endpoint', 'Địa chỉ PowerContext', g.memory.powercontext.endpoint, (value) => {
      g.memory.powercontext = Object.assign({}, g.memory.powercontext, { endpoint: value });
    }, { hint: 'Địa chỉ gốc của dịch vụ PowerContext trên máy, vd http://127.0.0.1:8000.' }),
    textField('g-pc-token', 'Token truy cập', g.memory.powercontext.token, (value) => {
      g.memory.powercontext = Object.assign({}, g.memory.powercontext, { token: value });
    }, { secret: true, hint: 'Để trống nếu máy chủ không bật xác thực. Token chỉ lưu trong cấu hình trên máy, không ghi vào log.' }),
  ]);
  const optimize = make('div', { hidden: !isPowerContext }, [
    toggleRow('g-pc-optimize', 'Tối ưu truy vấn', 'Bật lên thì dùng mô hình viết lại câu này thành truy vấn tìm kiếm, kèm hai lượt gần nhất để hiểu đúng đại từ. Mặc định tắt: đại từ thường chỉ tới câu vừa nói, mà các lượt đó vốn đã nằm trong lịch sử trò chuyện.', g.memory.powercontext.optimizeQuery, (value) => {
      g.memory.powercontext = Object.assign({}, g.memory.powercontext, { optimizeQuery: value });
    }),
  ]);
  return card('Trí nhớ dài hạn', 'Chọn bộ trí nhớ dùng khi trò chuyện; địa chỉ, token và công tắc bên dưới chỉ dành cho PowerContext.', [
    selectField('g-memory-provider', 'Bộ trí nhớ', g.memory.provider, memoryProviders.map((item) => ({ value: item.id, label: item.name })), (value) => {
      g.memory.provider = value;
      const show = value === POWERCONTEXT_ID;
      details.hidden = !show;
      optimize.hidden = !show;
    }, 'Chọn bộ trí nhớ dùng khi trò chuyện. Bộ có sẵn chỉ kèm vài lượt gần nhất; cài plugin trí nhớ bên thứ ba mới có thêm lựa chọn, không tìm thấy bộ tương ứng thì quay về bộ có sẵn.'),
    details,
    optimize,
  ]);
}

function pathRows() {
  const meta = state.meta || {};
  const rows = [];
  const pairs = [['Cấu hình người dùng', meta.user], ['Mặc định có sẵn', meta.default], ['Cấu hình hoạt ảnh', meta.animations], ['Meme', meta.memes], ['Dữ liệu việc cần làm', meta.todos], ['Log', meta.logs]];
  for (const pair of pairs) {
    if (!pair[1]) continue;
    rows.push(make('div', { class: 'pathRow' }, [
      make('span', { class: 'pathKey', text: pair[0] }),
      make('span', { class: 'pathValue', text: String(pair[1]), title: String(pair[1]) }),
    ]));
  }
  if (Array.isArray(meta.storage)) {
    for (const item of meta.storage) {
      if (!item || !item.path) continue;
      rows.push(make('div', { class: 'pathRow' }, [
        make('span', { class: 'pathKey', text: item.exists === false ? 'Chưa tạo' : 'Đã có' }),
        make('span', { class: 'pathValue', text: String(item.path), title: String(item.path) }),
      ]));
    }
  }
  return rows.length ? rows : [make('p', { class: 'empty', text: 'Không đọc được thông tin vị trí lưu file.' })];
}

function advancedCard() {
  return card('Nâng cao', 'Khi sửa tay file cấu hình có thể tìm vị trí ở đây; "Đồng bộ" sẽ dùng mặc định có sẵn ghi đè cấu hình người dùng.', [
    make('div', {}, pathRows()),
    make('div', { class: 'testRow' }, [button('Ghi đè cấu hình người dùng bằng mặc định', syncFromDefault)]),
  ]);
}

async function syncFromDefault() {
  const confirmed = await confirmDialog({
    title: 'Ghi đè cấu hình người dùng bằng mặc định',
    text: 'Toàn bộ cấu hình người dùng hiện tại sẽ bị thay thế, thao tác này không hoàn tác được.',
    confirmLabel: 'Ghi đè',
    danger: true,
  });
  if (!confirmed) return;
  const status = byId('pet-status');
  setStatus(status, 'Đang đồng bộ…');
  try {
    const merged = await callApi('POST', '/config');
    initDrafts(merged);
    markDirty(false);
    renderPetsPanel();
    setStatus(status, 'Đã ghi đè cấu hình người dùng bằng mặc định.', 'ok');
  } catch (error) {
    setStatus(status, error && error.message ? error.message : String(error), 'error');
  }
}
`;
}
