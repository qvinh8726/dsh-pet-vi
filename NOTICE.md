# Ghi công và phạm vi giấy phép — DSH Pet Việt

## Dự án gốc

- Tác giả: **PC2005-cloud**.
- Mã nguồn gốc: <https://github.com/PC2005-cloud/dsh-pet>.
- Bản Việt hóa: <https://github.com/qvinh8726/dsh-pet-vi>, do **qvinh8726** duy trì.
- Mốc bắt đầu Việt hóa: `494a50ee888c640d1afc455aec0d12afa534930a`.
- Các thay đổi của bản Việt: bản dịch giao diện/thông báo/lời thoại, nhãn tài nguyên, chữ trên ảnh biểu cảm, hỗ trợ hiển thị tiếng Việt, tài liệu và đóng gói Windows riêng. Các mã định danh tài nguyên và cơ chế hoạt ảnh gốc được giữ lại.

## Mã nguồn

Mã nguồn theo giấy phép MIT, bản quyền © 2026 PC2005-cloud. Toàn văn trong [LICENSE](<LICENSE>) được giữ nguyên và phải đi cùng các bản sao/phần đáng kể của phần mềm. Việc dịch và đóng gói không xóa bỏ quyền tác giả gốc.

## Hình tượng và tài nguyên

Nhân vật là phiên bản cộng đồng của cá voi DeepSeek, **không phải hình tượng chính thức của DeepSeek**:

- Nguyên mẫu “溟月”: [@上善无形](https://space.bilibili.com/4456176).
- Thiết kế phiên bản hầu gái cá voi DeepSeek: [@ZipZipPipe](https://space.bilibili.com/4168597).
- Điều kiện do dự án gốc dẫn chiếu: **[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)** — ghi công, phi thương mại, chia sẻ tương tự.
- Tuyên bố nguồn: <https://www.bilibili.com/opus/1247156596114456581>.

Không thương mại hóa hình tượng. Khi chia sẻ bản sửa đổi ảnh/tài nguyên, giữ ghi công và cùng điều kiện giấy phép. Các ảnh biểu cảm có chữ Việt là bản phái sinh từ ảnh của dự án gốc; bản quyền hình tượng không chuyển sang người dịch.

Bản Việt hóa caption giữ ghi công các tên trên watermark: **Wan Yuan (晚渊)**, **Suiyue Jinghao (岁月静好)** và **BEAR-177**. Các watermark còn nằm trong ảnh gốc được giữ để ghi công; tên riêng và ký hiệu biểu cảm không phải nhãn giao diện cần dịch. Danh sách 26 meme có caption đã sửa và logo được ghi trong [script tái tạo ảnh](<scripts/localize_meme_captions_vi.py>); một meme không có chữ được giữ nguyên. Phần chữ đè lên artwork được thay bằng bảng caption trong vùng chữ cũ, không thay nhân vật hoặc khóa tài nguyên.

Giấy phép MIT cho mã nguồn **không** đồng nghĩa toàn bộ hình tượng, hình ảnh, hoạt ảnh, video và tài nguyên đều được phép dùng thương mại.

## Thành phần đi kèm

Hai video bong bóng “是啊，吃什么” và “深度思考碎碎念” có caption Việt là bản phái sinh từ cùng mốc nguồn, theo CC BY-NC-SA 4.0. [Script tái tạo video](<scripts/localize_video_captions_vi.py>) kiểm tra đủ 241 khung hình mỗi clip, giữ alpha, thời gian và pixel ngoài vùng caption. Chữ Việt dùng Arial Bold; nền và độ mờ caption được dựng lại trong vùng sửa, không thay chuyển động nhân vật.

Bản Windows kèm Electron/Chromium và các thư viện được bundle theo dự án. Giữ các tệp thông báo giấy phép của Electron/Chromium trong gói phát hành. Phông chữ và thành phần có giấy phép riêng tiếp tục tuân theo giấy phép tương ứng.
