# DSH Pet Việt 🐳

**Thú cưng trên màn hình, giao diện và lời thoại tiếng Việt — chạy độc lập, không cần cài môi trường lập trình.**

Bản Việt hóa do [qvinh8726](https://github.com/qvinh8726) duy trì, phát triển từ [dsh-pet của PC2005-cloud](https://github.com/PC2005-cloud/dsh-pet), dựa trên mốc `494a50e`. Đây là bản cộng đồng độc lập, **không phải sản phẩm chính thức của DeepSeek**.

[![Phiên bản Việt](https://img.shields.io/github/v/release/qvinh8726/dsh-pet-vi?label=b%E1%BA%A3n%20Vi%E1%BB%87t&include_prereleases)](https://github.com/qvinh8726/dsh-pet-vi/releases)
[![Tải về](https://img.shields.io/github/downloads/qvinh8726/dsh-pet-vi/total?label=l%C6%B0%E1%BB%A3t%20t%E1%BA%A3i)](https://github.com/qvinh8726/dsh-pet-vi/releases)

## Tải và cài đặt

### Cách dễ nhất: bộ cài Windows

1. Mở **[trang phát hành v1.0.0-vi](https://github.com/qvinh8726/dsh-pet-vi/releases/tag/v1.0.0-vi)**.
2. Tải `DSH-Pet-Viet-1.0.0-vi-Windows-x64-Setup.exe` trong phần tệp đính kèm.
3. Chạy bộ cài. Ứng dụng được cài cho tài khoản Windows hiện tại, tạo lối tắt **DSH Pet Việt** và mở pet sau khi cài.
4. Chuột phải vào pet để mở menu; biểu tượng ở khay hệ thống giúp gọi pet trở lại hoặc thoát ứng dụng.

**Yêu cầu:** Windows 10/11 64 bit. Bộ cài đã bao gồm Electron, mã ứng dụng, phông chữ và tài nguyên. **Không cần Node.js, pnpm, Python, Git hay DeepSeek Harness.** Các chức năng AI, thời tiết và giọng đọc trực tuyến cần Internet; hoạt ảnh và tương tác cơ bản không cần tài khoản.

> Bản cộng đồng chưa có chứng thư ký mã thương mại. Windows có thể hiện cảnh báo ứng dụng chưa được nhận diện. Chỉ tải từ repo này, đối chiếu SHA-256 và chỉ cho phép chạy nếu bạn tin cậy nguồn. Không cần tắt phần mềm bảo vệ máy.

### Bản giải nén, không cần cài

Tải `DSH-Pet-Viet-1.0.0-vi-Windows-x64.zip`, **giải nén toàn bộ thư mục**, rồi chạy `dsh-pet-vi.exe`. Đừng chỉ chép riêng tệp EXE: ứng dụng cần các tệp Electron và thư mục tài nguyên đi kèm. Không chạy trực tiếp bên trong cửa sổ ZIP.

Bản ZIP không tạo lối tắt hoặc đăng ký gỡ cài đặt. Dữ liệu cài đặt/trí nhớ vẫn được lưu trong hồ sơ người dùng, không nhất thiết nằm cạnh EXE.

### Kiểm tra tệp tải về

Release có `SHA256SUMS.txt`. Trong PowerShell, chạy:

```powershell
Get-FileHash .\DSH-Pet-Viet-1.0.0-vi-Windows-x64-Setup.exe -Algorithm SHA256
```

Đối chiếu chuỗi băm với tệp công bố trên cùng Release. Hai mục **Source code** do GitHub tự tạo chỉ chứa mã nguồn, không phải bộ cài.

## Pet làm được gì?

- **Hơn 100 hoạt ảnh trong suốt:** đứng chơi, chạy nhảy, ăn vặt, chơi rubik, làm việc và đi ngủ; giữ nguyên chuỗi hoạt ảnh gốc.
- **Tương tác mềm mại:** nhấp để đáp lại, kéo thả, ném bật tường, hiệu ứng co giãn và va chạm giữa nhiều pet.
- **Nuôi nhiều pet:** đổi tên, kích thước, vị trí, giới hạn màn hình và tùy chỉnh gói nhân vật.
- **Trò chuyện và lẩm bẩm:** pet xưng “em”, gọi bạn là “chủ nhân”, có trí nhớ hội thoại, ảnh biểu cảm và động tác theo ngữ cảnh.
- **Giấc ngủ:** ru pet ngủ, đánh thức, nghe nói mớ và những câu từ chối ngái ngủ.
- **Việc cần làm:** thêm nhắc nhở, theo dõi thời hạn và nhận lời nhắc từ pet.
- **Giọng nói:** đọc câu trả lời, chọn giọng đọc, điều chỉnh âm lượng; hỗ trợ tiếng Việt qua giọng Hoài My của dịch vụ Edge khi có kết nối.
- **Thời tiết, số dư và mức dùng:** các tích hợp gốc được giữ lại; khả năng truy vấn phụ thuộc dịch vụ/nhà cung cấp đã cấu hình.
- **Tùy chỉnh giao diện:** cỡ chữ, phông chữ, hành vi, âm thanh nhấp, menu chuột phải và khay hệ thống.
- **Tích hợp DeepSeek Harness:** khi chạy dưới dạng plugin, pet có thể phản ứng với trạng thái làm việc, chờ xác nhận và thông báo của phiên DSH.

Tên mô hình, tên nhà cung cấp, mã hoạt ảnh, khóa cấu hình, địa chỉ API và đường dẫn kỹ thuật được giữ nguyên. Nội dung do bạn nhập hoặc do dịch vụ bên ngoài trả về không được thay đổi tùy tiện.

## Bắt đầu trò chuyện

1. Chuột phải vào pet → **Mở cài đặt AI**.
2. Chọn/nhập nhà cung cấp, địa chỉ API, khóa API và mô hình theo dịch vụ bạn sử dụng.
3. Kiểm tra kết nối rồi lưu. Khóa API là của bạn; bản Việt hóa không cung cấp sẵn tài khoản hoặc hạn mức AI.
4. Mở **Trò chuyện** từ menu pet và gửi lời chào.

Không cấu hình AI vẫn dùng được hoạt ảnh, kéo thả và các tương tác cục bộ. Nếu mô hình hoặc dịch vụ mất kết nối, ứng dụng báo lỗi thay vì giả vờ đã trả lời. Tính năng theo dõi phiên làm việc DSH chỉ có ý nghĩa khi dùng cùng DSH.

## Dữ liệu, gỡ cài đặt và xử lý sự cố

- Cấu hình pet mặc định dùng `~/.dsh/dsh-pet/`, hoặc thư mục do `DSH_HOME` chỉ định; trí nhớ và cấu hình AI cũng nằm trong vùng dữ liệu người dùng. Hồ sơ cửa sổ Electron do ứng dụng quản lý riêng.
- Bản Việt không tự xóa cấu hình cũ. Sao lưu dữ liệu trước khi đổi giữa bản gốc và bản Việt vì chúng có thể cùng dùng `DSH_HOME`.
- Muốn thoát: chọn **Thoát** ở khay hệ thống. Nếu pet bị ẩn, dùng menu khay để đổi vị trí hiển thị.
- Gỡ bản cài qua **Cài đặt Windows → Ứng dụng → DSH Pet Việt → Gỡ cài đặt**. Dữ liệu cá nhân được giữ lại, không bị xóa âm thầm.
- Nếu không thấy pet: kiểm tra khay hệ thống, thiết lập hiển thị, màn hình đang dùng và cấu hình đã lưu. Có thể xem nhật ký trong vùng dữ liệu pet để chẩn đoán; hãy che khóa API và thông tin riêng tư trước khi gửi nhật ký.

Hướng dẫn chi tiết: [Cài đặt và sử dụng](<INSTALL.md>). Báo lỗi bản Việt tại [Issues của repo này](https://github.com/qvinh8726/dsh-pet-vi/issues), kèm phiên bản, Windows, các bước tái hiện và ảnh chụp đã che dữ liệu nhạy cảm.

## Dành cho người phát triển

Mã nguồn vẫn hỗ trợ plugin DSH, chế độ dòng lệnh độc lập và ứng dụng Electron. Release hiện cung cấp bộ cài đã đóng gói cho **Windows x64**; không quảng cáo gói macOS/Linux chưa được build và kiểm chứng.

Yêu cầu phát triển: Node.js ≥ 22.12, pnpm 12, Git. Thực hiện trong thư mục gói:

```sh
git clone https://github.com/qvinh8726/dsh-pet-vi.git
cd dsh-pet-vi/dsh-pet
pnpm install --frozen-lockfile
npm run build
npm run typecheck
npm run lint
npm run check:cycles
npm run check:runtime
npm run format:check
npm run check:openapi
npm test
pnpm exec playwright install chromium
npm run test:ui
node scripts/prepack-check.js
```

Đóng gói Windows sau khi các kiểm tra đạt:

```sh
npm run ensure:electron
npm run dist
# Hoặc chỉ tạo thư mục chạy độc lập:
npm run dist -- dir
```

`dist` mặc định tạo bộ cài NSIS. Muốn sử dụng Electron đã giải nén, đặt `DSH_PET_ELECTRON_DIST`; chỉ khi đặt `DSH_PET_ALLOW_ELECTRON_DOWNLOAD=1` mới cho phép công cụ đóng gói tự tải Electron. Bản build và thư mục phụ thuộc không được commit. Luồng [build phát hành](<.github/workflows/release-app.yml>) kiểm tra và tái tạo sản phẩm từ tag.

### Bản đồ mã nguồn

| Thành phần | Vai trò |
| --- | --- |
| [Gói ứng dụng](<dsh-pet/package.json>) | Phiên bản, lệnh build/test và metadata plugin |
| [Ứng dụng Electron](<dsh-pet/src/app/main.ts>) | Khởi động ứng dụng độc lập và máy chủ cục bộ |
| [Phía DSH](<dsh-pet/src/host/index.ts>) | Đăng ký dịch vụ, cấu hình, sự kiện và API |
| [Phía giao diện](<dsh-pet/src/client/index.ts>) | Đăng ký giao diện pet trong DSH |
| [Chế độ độc lập](<dsh-pet/src/standalone/cli.ts>) | Chạy không cần DSH, cấu hình AI và HTTP cục bộ |
| [Cấu hình mặc định](<dsh-pet/assets/config.jsonc>) | Tính cách, lời thoại, ánh xạ tài nguyên và tùy chọn |
| [Cấu hình bộ cài](<dsh-pet/electron-builder.yml>) | Nhận diện, tài nguyên đi kèm, bộ cài tiếng Việt |

Các hướng dẫn kỹ thuật lịch sử của dự án gốc vẫn được giữ để tham khảo, một số bằng tiếng Trung: [Tính năng](<FEATURES.md>), [Cấu hình](<CONFIG.md>), [API HTTP](<API.md>), [Cordis](<CORDIS.md>), [Tự tạo nhân vật](<MAKE-YOUR-OWN-PET.md>). Định dạng và khóa kỹ thuật được giữ tương thích với dự án gốc.

## Ghi công và giấy phép

- **Tác giả dự án gốc:** [PC2005-cloud — dsh-pet](https://github.com/PC2005-cloud/dsh-pet). Bản Việt giữ nguyên cơ chế hoạt ảnh, tương tác và chức năng gốc, bổ sung bản dịch và đóng gói riêng.
- **Việt hóa và phát hành:** [qvinh8726](https://github.com/qvinh8726/dsh-pet-vi).
- **Mã nguồn:** MIT; giữ nguyên thông báo bản quyền và toàn văn [LICENSE](<LICENSE>).
- **Nhân vật/tài nguyên:** hình tượng cá voi cộng đồng dựa trên “溟月” của [@上善无形](https://space.bilibili.com/4456176); thiết kế hầu gái cá voi DeepSeek của [@ZipZipPipe](https://space.bilibili.com/4168597). **Không phải nhân vật chính thức của DeepSeek.**
- **Điều kiện hình tượng:** [CC BY-NC-SA 4.0 — Ghi công, Phi thương mại, Chia sẻ tương tự](https://creativecommons.org/licenses/by-nc-sa/4.0/), theo [tuyên bố của chủ thể quyền](https://www.bilibili.com/opus/1247156596114456581). Không dùng hình tượng để thương mại hóa. Bản dịch chữ trên ảnh là tác phẩm phái sinh, tiếp tục giữ điều kiện này.

Xem thêm [Ghi công và phạm vi giấy phép](<NOTICE.md>). Giấy phép MIT của mã nguồn **không** thay thế điều kiện phi thương mại của nhân vật và tài nguyên.
