# DSH Pet Việt v1.0.1-vi — chữ Việt, giọng Trung gốc

Bản cập nhật âm thanh cho [qvinh8726/dsh-pet-vi](https://github.com/qvinh8726/dsh-pet-vi), giữ nguyên giao diện, menu, cài đặt, thông báo, ảnh/video có chữ Việt và chữ trên bong bóng của v1.0.0-vi.

## Tải và chạy

- `DSH-Pet-Viet-1.0.1-vi-Windows-x64-Setup.exe`: bộ cài Windows x64 theo tài khoản hiện tại.
- `DSH-Pet-Viet-1.0.1-vi-Windows-x64.zip`: giải nén toàn bộ rồi chạy `dsh-pet-vi.exe`.
- `SHA256SUMS.txt`: checksum cho hai gói.

Đã kèm Electron 43.3.0 và tài nguyên; không cần Node.js, pnpm hoặc DSH riêng. Bản cộng đồng chưa ký mã số. Nên sao lưu cấu hình trước khi nâng cấp; dữ liệu người dùng được giữ lại.

## Thay đổi âm thanh

- Khôi phục giọng mặc định **`edge/zh-CN-XiaoyiNeural` (Hiểu Y)** và đúng bốn ID giọng Trung gốc. Nhãn lựa chọn giọng vẫn tiếng Việt.
- Chuyển riêng hai giá trị Hoài My/Nam Minh từ bản 1.0.0 sang giọng mặc định gốc khi đọc cấu hình. Không tự sửa tệp cấu hình trên đĩa, không thay giọng nhà cung cấp tùy chỉnh.
- Tách văn bản hiển thị khỏi văn bản đọc tại nhánh TTS dùng chung cho web/desktop, phát tự động, thông báo và nút loa thủ công. Không đưa câu Trung trở lại bong bóng hoặc lịch sử chat.
- Bảng đối chiếu gồm **145 câu cố định và 36 mẫu công cụ**, trích nguyên văn Trung từ [upstream `fb38ce6`](https://github.com/PC2005-cloud/dsh-pet/commit/fb38ce620576f5ed3735a99536d2b1a4a9eb313f), đối ứng với câu Việt của bản `292f841`. Các mẫu nhắc việc giữ nguyên phần vỏ Trung, số và thời gian; tiêu đề được chuyển riêng cho lời đọc.
- Âm thanh đóng gói `click-duck.wav` và mapping sự kiện vốn giống repo gốc, được giữ nguyên, không tái mã hóa. SHA-256: `f1dafe05dfaa696b190e127800c48513e192d3efb521c246d1eaf86a4589b617`.
- Cache audio có phiên bản ngôn ngữ riêng để không phát lại âm thanh Việt cũ. Hàng đợi giới hạn, tổng thời gian chờ tối đa 28 giây và truyền hủy xuống bước chuyển ngôn ngữ/TTS.
- Chuyển lời đọc là tác vụ ưu tiên thấp: chat mới nhường quyền xử lý cho người dùng thay vì báo bận vì đang dịch giọng.

## Câu thoại do AI tạo

Những câu mới không có câu gốc cố định trong repo upstream. Chúng được tạo **bản tiếng Trung riêng cho TTS** qua mô hình đã cấu hình; câu Việt trên màn hình không đổi. Bước này cần Internet, có thể thêm độ trễ và phí sử dụng mô hình. Nếu mô hình chưa cấu hình, bị hủy hoặc không trả lời Trung hợp lệ, ứng dụng giữ chữ Việt và hiển thị trạng thái không đọc được; không quay sang đọc câu Việt bằng giọng Trung.

Các đường dẫn/tên công cụ trong mẫu kỹ thuật gốc được giữ nguyên như upstream; không tuyên bố mọi tên riêng do người dùng nhập đều có bản phát âm Trung cố định. Không thay đổi ASR, logic hoạt ảnh, vật lý, khóa cấu hình hay nhận diện bản Việt.

## Kiểm chứng

Kết quả cuối trên Windows x64:

| Kiểm tra | Kết quả |
| --- | --- |
| Full suite nguồn (`npm test`) | 2.812 test: **2.811 đạt, 0 lỗi, 1 bỏ qua** |
| Full suite UI/runtime (`npm run test:ui`) | 66 test: **65 đạt, 0 lỗi, 1 bỏ qua** |
| TypeScript, ESLint nguồn/runtime, Prettier | Đạt |
| Vòng import, OpenAPI | Đạt: 659 module/1.212 cạnh không vòng; 46 đường dẫn/56 thao tác |
| Build đầy đủ, prepack | Đạt |

Kiểm tra EXE dùng hồ sơ tạm ngoài repo, không dùng cấu hình DSH thật. Live smoke bắt SSML tại thư viện Edge đã đóng gói và xác nhận `睡饱啦，主人！` với `zh-CN-XiaoyiNeural`, trong khi bong bóng hiện `Ngủ no rồi nè, chủ nhân ơi!`. MP3 13.104 byte phát đến hết, một sự kiện `playing`, một `ended`, không lỗi audio. Payload của bộ cài được giải nén, đối chiếu từng tệp với bản build và chạy trực tiếp trong hồ sơ tạm. Không chạy cài/gỡ hoặc nâng cấp đè ở đợt này vì máy đã có bản người dùng cài sẵn; giữ nguyên bản đang dùng.

Các phép thử mô hình dùng fake transport, không tiêu khóa AI của người dùng. Chỉ live smoke Edge được kết nối thật; không khẳng định đã thử mọi nhà cung cấp hoặc mọi thiết bị loa. Hai ca riêng nền tảng Windows/macOS vẫn bỏ qua theo điều kiện gốc. GitHub Actions của fork đang tắt; đây là kết quả cục bộ.

## Ghi công

Giữ nguyên PC2005-cloud, MIT và điều kiện hình tượng CC BY-NC-SA 4.0. [NOTICE](https://github.com/qvinh8726/dsh-pet-vi/blob/v1.0.1-vi/NOTICE.md) và [README](https://github.com/qvinh8726/dsh-pet-vi/blob/v1.0.1-vi/README.md) có thông tin đầy đủ.
