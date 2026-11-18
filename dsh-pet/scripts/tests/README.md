# Kiểm thử giao diện và bản Windows

Trong thư mục gói `dsh-pet/`:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
npm test
npm run test:ui
```

Kiểm thử dùng React và Chromium thật để kiểm tra tải/lưu cấu hình, thử lại khi lỗi, khôi phục mặc định, phông có dấu và bố cục ở 320/360/520/900 px. Các locale trình duyệt/host `en`, `zh`, `vi` và locale lạ đều phải hiển thị bản Việt. API được thay bằng dữ liệu thử cục bộ, không đọc hoặc sửa cấu hình DSH thật.

Đặt `DSH_PET_UI_ARTIFACTS` để lưu ảnh kiểm tra. Ca macOS chỉ chạy trên macOS khi có `DSH_PET_ELECTRON`; các ca X11 dùng socket/buffer giả để kiểm tra giao thức, không xác nhận desktop X11 thật trên Windows.

Sau khi build đầy đủ và đóng gói:

```sh
npm run build
npm run dist
node scripts/verify-release.mjs
```

Lệnh kiểm chứng chép cả ứng dụng sang thư mục tạm ngoài repo, dùng `DSH_HOME` và `DSH_PET_USER_DATA_DIR` tạm. Nó kiểm tra phiên bản, menu Electron, phát video, bảo vệ API, menu chuột phải, ngủ/thức dậy, lưu Unicode và trang cài đặt độc lập. Log/ảnh nằm trong `temp/release-verification/`, không commit. Có thể truyền đường dẫn EXE để kiểm tra bản đã cài hoặc đã giải nén.

Kiểm tra cài–chạy–gỡ trên Windows:

```powershell
& ./scripts/verify-installer.ps1
```

Script từ chối chạy nếu đã có DSH Pet Việt được cài trong tài khoản hiện tại. Nó cài vào thư mục tạm riêng, kiểm tra registry và tài liệu đi kèm, chạy kiểm chứng EXE rồi gỡ chính bản thử đó. Kết quả nằm trong `temp/installer-verification/`. Script dùng UTF-8 BOM để tương thích Windows PowerShell 5.1. Không coi lượt cài im lặng này là đã kiểm tra từng hộp thoại của Windows hoặc SmartScreen.

Cuối cùng tạo ZIP và checksum bằng `node scripts/package-release.mjs`. Script không ghi đè ZIP đã tồn tại. Các phép thử này không sử dụng khóa AI thật và không kiểm chứng ASR/TTS hoặc mọi nhà cung cấp trực tuyến.
