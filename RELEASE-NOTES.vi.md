# Ghi chú phát hành DSH Pet Việt v1.0.0-vi

Bản Windows x64 độc lập từ [dsh-pet của PC2005-cloud](https://github.com/PC2005-cloud/dsh-pet), tiếp tục Việt hóa từ `494a50e`, do [qvinh8726](https://github.com/qvinh8726/dsh-pet-vi) duy trì.

## Tệp tải về

- `DSH-Pet-Viet-1.0.0-vi-Windows-x64-Setup.exe`: bộ cài theo tài khoản Windows, tạo lối tắt và bộ gỡ.
- `DSH-Pet-Viet-1.0.0-vi-Windows-x64.zip`: giải nén toàn bộ rồi chạy `dsh-pet-vi.exe`.
- `SHA256SUMS.txt`: mã kiểm tra cho hai gói trên.

Yêu cầu Windows 10/11 x64. Đã kèm Electron 43.3.0 và tài nguyên, không cần cài Node.js, pnpm hay DSH. Bản cộng đồng chưa ký mã số; Windows có thể cảnh báo ứng dụng chưa được nhận diện. Chỉ tải từ repo này và đối chiếu mã SHA-256.

## Phần Việt hóa bổ sung

- Đăng ký locale `vi`/`vi-VN`, giữ giao diện tiếng Việt cả khi hệ điều hành/trình duyệt hoặc DSH chọn `en`/`zh`.
- Việt hóa các lỗi API/HTTP, giới hạn đầu vào, kết nối, lưu cấu hình, hàng đợi giọng nói, nhận dạng, streaming và fallback của chế độ độc lập.
- Nhãn menu, hộp thoại, tooltip, trạng thái chat và thông báo runtime; dịch cả menu mặc định của Electron, giữ nguyên role và phím tắt.
- Tách nhãn Việt cho **114 hoạt ảnh, 5 nhóm động tác, 27 meme** khỏi ID kỹ thuật. Các thao tác vẫn gửi đúng ID/đường dẫn gốc.
- Việt hóa caption của **26 meme và logo**; một meme không có chữ được giữ nguyên. Các vùng chữ chồng hình dùng bảng caption gọn tại vị trí chữ cũ.
- Dịch chữ trong hai video bong bóng ăn uống/suy nghĩ; kiểm tra toàn bộ 241 khung hình mỗi clip, giữ 640×360, 24 fps, 10,042 giây, alpha và pixel ngoài vùng caption. Chữ dùng Arial Bold, có rút nhỏ/xuống dòng; file lossless lớn hơn bản gốc.
- Bổ sung giọng **Hoài My/Nam Minh** và mặc định Hoài My cho cấu hình mới. Giữ các ID giọng cũ để cấu hình đã lưu không hỏng.
- Ưu tiên phông hệ thống hỗ trợ dấu Việt; sửa wrap/flex của nhãn dài, tooltip, nút xác nhận và khung chat.
- README và hướng dẫn cài đặt tiếng Việt, nhận diện “DSH Pet Việt”, hồ sơ Electron riêng, bộ cài NSIS tiếng Việt và script tạo ZIP/checksum.

## Kiểm thử

Chạy trên Windows x64, Node.js 24.14.0, Electron 43.3.0; đây là kết quả cục bộ, không phải kết quả GitHub Actions.

| Kiểm tra | Kết quả |
| --- | --- |
| `npm test` — toàn bộ suite nguồn | 2.762 test: **2.761 đạt, 0 lỗi, 1 bỏ qua** |
| `npm run test:ui` — toàn bộ suite UI/runtime | 66 test: **65 đạt, 0 lỗi, 1 bỏ qua** |
| TypeScript nguồn và test | Đạt |
| ESLint nguồn, ESLint runtime | Đạt |
| Kiểm tra vòng import | Đạt: 652 module, 1.189 cạnh runtime, không có vòng |
| Prettier | Đạt |
| OpenAPI | Đạt: 46 đường dẫn, 56 thao tác, 214 tham chiếu |
| Build đầy đủ và kiểm tra tài nguyên trước đóng gói | Đạt |
| EXE ngoài repo, không có phụ thuộc dev bên cạnh | Đạt |
| Bộ cài: cài vào thư mục tạm, chạy bản cài, gỡ cài | Đạt |

Hai ca bỏ qua là kiểm tra sửa quyền EACCES có điều kiện trên Windows và ca desktop macOS yêu cầu Darwin/Electron. Không bỏ thêm test để tránh lỗi. Một ca hàng đợi giọng nói vốn phụ thuộc thời gian thực đã được chuyển sang đồng hồ giả, giữ nguyên hành vi và ngưỡng thời gian của ứng dụng.

Kiểm tra trình duyệt gồm ngôn ngữ mặc định, Unicode qua lưu cấu hình, glyph Việt và bố cục 320/360/520/900 px. Kiểm chứng EXE gồm phát video, menu chuột phải và menu Electron, ngủ/thức dậy, đọc/ghi tên tiếng Việt, chặn truy cập cấu hình AI không có token và trang cài đặt độc lập trên trình duyệt `en-US`.

## Phạm vi và giới hạn

- Giữ logic vật lý, chuỗi hoạt ảnh, thời lượng và ID tài nguyên; các thay đổi hành vi nằm ở ánh xạ ngôn ngữ, định dạng lỗi, bố cục và nhận diện/hồ sơ của bản riêng.
- Khóa kỹ thuật, tên mô hình/nhà cung cấp, dữ liệu người dùng, tên riêng ghi công và watermark tác giả được giữ nguyên. Nội dung AI hoặc thông báo động từ dịch vụ bên ngoài có thể theo ngôn ngữ của dịch vụ đó.
- Không dùng khóa AI thật để tiêu hạn mức khi kiểm thử; chưa xác minh thực tế mọi nhà cung cấp, ASR/TTS trực tuyến hoặc mọi tỷ lệ DPI/màn hình. Bản macOS/Linux chưa được build và kiểm chứng ở đợt này.
- Lượt cài/gỡ được kiểm tra tự động ở chế độ im lặng; không khẳng định đã kiểm tra từng hộp thoại SmartScreen hoặc hộp thoại hệ điều hành.
- Dữ liệu pet có thể vẫn dùng chung `DSH_HOME` với bản gốc; cache/hồ sơ Electron của bản Việt tách riêng. Nên sao lưu dữ liệu trước khi chuyển phiên bản.

## Ghi công

Giữ nguyên hai tệp LICENSE MIT và credit PC2005-cloud. Hình tượng/tài nguyên theo CC BY-NC-SA 4.0, không thương mại hóa. Nguyên mẫu “溟月”: [@上善无形](https://space.bilibili.com/4456176); thiết kế hầu gái cá voi: [@ZipZipPipe](https://space.bilibili.com/4168597). Xem [NOTICE](https://github.com/qvinh8726/dsh-pet-vi/blob/v1.0.0-vi/NOTICE.md) và [README](https://github.com/qvinh8726/dsh-pet-vi/blob/v1.0.0-vi/README.md) để biết phạm vi giấy phép.
