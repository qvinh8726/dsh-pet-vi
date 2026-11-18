# Cài đặt DSH Pet Việt

[Quay về giới thiệu](<README.md>) · [Tải bản v1.0.1-vi](https://github.com/qvinh8726/dsh-pet-vi/releases/tag/v1.0.1-vi)

## Người dùng Windows: không cần môi trường lập trình

### Bộ cài được khuyên dùng

1. Tải `DSH-Pet-Viet-1.0.1-vi-Windows-x64-Setup.exe` từ Release của **qvinh8726/dsh-pet-vi**.
2. Kiểm tra mã SHA-256 với `SHA256SUMS.txt` nếu muốn xác minh tệp.
3. Chạy bộ cài. Ứng dụng cài cho tài khoản hiện tại, tạo lối tắt và mở pet.
4. Chuột phải vào pet để mở menu. Muốn thoát, chọn **Thoát** ở khay hệ thống.

Hỗ trợ Windows 10/11 x64. Không cần cài Node.js, Git, Python, pnpm, Electron hoặc DeepSeek Harness riêng: gói đã có phần chạy cần thiết. Bản cộng đồng chưa được ký mã thương mại; cảnh báo uy tín của Windows không phải hộp thoại của ứng dụng và phụ thuộc ngôn ngữ Windows. Chỉ tiếp tục khi tin cậy nguồn, không tắt cơ chế bảo vệ hệ thống.

### Bản ZIP

Tải `DSH-Pet-Viet-1.0.1-vi-Windows-x64.zip`, giải nén toàn bộ rồi chạy `dsh-pet-vi.exe`. Giữ nguyên tất cả tệp và thư mục đi kèm. Bản ZIP không đăng ký gỡ cài đặt hay tự tạo lối tắt.

### Sử dụng lần đầu

- Pet có thể chạy hoạt ảnh và tương tác cơ bản ngay, kể cả khi chưa có tài khoản AI.
- Nhấp vào pet để tương tác, kéo rồi thả để ném, chuột phải để đổi hành vi hoặc mở các bảng điều khiển.
- **Trò chuyện/lẩm bẩm AI:** mở **Mở cài đặt AI**, nhập thông tin dịch vụ của bạn, chọn mô hình rồi lưu. Không có khóa API tặng kèm; phí sử dụng phụ thuộc nhà cung cấp.
- **Giọng đọc:** cần Internet; mặc định dùng giọng Trung gốc **Hiểu Y — `edge/zh-CN-XiaoyiNeural`**. Bong bóng vẫn tiếng Việt. Câu cố định đọc nguyên văn Trung từ bản gốc; câu AI hoặc câu tùy chỉnh được chuyển riêng sang Trung bằng mô hình đã cấu hình (có thể thêm thời gian chờ và phí). Nếu không tạo được lời Trung, ứng dụng giữ chữ Việt và báo không đọc được, không đọc Việt thay thế. Hai giọng Hoài My/Nam Minh của bản 1.0.0 được chuyển sang Hiểu Y khi nạp cấu hình; không tự sửa tệp người dùng trên đĩa.
- **Thông báo và trạng thái DSH:** chức năng liên quan phiên DSH chỉ hoạt động khi chạy tích hợp với DSH; ứng dụng độc lập không giả lập một phiên làm việc DSH.
- **Thời tiết/số dư:** cần kết nối và cấu hình phù hợp với dịch vụ; lỗi kết nối được báo rõ.

### Dữ liệu và gỡ cài

Cấu hình pet nằm trong `~/.dsh/dsh-pet/` mặc định, hoặc vị trí do `DSH_HOME` chỉ định. Cấu hình AI, trí nhớ và hồ sơ Electron được giữ trong vùng dữ liệu của người dùng. Bản gốc và bản Việt có thể dùng chung vùng dữ liệu DSH, vì vậy nên sao lưu trước khi chuyển phiên bản.

Gỡ bộ cài tại **Cài đặt Windows → Ứng dụng → DSH Pet Việt → Gỡ cài đặt**. Bộ gỡ không tự xóa dữ liệu cá nhân. Với bản ZIP, thoát ứng dụng trước rồi xóa thư mục đã giải nén nếu không dùng nữa.

Không thấy pet? Kiểm tra menu khay, trạng thái hiển thị và màn hình hiện tại; cấu hình cũ có thể đã ẩn pet. Đóng ứng dụng từ khay rồi mở lại nếu vừa sửa cấu hình bằng tay.

## Cài từ mã nguồn

Phần này dành cho người phát triển, không cần làm nếu đã tải EXE/ZIP.

Yêu cầu Node.js ≥ 22.12 và pnpm 12:

```sh
git clone https://github.com/qvinh8726/dsh-pet-vi.git
cd dsh-pet-vi/dsh-pet
pnpm install --frozen-lockfile
npm run build
```

Chạy bằng Node (không cần DSH):

```sh
npm run standalone
npm run standalone -- --check
```

Chạy ứng dụng Electron từ mã nguồn:

```sh
npm run ensure:electron
npm run start:app
```

### Build bộ cài Windows

```sh
npm run build
npm run ensure:electron
npm run dist
```

Sản phẩm trong `dist-app/`: bộ cài NSIS và `win-unpacked/`. Muốn chỉ tạo thư mục chạy trực tiếp:

```sh
npm run dist -- dir
```

Công cụ đóng gói mặc định không tải Electron ngầm. Dùng `DSH_PET_ELECTRON_DIST` để chỉ thư mục đã giải nén, hoặc `DSH_PET_ALLOW_ELECTRON_DOWNLOAD=1` để cho phép tải trong môi trường build/CI. Bản phát hành đã chứa Electron nên người dùng cuối không gặp bước tải này.

### Cài bản Việt dưới dạng plugin DSH

Chỉ dùng khi bạn đã có DSH và muốn pet theo dõi phiên làm việc. Sau khi build, cài **thư mục gói của fork này**, không cài tên `dsh-pet` trên npm vì đó là bản gốc:

```sh
dsh plugin --profile web add file:D:/duong-dan/dsh-pet-vi/dsh-pet
# Với DSH Desktop, thay profile web bằng desktop.
```

Hoặc chọn thư mục gói trong trang quản lý plugin của DSH. Khởi động lại DSH sau khi cài để nạp cả phần phía máy chủ. Việc Việt hóa ứng dụng pet không đổi ngôn ngữ toàn bộ DSH.

## Kiểm thử trước khi phát hành

Trong thư mục gói, chạy đầy đủ:

```sh
npm run typecheck
npm run lint
npm run check:cycles
npm run check:runtime
npm run format:check
npm run check:openapi
npm test
pnpm exec playwright install chromium
npm run test:ui
npm run build
node scripts/prepack-check.js
```

Bộ kiểm thử trình duyệt dùng dữ liệu giả cục bộ, không sửa cấu hình DSH của người dùng. Một số kiểm tra riêng cho macOS/X11 được bỏ qua đúng điều kiện hệ điều hành; điều này không có nghĩa các nền tảng đó đã được kiểm thử thực tế trên Windows. Kết quả cụ thể được công bố trong ghi chú Release.

## Hỗ trợ và bản quyền

Báo lỗi tại [repo bản Việt](https://github.com/qvinh8726/dsh-pet-vi/issues). Giữ nguyên ghi công [PC2005-cloud](https://github.com/PC2005-cloud/dsh-pet), [giấy phép MIT](<LICENSE>) và [điều kiện phi thương mại của hình tượng](<NOTICE.md>).
