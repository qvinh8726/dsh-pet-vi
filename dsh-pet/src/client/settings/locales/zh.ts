/**
 * 设置页中文文案；键集是全集的真源。
 */

export const zh = {
  nav: 'Cấu hình pet',
  intro: 'Quản lý nhiều pet: mỗi pet có kích thước và vị trí riêng (lưu xong là áp dụng ngay).',
  // 卡片标题与卡片级说明；说明统一进问号气泡。
  petCardTitle: 'Cấu hình pet',
  avatarLabel: 'Ảnh đại diện',
  avatarHint:
    'Ảnh nhỏ hiện cạnh tin nhắn của pet này trong khung chat. Chưa tải lên thì dùng ảnh mặc định của plugin; tải lên là áp dụng ngay và thay ảnh cũ, không cần bấm "Lưu".',
  avatarUpload: 'Tải ảnh lên',
  avatarChange: 'Đổi ảnh',
  avatarUploading: 'Đang tải lên...',
  avatarUploaded: 'Đã cập nhật ảnh đại diện',
  petCardHint:
    'Mỗi pet cấu hình riêng: tên / kích thước / vị trí hiển thị / góc màn hình / độ lệch / bốn công tắc tính năng. Sửa xong bấm "Lưu" ở cuối trang là áp dụng ngay.',
  globalTitle: 'Công tắc chung',
  globalHint:
    'Dùng chung cho mọi pet (pet pack có thể ghi đè riêng trong file của loại đó). Các công tắc này chỉ đổi trạng thái cục bộ, khi bấm "Lưu" mới ghi cả gói vào cấu hình người dùng (không ghi ngay); thông báo hệ thống được đọc lại ngay sau khi lưu, không cần tải lại trang.',
  cornerHint: 'Pet bám vào góc nào của màn hình (bản desktop tính theo vùng làm việc của từng màn hình).',
  marginXHint: 'Khoảng cách ngang tới góc đã chọn (px), nhập số bất kỳ.',
  marginYHint: 'Khoảng cách dọc tới góc đã chọn (px), nhập số bất kỳ.',
  // 「/」命令菜单的行标题（图标由 app.ts 经 command-faces.ts 补上）。
  'cmd.chat': 'Trò chuyện',
  'cmd.pet': 'Pet',
  'cmd.balance': 'Số dư',
  // 设置 → 通用 → 快捷键里的命令标题。
  'shortcut.open': 'Mở chat với pet',
  'shortcut.chat': 'Mở cửa sổ chat',
  'shortcut.hear': 'Nhập bằng giọng nói',
  'shortcut.capture': 'Chụp màn hình vào chat',
  shortcutCardTitle: 'Phím tắt',
  shortcutCardHint: 'Mở ra sẽ thấy hai nhóm: phím tắt của pet và phím tắt toàn cục.',
  shortcutRowChat: 'Mở chat',
  shortcutRowHold: 'Giữ để nói',
  shortcutRowHear: 'Nhập bằng giọng nói',
  shortcutRowCapture: 'Chụp màn hình',
  shortcutRowPaste: 'Dán ảnh',
  shortcutRowTodo: 'Việc cần làm',
  shortcutRowSleep: 'Đi ngủ / Thức dậy',
  shortcutRowDisplay: 'Vị trí hiển thị',
  shortcutRowSidebar: 'Mở chat ở thanh bên',
  shortcutGroupPet: 'Phím tắt của pet',
  shortcutGroupPetHint:
    'Trên web chỉ cần rê chuột lên pet; cửa sổ pet trên desktop phải bấm vào pet một lần để nhận bàn phím rồi mới dùng được.',
  shortcutGroupGlobal: 'Phím tắt toàn cục',
  shortcutGroupGlobalHint:
    'Trên web và trong cửa sổ bản desktop, DSH sẽ phân phối phím; có thể gán lại ở "Cài đặt → Chung → Phím tắt".',
  petsLabel: 'Danh sách pet',
  add: 'Thêm pet',
  remove: 'Xóa',
  confirmRemove: 'Xóa pet "{id}"?',
  confirmTitle: 'Xác nhận',
  cancel: 'Hủy',
  ok: 'Đã hiểu',
  atLeastOne: 'Phải giữ lại ít nhất một pet.',
  emptyPets: 'Chưa có pet nào, bấm "Thêm pet" để tạo.',
  sizeLabel: 'Kích thước (chiều rộng px)',
  sizeHint: 'Chiều cao tự tính = chiều rộng × 9/16.',
  sizePercentLabel: 'Giới hạn theo chiều rộng màn hình (%)',
  sizePercentHint:
    'Pet chiếm tối đa bao nhiêu phần chiều rộng màn hình: 100 = không rộng quá một màn hình, khi cửa sổ rộng hơn pet thì hiển thị y như khi đặt theo px; nhập 30–40 để pet nhỏ hẳn trên điện thoại dựng đứng mà trên desktop vẫn như cũ. Chỉ tính một lần khi tải trang, đổi kích thước cửa sổ thì tải lại trang mới có tác dụng.',
  nameLabel: 'Tên',
  nameHint:
    'Tên hiển thị: hiện ra khi rê chuột lên pet, và được đưa vào tính cách AI (tên của bạn là X). Có thể trùng nhau, để trống thì dùng id của pet.',
  personaLabel: 'Tính cách (tùy chọn)',
  personaHint:
    'Chỉ ảnh hưởng pet này. Để trống = dùng tính cách của mục chứa nó, chính là phần chữ xám trong ô nhập. System thực sự gửi cho mô hình = đoạn này + câu tự thêm "Tên của bạn là “<tên>”" + bối cảnh thời gian hiện tại, nên đừng viết lại tên và ngày ở đây.',
  personaCount: '{n} ký tự',
  balanceEnabled: 'Số dư',
  balanceEnabledHint: 'Bật lên thì pet này phát hoạt ảnh số dư và hiện bong bóng số dư.',
  whisperEnabled: 'Lẩm bẩm',
  whisperEnabledHint:
    'Bật lên thì pet này định kỳ dùng AI tạo một câu và phát hoạt ảnh lẩm bẩm (tính cách lấy từ ô "Tính cách" bên dưới, để trống thì theo mục).',
  workStatusEnabled: 'Theo trạng thái làm việc',
  workStatusEnabledHint:
    'Bật lên thì pet này theo dõi trạng thái làm việc của DSH: khi suy nghĩ / đang làm / chờ xác nhận / xong / lỗi sẽ tự chuyển hoạt ảnh tương ứng và hiện bong bóng (kho hoạt ảnh nằm ở cấp cao nhất của cấu hình, chỉ lắng nghe, không gọi mô hình).',
  fixedEnabled: 'Đứng yên một chỗ',
  fixedEnabledHint:
    'Bật lên thì hoạt ảnh ngẫu nhiên không làm pet tự quay đầu hay đi chỗ khác nữa, chỉ phát hoạt ảnh chờ tại chỗ và động tác nhỏ ngẫu nhiên; phát từ menu chuột phải, gọi qua API, hoạt ảnh số dư / lẩm bẩm / trạng thái làm việc không bị ảnh hưởng.',
  displayLabel: 'Vị trí hiển thị',
  displayHint: 'web=chỉ trình duyệt / desktop=chỉ desktop / both=cả hai / none=ẩn cả hai',
  'display.web': 'Chỉ trình duyệt',
  'display.desktop': 'Chỉ desktop',
  'display.both': 'Cả hai',
  'display.none': 'Ẩn',
  cornerLabel: 'Góc màn hình',
  'corner.top-left': 'Trên bên trái',
  'corner.top-right': 'Trên bên phải',
  'corner.bottom-left': 'Dưới bên trái',
  'corner.bottom-right': 'Dưới bên phải',
  marginX: 'Lệch ngang',
  marginY: 'Lệch dọc',
  save: 'Lưu',
  saveHotkey: 'Ctrl+S / Cmd+S',
  sync: 'Đồng bộ',
  confirmSync:
    'Đồng bộ ngay? Cấu hình mặc định có sẵn trong dự án (đủ trường + chú thích) sẽ ghi đè cấu hình người dùng, mọi tùy chỉnh hiện tại sẽ mất.',
  corruptTitle: 'Cấu hình người dùng bị hỏng, chưa lưu',
  corruptConfirm: 'Vẫn lưu',
  corruptBody:
    'Không đọc được file cấu hình người dùng (nội dung bị hỏng, không phải JSON/JSONC hợp lệ): {path}. Nếu tiếp tục lưu, file này sẽ được dựng lại theo danh sách trường cho phép, toàn bộ nội dung đang có trong đó (các trường tùy chỉnh như animations / physics / memes) sẽ mất hết. Hủy = không động vào file (sửa cấu hình cho hợp lệ trước rồi lưu); Xác nhận = vẫn lưu (bỏ nội dung đang có trong file).',
  syncHint:
    '"Đồng bộ" sẽ ghi cấu hình mặc định có sẵn trong dự án (kèm chú thích và toàn bộ trường nâng cao) vào file cấu hình người dùng, ghi đè tùy chỉnh hiện tại; sau đó có thể sửa trực tiếp file này. Lưu ý hai điểm: ① File đã tạo ra thì luôn là lớp ghi đè: khi nâng cấp plugin, thay đổi trong cấu hình mặc định sẽ không tự áp dụng (trừ khi đồng bộ lại hoặc xóa file); ② Bấm "Lưu" ở trang này sẽ ghi lại file theo danh sách trường cho phép (giá trị giữ nguyên nhưng chú thích sẽ bị xóa).',
  configMeta: 'Cấu hình nâng cao (file)',
  configMetaHint:
    'Cấu hình người dùng có thể ghi đè danh sách pet / kho hoạt ảnh / trọng số phát, sửa xong tải lại hoặc khởi động lại mới có tác dụng: trên trình duyệt thì tải lại trang, trên desktop thì chuột phải vào pet → "Tải lại cấu hình" (tải lại mọi cửa sổ pet trên desktop); cấu hình mặc định là bản tham khảo đầy đủ.',
  defaultConfig: 'Cấu hình mặc định (chỉ đọc, tham khảo đầy đủ)',
  userConfig: 'Cấu hình người dùng (ghi đè tùy chỉnh)',
  todosFile: 'Dữ liệu việc cần làm (nội dung danh sách, hạn và trạng thái hoàn thành; xóa file là xóa sạch danh sách)',
  animationDir: 'Thư mục hoạt ảnh (tự thêm / mở rộng hoạt ảnh)',
  memesDir: 'Thư mục meme (tự thêm / mở rộng ảnh kèm)',
  logFile: 'File nhật ký (dùng để gỡ lỗi, có thể xóa trống)',
  logFileNote:
    'Bản desktop không có console, toàn bộ nhật ký chạy của plugin (khởi động, pet desktop bị crash / khởi động lại, lỗi và cảnh báo) đều ghi vào đúng file này; khi báo lỗi vui lòng đính kèm file. Mỗi file tối đa 1 MB, đầy thì chỉ giữ 512 KB mới nhất.',
  saved: 'Đã lưu, pet áp dụng ngay.',
  loadError: 'Không tải được cấu hình',
  saveError: 'Không lưu được cấu hình, hãy kiểm tra kết nối dịch vụ, quyền ghi thư mục cấu hình hoặc nhật ký dịch vụ.',
  saveInvalid: 'Không lưu được cấu hình: nội dung không hợp lệ, hãy kiểm tra rồi thử lại.',
  syncError: 'Không đồng bộ được cấu hình, hãy kiểm tra kết nối dịch vụ và quyền ghi thư mục cấu hình.',
  loading: 'Đang tải cấu hình...',
  retry: 'Thử lại',
  invalid: 'Hãy kiểm tra lại: kích thước phải là số dương, khoảng lệch là số bất kỳ.',
  busy: 'Đang lưu...',
  extraPetsHint:
    'Còn {n} loại khác đến từ file trong thư mục pet/ (<tên>-config.json + <tên>-animation/), chuyển ở thanh "Loại" phía trên để sửa; khi lưu sẽ ghi lại vào cấu hình của từng gói nhân vật, không trộn vào main-config.jsonc.',
  kindLabel: 'Loại',
  kindMain: 'Có sẵn',
  lastOfKind:
    '"{entry}" chỉ còn đúng một pet, xóa đi là mất luôn loại này. Muốn gỡ hẳn thì hãy xóa trực tiếp file gói nhân vật đó.',
  savePartial:
    'Đã lưu pet chính, nhưng không ghi lại được {names}: hãy kiểm tra cấu hình gói nhân vật có hợp lệ và thư mục có ghi được không.',
  notifyToggle: 'Thông báo hệ thống',
  notifyToggleHint:
    'Hiện thông báo hệ thống (góc dưới bên phải màn hình) khi trò chuyện xong / tạo câu trả lời lỗi / xin quyền / chờ người dùng chọn. Mặc định chỉ hiện khi cửa sổ không được focus, đang xem trang này thì không làm phiền.',
  notifyWhenFocusedToggle: 'Nhắc cả khi đang mở cửa sổ',
  notifyWhenFocusedToggleHint:
    'Khi đang mở trang này và cửa sổ ở phía trước, vẫn hiện thông báo hệ thống và vẫn đọc trạng thái làm việc thành tiếng. Mặc định tắt; bật lên nếu không muốn bỏ lỡ thông báo xong việc và lỗi kể cả khi đang xem.',
  clickSoundToggle: 'Âm thanh khi bấm',
  clickSoundToggleHint:
    'Bấm vào pet sẽ phát một âm thanh có sẵn (assets/sound/click-duck.wav, âm lượng 0.5; bấm liên tục trong 100ms chỉ kêu một lần, mở nhiều cửa sổ cũng không bị chồng tiếng). Tắt đi là im lặng hoàn toàn. Ghi vào cấu hình người dùng khi bấm "Lưu".',
  whisperImageToggle: 'Ảnh kèm khi lẩm bẩm',
  whisperImageToggleHint:
    'Khi lẩm bẩm sẽ bốc ngẫu nhiên một ảnh trong kho meme để hiện cùng câu nói (ánh xạ ảnh nằm ở mục memes cấp cao nhất của file cấu hình). Token: mỗi lần lẩm bẩm vốn đã gọi mô hình một lần, ảnh kèm chỉ thêm tên + mô tả của ảnh được bốc (khoảng 100 ký tự / ≈60 token) vào cùng yêu cầu đó, phần tăng thêm không đáng kể.',
  chatImageToggle: 'Ảnh kèm khi chat',
  chatImageToggleHint:
    'Khi chat, AI sẽ chọn một ảnh trong kho meme hợp với ngữ cảnh (có thể không chọn; ánh xạ ảnh nằm ở mục memes cấp cao nhất của file cấu hình). Token: mỗi tin nhắn đều phải gửi kèm cả danh sách, hiện khoảng 1,1k ký tự (≈650 token, gấp khoảng 11 lần ảnh kèm khi lẩm bẩm) và tăng tuyến tính theo số ảnh; tắt đi thì không gửi kèm ký tự nào.',
  chatAnimationToggle: 'Động tác theo lời chat',
  chatAnimationToggleHint:
    'Bật lên thì khi chat sẽ gửi danh sách động tác diễn được (toàn bộ động tác trong animations.categories) cho mô hình: khi mô hình thấy câu nói đúng là đang diễn một động tác nào đó, pet sẽ diễn ngay; không có cái nào hợp thì chỉ trả lời bằng chữ. Token: mỗi tin nhắn đều phải gửi kèm cả danh sách động tác, tắt đi thì không gửi kèm tên nào. Mặc định chung, mọi pet dùng chung (pet pack có thể ghi đè trong file của loại đó).',
  confineToggle: 'Giữ trong màn hình hiện tại',
  confineToggleHint:
    'Dành cho người dùng nhiều màn hình: bật lên thì pet chỉ hoạt động trong màn hình đang đứng. Pet bị ném chỉ nảy trong màn hình nơi thả tay (mép giữa các màn hình coi như tường, không bay sang màn bên cạnh), tự đi lang thang cũng chỉ trong màn hình hiện tại (bước nào vượt qua mép thì bị hủy). Tắt đi thì vẫn bay / đi qua các màn hình như bình thường. Chỉ ảnh hưởng chế độ desktop; lớp phủ trên trình duyệt vốn chỉ hoạt động trong khung nhìn.',
  trayToggle: 'Khay hệ thống',
  trayToggleHint:
    'Khi khởi động chế độ desktop sẽ đặt một biểu tượng cố định trong vùng thông báo (trên macOS là thanh menu), liệt kê mọi pet trong cấu hình, tích chọn là đổi được vị trí hiển thị, kể cả những pet đang không ở trên desktop và không có cửa sổ để chuột phải. Tắt đi rồi thì muốn gọi pet về desktop chỉ còn cách mở trang cài đặt trên trình duyệt, hoặc chuột phải vào pet trên web. Windows vốn sẽ gom nó vào khung "Biểu tượng ẩn". Chỉ ảnh hưởng chế độ desktop.',
  voiceTitle: 'Đọc thành tiếng',
  voiceHint:
    'Bốn công tắc phát tiếng của pet và giọng đọc: mỗi loại giọng nói có một công tắc riêng, không phụ thuộc nhau. Mặc định tắt hết, ghi vào cấu hình người dùng khi bấm "Lưu" (không ghi ngay).',
  voiceEnabled: 'Đọc thủ công',
  voiceEnabledHint:
    'Đọc thành tiếng câu lẩm bẩm gọi từ menu chuột phải hoặc lệnh gạch chéo, và câu trả lời khi chat. Nút loa trong khung chat là phát từng câu, bấm lúc nào cũng được. Chỉ quyết định "có nói hay không": bong bóng, trí nhớ hội thoại và thông báo hệ thống không bị ảnh hưởng; tổng hợp giọng lỗi thì chỉ ghi nhật ký, không làm gián đoạn cuộc trò chuyện.',
  voiceWhisperEnabled: 'Đọc câu lẩm bẩm',
  voiceWhisperEnabledHint:
    'Đọc thành tiếng câu lẩm bẩm được tạo định kỳ. Mặc định tắt, vì lẩm bẩm chỉ là lời thoại nền, không nên phát tiếng mặc định.',
  voiceTodoEnabled: 'Đọc việc cần làm',
  voiceTodoEnabledHint:
    'Đọc thành tiếng lời nhắc việc cần làm khi đến giờ (câu đó vẫn hiện bong bóng như thường, mục này chỉ quyết định có đọc hay không). Mặc định tắt.',
  voiceNotifyEnabled: 'Đọc thông báo',
  voiceNotifyEnabledHint:
    'Khi việc xong, gặp lỗi hoặc chờ bạn xác nhận sẽ đọc một câu trạng thái làm việc đã cấu hình cho mức đó. Cùng nguyên tắc với thông báo hệ thống: chỉ đọc khi người dùng không ở trang này (chuyển đi, mất focus, thu nhỏ), đang nhìn màn hình thì không làm phiền. Chỉ đọc câu thoại trong cấu hình, không đọc chi tiết công việc. Mặc định tắt.',
  voiceNameLabel: 'Giọng đọc',
  voiceNameHint:
    'Dùng giọng nào khi đọc. Giọng đọc do bộ tổng hợp giọng nói cung cấp, cài thêm bộ khác thì mới có thêm lựa chọn.',
  memoryTitle: 'Trí nhớ dài hạn',
  memoryHint:
    'Dùng bộ trí nhớ nào khi chat; địa chỉ và token của PowerContext chỉ dành cho nó, chọn bộ khác thì không hiện.',
  memoryProviderLabel: 'Trí nhớ dài hạn',
  memoryProviderHint:
    'Dùng bộ trí nhớ nào khi chat. "Trí nhớ có sẵn" chỉ mang theo vài lượt gần nhất; cài plugin trí nhớ bên thứ ba thì mới có thêm lựa chọn. Id được chọn sẽ ghi vào cấu hình người dùng, không tìm thấy bộ tương ứng thì quay về bộ có sẵn và ghi một dòng nhật ký.',
  powercontextEndpointLabel: 'Địa chỉ PowerContext',
  powercontextEndpointHint: 'Địa chỉ gốc của dịch vụ PowerContext trên máy, ví dụ http://127.0.0.1:8000.',
  powercontextTokenLabel: 'Token truy cập',
  powercontextTokenHint:
    'Để trống nếu máy chủ không bật xác thực. Token chỉ lưu trong cấu hình trên máy, không ghi vào nhật ký.',
  optimizeQuery: 'Tối ưu truy vấn',
  optimizeQueryHint:
    'Bật lên thì dùng mô hình viết lại câu này thành truy vấn tìm kiếm, kèm hai lượt gần nhất để hiểu đúng các từ thay thế. Mặc định tắt: từ thay thế thường chỉ tới câu vừa nói, mà các lượt đó vốn đã có trong lịch sử chat, không cần tốn thêm một lần gọi mô hình mỗi lượt.',
  speechProviderLabel: 'Nhận dạng giọng nói',
  speechProviderHint:
    'Ghi âm khi giữ phím xong thì giao cho bộ nào chuyển thành chữ. Chỉ khi cài plugin nhập bằng giọng nói tương ứng mới có nhiều lựa chọn; giá trị được chọn ghi vào cấu hình người dùng, không nhận dạng được thì báo lỗi, không tự đổi sang bộ khác.',
  voiceVolumeLabel: 'Âm lượng',
  voiceVolumeHint:
    'Âm lượng đọc, số thập phân từ 0–1: 1 là to nhất (100%), 0 là tắt tiếng. Chỉ đổi độ to khi phát, không tổng hợp lại âm thanh, chỉnh không tốn thêm tiền. Bốn loại giọng nói dùng chung một mức âm lượng này.',
  environmentTitle: 'Môi trường và định vị',
  environmentHint: 'Thời tiết lấy theo thành phố đặt ở đây. Thay đổi được ghi vào cấu hình người dùng khi bấm "Lưu".',
  environmentCityLabel: 'Thành phố',
  environmentCityHint: 'Chỉ cần nhập tên thành phố, "Đà Nẵng" hay "TP Đà Nẵng" đều được.',
  environmentCityPlaceholder: 'Để trống = tự định vị',
  environmentDetect: 'Phát hiện',
  environmentDetected: 'Đã điền: {city}',
  environmentDetectFailed: 'Không phát hiện được, hãy tự nhập tên thành phố',
  physicsTitle: 'Vật lý (cảm giác kéo và ném)',
  physicsHint:
    'Mặc định chung, mọi pet dùng chung (pet pack có thể ghi đè riêng trong file của loại đó); ghi vào cấu hình người dùng khi bấm "Lưu" (không ghi ngay). Trên trình duyệt lưu xong là áp dụng ngay, trên desktop áp dụng sau khi lưu và tải lại cửa sổ pet.',
  mobileTitle: 'Hiệu ứng trên điện thoại',
  mobileHint:
    'Các mục này chỉ có ý nghĩa trên trình duyệt điện thoại: rung cần có mô-tơ rung, hai công tắc cảm biến chuyển động cần cảm biến hướng / gia tốc; cảm biến còn yêu cầu HTTPS hoặc localhost.',
  'physics.gravity': 'Trọng lực',
  'physics.gravityHint': 'px/s², càng lớn rơi càng nhanh; 0 = không trọng lực (ném ra sẽ bay thẳng đều)',
  'physics.restitution': 'Độ nảy',
  'physics.restitutionHint':
    '0~1, tỉ lệ vận tốc giữ lại khi đập tường / chạm đất bật lên (1 = nảy hoàn toàn, 0 = chạm là dừng)',
  'physics.groundFriction': 'Ma sát tiếp xúc',
  'physics.groundFrictionHint':
    '/s, tốc độ giảm vận tốc theo mặt tiếp xúc khi đập tường / chạm đất / chạm trần; 0 = bốn phía trơn như mặt băng',
  'physics.throwPower': 'Lực tổng',
  'physics.throwPowerHint':
    '> 0, hệ số chung cho lò xo bám tay và vận tốc ban đầu khi ném (1 = mặc định; càng lớn càng bám tay, ném càng mạnh)',
  physicsCeilingBounce: 'Nảy ở mép trên',
  physicsCeilingBounceHint: 'Tắt đi thì ném có thể bay quá mép trên màn hình (trọng lực vẫn kéo nó về)',
  physicsPetCollision: 'Pet va nhau',
  physicsPetCollisionHint: 'Pet đang bay va vào pet khác sẽ bật ra theo bảo toàn động lượng (khối lượng ∝ kích thước²)',
  physicsDragSpring: 'Lò xo bám tay',
  physicsDragSpringHint:
    'Bật (mặc định) = khi kéo dùng lò xo giảm chấn đuổi theo con trỏ, hơi trễ một chút nhưng cảm giác mềm mại; tắt = bám cứng theo thời gian thực, pet dính sát chuột. Không ảnh hưởng lực ném.',
  physicsHaptic: 'Rung khi va chạm',
  physicsHapticHint:
    'Rung một cái mỗi khi đập tường, chạm đất, chạm trần hoặc va nhau. Dùng được trên Chrome / Edge; iOS và các vỏ WebView như Via không có tác dụng; chế độ không làm phiền sẽ chặn rung.',
  physicsTilt: 'Nghiêng để đổi trọng lực',
  physicsTiltHint:
    'Nghiêng điện thoại = trọng lực hướng về phía đó, độ lớn là giá trị trọng lực ở trên; trọng lực bằng 0 thì nghiêng không có tác dụng. Cần HTTPS hoặc localhost.',
  physicsShake: 'Lắc để ném',
  physicsShakeHint:
    'Lắc điện thoại sẽ ném pet theo hướng lắc, lực = lực cơ sở × lực tổng; không phụ thuộc trọng lực, đặt trọng lực bằng 0 vẫn ném được. Cần HTTPS hoặc localhost.',
  invalidPhysics: 'Hãy kiểm tra thông số vật lý: trọng lực / ma sát ≥ 0, độ nảy 0~1, lực tổng > 0.',
  fontTitle: 'Giao diện và phông chữ',
  fontHint:
    'Phông chữ áp dụng cho mọi chữ đang dùng phông Kẹo Dẻo: bong bóng của pet, chú thích khi rê chuột, cửa sổ chat, popup điểm; cỡ chữ chỉ áp dụng cho bong bóng của pet và chú thích khi rê chuột (cỡ chữ của cửa sổ chat và popup điểm không đổi). Mặc định chung, mọi pet dùng chung (pet pack có thể ghi đè riêng trong file của loại đó); ghi vào cấu hình người dùng khi bấm "Lưu", trên trình duyệt lưu xong là áp dụng ngay, trên desktop áp dụng sau khi lưu và tải lại cửa sổ pet.',
  fontFamilyLabel: 'Phông chữ',
  fontFamilyHint:
    '"Kẹo Dẻo (có sẵn)" đi kèm plugin; các phông còn lại là phông hệ thống, máy chưa cài thì tự chuyển sang phông kế tiếp trong danh sách (không bị trống hay báo lỗi).',
  fontSizeLabel: 'Cỡ chữ (px)',
  fontSizeHint:
    'Cỡ chữ nội dung bong bóng; chú thích khi rê chuột và chữ nhỏ trong bong bóng tính theo tỉ lệ sẵn có. Khoảng 4~200.',
  fontFollowToggle: 'Cỡ chữ theo kích thước pet',
  fontFollowToggleHint:
    'Bật (mặc định): pet to lên thì chữ cũng to lên theo tỉ lệ, ở chiều rộng 462 thì đúng bằng cỡ chữ đặt ở trên; tắt: cỡ chữ cố định, không đổi theo kích thước pet.',
  invalidFont: 'Hãy kiểm tra cài đặt phông chữ: phông phải nằm trong danh sách, cỡ chữ phải là số từ 4~200.',
  'font.candy': 'Kẹo Dẻo (có sẵn)',
  'font.yahei': 'Microsoft YaHei / PingFang',
  'font.youyuan': 'YouYuan',
  'font.kaiti': 'KaiTi',
  'font.simsun': 'SimSun',
  'font.comic': 'Comic',
  'font.system': 'Mặc định hệ thống',
  modelTitle: 'Chat và mô hình',
  modelHint:
    'Lẩm bẩm và chat mỗi cái dùng mô hình nào, và mỗi lần chat đưa bao nhiêu lịch sử vào ngữ cảnh. Chọn "Theo cuộc trò chuyện hiện tại" = dùng mô hình mà cuộc trò chuyện hiện tại đang dùng (mặc định). Mặc định chung: áp dụng cho mọi pet, pet pack có thể ghi đè riêng trong file của loại đó. Các lựa chọn lấy cùng nguồn với bộ chọn mô hình của DSH, do DSH cung cấp theo thời gian thực.',
  modelFollow: 'Theo cuộc trò chuyện hiện tại',
  modelSearch: 'Tìm mô hình...',
  modelEmpty: 'Không có mô hình phù hợp.',
  modelNoModels: 'Không có mô hình nào dùng được.',
  modelLoading: 'Đang làm mới danh sách mô hình...',
  modelTriggerAria: 'Chọn mô hình, hiện tại là {model}',
  modelUnknown: '(cấu hình hiện tại, không có trong danh sách)',
  modelNone: 'Nhà cung cấp này không có mô hình nào dùng được',
  whisperModelLabel: 'Mô hình lẩm bẩm',
  chatModelLabel: 'Mô hình chat',
  modelFieldHint:
    'Chọn "Theo cuộc trò chuyện hiện tại" = dùng mô hình của cuộc trò chuyện hiện tại; nếu đã chỉ định mà gọi lỗi thì tự quay về mô hình của cuộc trò chuyện hiện tại thử lại một lần.',
  invalidModel:
    'Hãy kiểm tra cài đặt mô hình: nhà cung cấp và mô hình phải chọn cả hai, hoặc để trống cả hai (theo cuộc trò chuyện hiện tại).',
  modelCatalogFailed:
    'Không tải được danh sách mô hình (tải lại trang để thử lại); giá trị đang cấu hình vẫn được giữ nguyên.',
  chatMemory: 'Số lượt lịch sử chat',
  chatMemoryHint:
    'Số lượt lịch sử gần nhất gửi kèm mỗi lần chat (1 lượt = 1 hỏi 1 đáp; 0 = không kèm lịch sử, mỗi câu là một cuộc trò chuyện mới). Trí nhớ hội thoại vẫn lưu đủ, không xóa; giá trị này chỉ quyết định cắt bao nhiêu đưa vào ngữ cảnh: càng lớn càng nhớ lâu, nhưng cũng càng tốn token. Mặc định chung, mọi pet dùng chung (pet pack có thể ghi đè riêng trong file của loại đó).',
  invalidChatMemory: 'Hãy kiểm tra số lượt lịch sử chat: phải là số ≥ 0.',
  chatImageLimit: 'Số ảnh kèm tối đa khi chat',
  chatImageLimitHint:
    'Danh sách meme gửi cho mô hình khi chat tối đa bao nhiêu ảnh ("N ảnh đầu" = N mục viết đầu tiên trong cấu hình, muốn ảnh nào được gửi trước thì chuyển nó lên trên). Cả danh sách đều phải gửi kèm mỗi tin nhắn, token tăng tuyến tính theo số ảnh: nhiều ảnh là đốt tiền vô ích, giới hạn N ảnh đầu thì mô hình chỉ chọn trong số đó. 0 = không giới hạn (gửi tất cả). Mặc định có sẵn là 10. Mặc định chung, mọi pet dùng chung (pet pack có thể ghi đè trong file của loại đó). Chỉ ảnh hưởng việc chọn ảnh khi chat: lẩm bẩm chỉ kèm đúng một ảnh được bốc.',
  invalidChatImageLimit: 'Hãy kiểm tra số ảnh kèm tối đa khi chat: phải là số ≥ 0 (0 = không giới hạn).',
  notifyTest: 'Thử thông báo',
  notifyTestOk: 'Đã gửi thông báo thử, hãy xem góc dưới bên phải màn hình.',
  notifyDenyUnsupported: 'Môi trường hiện tại không hỗ trợ thông báo hệ thống (trình duyệt không có Notification API).',
  notifyDenyBlocked: 'Quyền thông báo đã bị trình duyệt đặt là "Chặn".',
  notifyDenyRejected: 'Bạn đã chọn "Chặn" trong hộp thoại xin quyền.',
  notifyDenyError: 'Lỗi khi xin quyền',
  notifyGuide:
    'Hướng dẫn: bấm 🔒/ⓘ bên trái thanh địa chỉ → "Cài đặt trang web" → "Thông báo" → đổi thành "Cho phép", tải lại trang rồi thử lại.',
  storageTitle: 'Gỡ cài đặt và lưu trữ',
  storageHint:
    'Mọi vị trí plugin lưu trên máy. Xóa bộ nhớ đệm không ảnh hưởng gì (sẽ tự tải lại / dựng lại); xóa "Dữ liệu người dùng của plugin" sẽ mất cấu hình và trí nhớ hội thoại.',
  'storage.userData':
    'Dữ liệu người dùng của plugin: cấu hình tùy chỉnh main-config.jsonc, trí nhớ hội thoại memory.json, hoạt ảnh tùy chỉnh main-animation/, pet dạng file pet/',
  'storage.electron':
    'Môi trường chạy Electron cho pet desktop (khá nặng; xóa đi thì lần sau bật chế độ desktop sẽ tự tải lại)',
  'storage.desktopCache':
    'Bộ nhớ đệm của cửa sổ pet desktop và bộ nhớ đệm tỉ lệ màn hình chính (xóa được, sẽ tự dựng lại)',
  'storage.electronCache': 'Bộ nhớ đệm gói cài Electron (xóa được, khi cần sẽ tải lại)',
  'storage.package': 'Bản thân plugin (do DSH quản lý, gỡ bằng lệnh gỡ cài đặt bên dưới, đừng xóa tay)',
  storageMissing: '(chưa được tạo)',
  uninstallTitle: 'Cách gỡ cài đặt',
  uninstallStep1: '1. Thoát DSH trước (pet desktop sẽ thoát theo); đừng xóa các file trên khi pet đang chạy.',
  uninstallStep2: '2. Gỡ bản thân plugin (chạy trong terminal, đồng thời gỡ khỏi lớp bundle của profile):',
  uninstallStep3:
    '3. Xóa các vị trí trên nếu cần: các mục bộ nhớ đệm xóa không ảnh hưởng gì; xóa "Dữ liệu người dùng của plugin" sẽ mất cấu hình và trí nhớ hội thoại (muốn giữ thì sao lưu main-config.jsonc trong đó trước).',
  motionTitle: 'Tần suất động tác',
  motionHint:
    'Bốn ô: chờ / quay đầu / di chuyển sửa được, động tác ngẫu nhiên tự tính (= 100 − ba mục còn lại). Mặc định chung, mọi pet dùng chung; pet pack có thể ghi đè trong file của loại đó.',
  'motion.idle': 'Chờ',
  'motion.turn': 'Quay đầu',
  'motion.move': 'Di chuyển',
  'motion.action': 'Động tác ngẫu nhiên',
  uninstallCmd: 'dsh plugin --profile {profile} remove dsh-pet',
};

/** 文案键；zh 的键集即全集。 */
export type Key = keyof typeof zh;
