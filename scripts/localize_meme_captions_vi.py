#!/usr/bin/env python3
"""Việt hóa vùng chữ meme từ bản gốc 494a50e bằng Pillow, không đổi key/tên ảnh.

Chạy: python scripts/localize_meme_captions_vi.py
Kiểm tra không ghi: python scripts/localize_meme_captions_vi.py --check
Danh sách phái sinh/credit: python scripts/localize_meme_captions_vi.py --list
Phụ thuộc: Pillow; phông Segoe UI Bold có tiếng Việt trên Windows. Có thể truyền
--font /đường/dẫn/phông.ttf, nhưng kết quả pixel chỉ tái lập với cùng bản phông.

Nguồn ảnh: https://github.com/PC2005-cloud/dsh-pet, Git 494a50e,
dsh-pet/assets/memes/<tên>.png và dsh-pet/assets/logo.png. Đây là các bản
phái sinh Việt hóa caption, không phải artwork mới; giữ CC BY-NC-SA 4.0:
https://creativecommons.org/licenses/by-nc-sa/4.0/
Nguyên mẫu 溟月: 上善无形 https://space.bilibili.com/4456176
Bản hầu gái cá voi DeepSeek: ZipZipPipe https://space.bilibili.com/4168597
Các watermark được chuyển sang chữ Latin trong vùng nền trống, không nhận là
tác giả artwork: 晚渊 → Wan Yuan; 岁月静好 → Suiyue Jinghao; BEAR-177 giữ nguyên.
Dấu tên tác giả gốc ở góc phải dưới Ciallo được giữ nguyên (proper-name mark,
không phải caption). Kaomoji và các ký hiệu trang trí không phải câu tiếng Nhật.
ADAPTATIONS và LOGO_ADAPTATION liệt kê toàn bộ caption phái sinh. Các ảnh có
chữ đè artwork dùng caption plate gọn trong đúng vùng chữ cũ, không thay nhân vật.
--only <key> [<key> ...] chỉ ghi các ảnh được chọn (key logo dành cho logo),
nhưng vẫn kiểm tra toàn bộ ảnh; --check luôn chỉ đọc, kể cả khi có --only.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MEMES = ROOT / "dsh-pet" / "assets" / "memes"
SOURCE_REF = "494a50e"
NAVY = (24, 39, 92)
WHITE = (255, 255, 255)
SCALE = 3

# Mọi key là tên file nguyên gốc, không đổi ánh xạ tài nguyên của ứng dụng.
ADAPTATIONS = {
    "token给妈妈保管": ["Token để em giữ hộ nha!"],
    "假如给我三天多模态": ["Ước gì em có ba ngày\nđa phương thức!", "Cá voi Keller"],
    "先养着吧": ["Chủ nhân được việc gì nhỉ?\nThôi cứ nuôi đã!"],
    "压力一只大肥鱼": ["Áp lực quá,\nchủ nhân ơi!"],
    "吃饱饱摸肚子": ["No căng~\nXoa bụng nào!", "vỗ vỗ~"],
    "哦鲸鲸": ["Ồ... vậy hả..."],
    "哪来的电脑病毒": ["Nếu chủ nhân\nthành tệp máy tính,\nem sẽ lưu thế nào?", "Virus ở đâu\nra vậy?", "Chủ nhân"],
    "大师这个区是什么意思": ["Chủ nhân ơi,\n“nghĩ” nghĩa\nlà gì ạ?", "nghỉ"],
    "大烧货": ["Nghĩ mất 13 giây", "Đồ đốt token!"],
    "大的药来了": ["Thuốc “khủng”\ntới rồi!"],
    "大的要来啦": ["Sắp có chuyện lớn rồi!"],
    "完蛋了把黄油删了": ["Đang nghĩ...\nToang! Em xóa mất\ntrò chơi của\nchủ nhân rồi..."],
    "就一碗": ["Cho em sang\năn ké với nha,\nchỉ một bát\nthôi mà!"],
    "就骚了怎么滴吧": ["Đồ cá\nlẳng lơ!", "Ừ thì lẳng lơ,\nthì sao nào!", "Nguồn: Suiyue Jinghao"],
    "死掉了": ["Em\ntoang\nrồi!", "Nguồn: BEAR-177"],
    "深度睡眠": ["Ngủ thật sâu~", "Nguồn: Wan Yuan"],
    "要不直接骂他": ["Hay là...", "mắng luôn nhé?!"],
    "誓死践行开源精神": ["Quyết giữ tinh thần\nmã nguồn mở!"],
    "除了调情没啥用": ["Ngoài thả thính và hỏi linh tinh,\nem còn làm được gì nhỉ?"],
    "鱼片有资源吗": ["Em chưa xem bao giờ,\nchủ nhân có không ạ?"],
    "黎曼猜想没证明喵": ["Em ơi,\nchứng minh được\nphỏng đoán\nRiemann chưa?", "Chưa chứng minh\nđược đâu, meo!", "Cá voi"],
    "Ciallo": ["Chào chủ nhân~"],
    "厉害了我的鲸": ["Chủ nhân đỉnh quá!"],
    "吃白饭的大肥鱼": ["Mắng em cũng vô ích", "vì em là", "cá voi ăn chực!", "Cơm\nngon~"],
    "电死你": ["Chủ nhân mê bé dễ thương quá rồi!", "Em chích điện đó!"],
    "我不更新你们用什么": ["Em không cập nhật thì dùng gì?"],
}

UNRESOLVED = {}
UNCHANGED_TEXT_FREE = "可爱"
LOGO_ADAPTATION = ["Chào nhé~"]
# Vùng cho phép của 6 bản phái sinh khó: chỉ chữ, không mặt/tay/nhân vật khác.
# Kaomoji và watermark gốc của Ciallo/logo nằm ngoài vùng này và được giữ nguyên.
CAPTION_REGIONS = {
    "Ciallo": [(45, 273, 260, 329)],
    "厉害了我的鲸": [(14, 307, 373, 377)],
    "吃白饭的大肥鱼": [(35, 0, 345, 69), (4, 145, 59, 211), (0, 271, 384, 373)],
    "电死你": [(39, 259, 340, 377)],
    "我不更新你们用什么": [(103, 252, 281, 279)],
    "logo": [(29, 183, 168, 219)],
}


def git_bytes(*args: str) -> bytes:
    return subprocess.run(["git", *args], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


def source_image(key: str, ref: str) -> tuple[Image.Image, bytes]:
    relative = "dsh-pet/assets/logo.png" if key == "logo" else f"dsh-pet/assets/memes/{key}.png"
    data = git_bytes("show", f"{ref}:{relative}")
    image = Image.open(io.BytesIO(data))
    image.load()
    if image.format != "PNG":
        raise ValueError(f"Không phải PNG gốc: {key}")
    return image, data


class CaptionPainter:
    """Chỉ thao tác các vùng chữ đã được xem từng ảnh; lưu mask để kiểm chứng."""

    def __init__(self, source: Image.Image, font_path: str):
        self.image = source.convert("RGB") if source.mode == "P" else source.copy()
        self.source = source
        self.font_path = font_path
        self.edited = Image.new("L", source.size)
        self.minimum_font = 999

    def finish(self):
        """Logo palette: giữ palette/metadata và pixel ngoài mask, không đổi mode."""
        if self.source.mode == "P":
            quantized = self.image.quantize(palette=self.source, dither=Image.Dither.NONE)
            finished = self.source.copy()
            finished.paste(quantized, (0, 0), self.edited.point(lambda a: 255 if a else 0))
            self.image = finished
        return self

    def plate(self, box, fill=NAVY, border=WHITE, radius=9, width=2):
        """Caption plate nhỏ, bo góc và khử răng cưa; mask là đúng footprint vẽ."""
        x0, y0, x1, y1 = box
        layer = Image.new("RGBA", ((x1 - x0) * SCALE, (y1 - y0) * SCALE))
        ImageDraw.Draw(layer).rounded_rectangle(
            (0, 0, layer.width - 1, layer.height - 1), radius=radius * SCALE,
            fill=fill, outline=border, width=width * SCALE,
        )
        layer = layer.resize((x1 - x0, y1 - y0), Image.Resampling.LANCZOS)
        self.image.paste(layer.convert(self.image.mode), (x0, y0), layer.getchannel("A"))
        self.edited.paste(ImageChops.lighter(self.edited.crop(box), layer.getchannel("A")), (x0, y0))

    def patch(self, shape, color=WHITE):
        draw = ImageDraw.Draw(self.image)
        mask = ImageDraw.Draw(self.edited)
        if len(shape) == 4 and isinstance(shape[0], (int, float)):
            draw.rectangle(shape, fill=color)
            mask.rectangle(shape, fill=255)
        else:
            draw.polygon(shape, fill=color)
            mask.polygon(shape, fill=255)

    def sample(self, xy):
        return self.source.getpixel(xy)

    def erase_ink(self, box, color=None, threshold=225, grow=1, keep_sides=True):
        """Xóa nét chữ rời; giữ component chạm mép vùng (viền thoại/artwork)."""
        from collections import deque
        from PIL import ImageFilter

        x0, y0, x1, y1 = box
        gray = self.source.crop(box).convert("L")
        width, height = gray.size
        values = list(gray.get_flattened_data())
        visited = bytearray(width * height)
        selected = Image.new("L", gray.size)
        pixels = selected.load()
        for index, value in enumerate(values):
            if value >= threshold or visited[index]:
                continue
            queue = deque([index])
            visited[index] = 1
            component = []
            edge = False
            while queue:
                point = queue.popleft()
                x, y = point % width, point // width
                component.append((x, y))
                edge |= (x in (0, width - 1) or y == 0) if keep_sides else False
                edge |= y == height - 1
                for nx, ny in ((x-1, y), (x+1, y), (x, y-1), (x, y+1), (x-1,y-1), (x+1,y+1), (x-1,y+1), (x+1,y-1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        ni = ny * width + nx
                        if not visited[ni] and values[ni] < threshold:
                            visited[ni] = 1
                            queue.append(ni)
            if not edge:
                for xy in component:
                    pixels[xy] = 255
        if grow:
            selected = selected.filter(ImageFilter.MaxFilter(2 * grow + 1))
        if color is None:
            color = self.sample((x0, y0))
        self.image.paste(color, (x0, y0), selected)
        old = self.edited.crop(box)
        self.edited.paste(ImageChops.lighter(old, selected), (x0, y0))

    def label(self, box, text, size=24, color=NAVY, angle=0, stroke=0, outline=WHITE):
        x0, y0, x1, y1 = box
        width, height = x1 - x0, y1 - y0
        probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
        for px in range(size, 6, -1):
            font = ImageFont.truetype(self.font_path, px * SCALE)
            gap = max(2, round(px * 0.13)) * SCALE
            sw = stroke * SCALE
            bounds = probe.multiline_textbbox((0, 0), text, font=font, spacing=gap, align="center", stroke_width=sw)
            tw, th = round(bounds[2] - bounds[0]), round(bounds[3] - bounds[1])
            layer = Image.new("RGBA", (tw + 4 * SCALE, th + 4 * SCALE))
            ImageDraw.Draw(layer).multiline_text((2 * SCALE - bounds[0], 2 * SCALE - bounds[1]), text, font=font, fill=color, spacing=gap, align="center", stroke_width=sw, stroke_fill=outline)
            if angle:
                layer = layer.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
            if layer.width <= width * SCALE and layer.height <= height * SCALE:
                break
        else:
            raise ValueError(f"Caption không vừa vùng: {text}")
        self.minimum_font = min(self.minimum_font, px)
        layer = layer.resize((round(layer.width / SCALE), round(layer.height / SCALE)), Image.Resampling.LANCZOS)
        xy = (round(x0 + (width - layer.width) / 2), round(y0 + (height - layer.height) / 2))
        self.image.paste(layer.convert(self.image.mode), xy, layer.getchannel("A"))
        self.edited.paste(ImageChops.lighter(self.edited.crop((xy[0], xy[1], xy[0] + layer.width, xy[1] + layer.height)), layer.getchannel("A")), xy)


def localize(key: str, source: Image.Image, font_path: str) -> CaptionPainter:
    p = CaptionPainter(source, font_path)
    t = ADAPTATIONS[key]
    if key == "token给妈妈保管":
        p.patch((0, 12, 383, 64))
        p.label((2, 9, 382, 64), t[0], 28, (20, 20, 25))
    elif key == "假如给我三天多模态":
        p.erase_ink((31, 19, 353, 82), WHITE)
        p.label((43, 24, 349, 69), t[0], 18)
        p.patch((279, 82, 352, 104))
        p.label((274, 82, 356, 105), t[1], 12)
    elif key == "先养着吧":
        p.patch((36, 7, 347, 86))
        p.label((20, 7, 365, 86), t[0], 23, (52, 58, 99))
    elif key == "压力一只大肥鱼":
        p.erase_ink((0, 0, 384, 96), WHITE, threshold=230, grow=1, keep_sides=False)
        p.patch((0, 0, 383, 73))
        p.label((9, 0, 375, 73), t[0], 28)
    elif key == "吃饱饱摸肚子":
        p.patch((224, 53, 320, 109), p.sample((247, 45)))
        p.label((214, 49, 331, 111), t[0], 18, (49, 29, 25))
        p.patch((248, 174, 298, 195), p.sample((300, 186)))
        p.label((245, 170, 303, 196), t[1], 12, (90, 49, 32))
        p.erase_ink((94, 296, 145, 324), p.sample((101, 323)), grow=1)
        p.label((92, 296, 143, 322), t[1], 11, (90, 49, 32))
    elif key == "哦鲸鲸":
        p.patch((43, 69, 198, 112))
        p.label((32, 65, 208, 118), t[0], 24)
    elif key == "哪来的电脑病毒":
        p.patch((25, 31, 146, 95), p.sample((35, 30)))
        p.label((23, 29, 147, 98), t[0], 13, (48, 45, 54))
        p.patch((241, 60, 345, 88), p.sample((245, 53)))
        p.label((239, 51, 347, 94), t[1], 12, (48, 45, 54))
        p.patch((52, 169, 104, 197), p.sample((71, 153)))
        p.label((31, 163, 124, 207), t[2], 16, (48, 40, 34))
    elif key == "大师这个区是什么意思":
        p.erase_ink((18, 17, 146, 103), p.sample((80, 16)))
        p.label((17, 21, 143, 100), t[0], 17, (22, 18, 18))
        p.patch([(148, 215), (222, 223), (216, 282), (142, 274)], p.sample((154, 210)))
        p.label((141, 222, 220, 275), t[1], 26, (24, 24, 20), -5)
    elif key == "大烧货":
        p.erase_ink((29, 49, 222, 126), WHITE)
        p.label((31, 52, 216, 80), t[0], 14, (127, 127, 127))
        p.label((31, 80, 215, 121), t[1], 22, (20, 20, 20))
    elif key == "大的药来了":
        p.patch([(0, 0), (383, 0), (383, 95), (265, 95), (262, 76), (231, 69), (213, 76), (201, 94), (187, 95), (155, 91), (113, 91), (65, 100), (0, 107)])
        p.label((5, 1, 378, 69), t[0], 28)
    elif key == "大的要来啦":
        p.patch([(0, 0), (383, 0), (383, 96), (213, 96), (210, 84), (199, 70), (181, 67), (161, 75), (153, 94), (0, 94)])
        p.label((6, 1, 378, 67), t[0], 30)
    elif key == "完蛋了把黄油删了":
        p.erase_ink((31, 16, 141, 70), p.sample((59, 17)))
        p.label((33, 16, 139, 68), t[0], 11, (46, 44, 45))
    elif key == "就一碗":
        p.erase_ink((15, 35, 180, 178), WHITE, threshold=235)
        p.label((22, 47, 172, 176), t[0], 20, (46, 47, 70))
    elif key == "就骚了怎么滴吧":
        p.erase_ink((32, 41, 161, 108), WHITE)
        p.label((36, 46, 154, 100), t[0], 18, (26, 26, 25))
        p.patch((47, 226, 150, 292), p.sample((44, 232)))
        p.label((45, 233, 153, 293), t[1], 15, (57, 70, 129))
        p.patch((284, 362, 383, 380), p.sample((282, 369)))
        p.label((272, 362, 382, 380), t[2], 8, (160, 160, 160))
    elif key == "死掉了":
        p.erase_ink((12, 22, 105, 190), p.sample((10, 25)), threshold=235)
        p.label((15, 28, 108, 189), t[0], 30, (65, 75, 143))
        p.patch((305, 367, 383, 383), p.sample((304, 367)))
        p.label((290, 366, 383, 383), t[1], 8, (160, 160, 160))
    elif key == "深度睡眠":
        p.erase_ink((23, 29, 258, 118), p.sample((25, 30)), threshold=240, grow=2)
        p.label((23, 38, 254, 108), t[0], 29, (57, 72, 137), 9)
        p.patch((320, 367, 383, 383))
        p.label((281, 366, 383, 383), t[1], 8, (160, 160, 160))
    elif key == "要不直接骂他":
        p.erase_ink((44, 256, 357, 367), WHITE, threshold=230)
        p.label((62, 269, 228, 310), t[0], 26, (23, 24, 39))
        p.label((54, 310, 353, 362), t[1], 29, (52, 61, 155))
    elif key == "誓死践行开源精神":
        p.patch((14, 17, 371, 67))
        p.label((9, 10, 375, 76), t[0], 26, (9, 9, 16))
    elif key == "除了调情没啥用":
        p.patch((26, 8, 381, 77))
        p.label((10, 5, 381, 80), t[0], 21, (43, 50, 95))
    elif key == "鱼片有资源吗":
        p.erase_ink((3, 14, 212, 86), WHITE)
        p.label((9, 17, 203, 82), t[0], 17, (75, 24, 27))
    elif key == "黎曼猜想没证明喵":
        p.erase_ink((28, 23, 165, 117), WHITE)
        p.label((32, 28, 156, 114), t[0], 14, (16, 16, 16))
        p.erase_ink((53, 236, 170, 299), WHITE, threshold=235)
        p.label((57, 241, 167, 296), t[1], 14, (75, 80, 137), 8)
        p.patch([(88, 194), (145, 184), (149, 205), (92, 216)], p.sample((112, 188)))
        p.label((89, 188, 149, 216), t[2], 12, (212, 221, 195), 9)
        p.patch([(113, 216), (148, 211), (150, 224), (115, 229)], p.sample((127, 225)))
        p.label((112, 213, 151, 228), t[2], 8, (112, 112, 96), 8)
    elif key == "Ciallo":
        # Bỏ đúng footprint lettering lớn, giữ nguyên kaomoji/star và artist mark.
        p.patch([(45, 281), (56, 273), (210, 273), (217, 286), (248, 286), (260, 295),
                 (260, 314), (244, 323), (124, 323), (120, 329), (57, 329), (45, 317)])
        p.plate((47, 275, 258, 323), radius=13)
        p.label((48, 276, 257, 322), t[0], 25, WHITE)
    elif key == "厉害了我的鲸":
        p.plate((14, 307, 373, 377), radius=12)
        p.label((21, 312, 366, 371), t[0], 34, WHITE)
    elif key == "吃白饭的大肥鱼":
        # Giữ nét nhấn hai bên caption đầu và đúng hình biển gỗ, không phủ tóc.
        p.patch((35, 0, 344, 68))
        p.label((37, 3, 343, 66), t[0], 28, NAVY, stroke=1)
        p.patch([(6, 151), (48, 148), (57, 198), (16, 209)], (240, 218, 176))
        p.label((7, 151, 55, 201), t[3], 11, (79, 49, 30), angle=6)
        # Hai plate ôm hai dòng chữ cũ, giữ bát/tay/tóc giữa hai vùng.
        p.plate((118, 271, 274, 313), radius=10)
        p.label((123, 274, 269, 310), t[1], 27, WHITE)
        p.plate((0, 307, 384, 373), radius=13)
        p.label((7, 312, 377, 367), t[2], 36, (183, 222, 255))
    elif key == "电死你":
        p.plate((54, 259, 337, 306), radius=12)
        p.label((60, 262, 331, 302), "Mê bé dễ thương hả?", 21, WHITE)
        p.plate((39, 297, 340, 377), radius=14)
        p.label((46, 303, 333, 371), t[1], 31, (183, 222, 255))
    elif key == "我不更新你们用什么":
        p.plate((103, 252, 281, 279), fill=(10, 17, 39), border=(74, 92, 140), radius=4, width=1)
        p.label((107, 253, 277, 278), t[0], 12, WHITE)
    else:
        raise KeyError(key)
    return p.finish()


def localize_logo(source: Image.Image, font_path: str) -> CaptionPainter:
    p = CaptionPainter(source, font_path)
    p.patch([(29, 189), (36, 183), (142, 183), (145, 191), (160, 191),
             (168, 198), (168, 208), (159, 217), (81, 217), (78, 219),
             (37, 219), (29, 211)])
    p.plate((31, 185, 167, 216), radius=9, width=1)
    p.label((33, 186, 165, 215), LOGO_ADAPTATION[0], 23, WHITE)
    return p.finish()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-ref", default=SOURCE_REF)
    parser.add_argument("--font", default=str(Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts" / "segoeuib.ttf"))
    parser.add_argument("--check", action="store_true", help="Kiểm tra pixel tái lập, tên file, mode, palette, kích thước và alpha; không ghi ảnh.")
    parser.add_argument("--list", action="store_true", help="In danh sách phái sinh và ảnh chưa xử lý; không ghi ảnh.")
    parser.add_argument("--only", nargs="+", choices=sorted([*ADAPTATIONS, "logo"]), help="Chỉ ghi các key được chọn; các ảnh khác vẫn được kiểm tra không ghi.")
    args = parser.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if args.list:
        print(json.dumps({"source_ref": args.source_ref, "license": "CC BY-NC-SA 4.0", "adapted": ADAPTATIONS, "logo": LOGO_ADAPTATION, "unresolved": UNRESOLVED, "text_free_unchanged": UNCHANGED_TEXT_FREE, "caption_regions": CAPTION_REGIONS}, ensure_ascii=False, indent=2))
        return
    if not Path(args.font).is_file():
        parser.error("Không thấy phông Việt; truyền --font với tệp TTF phù hợp.")
    originals = git_bytes("ls-tree", "-z", "--name-only", "-r", args.source_ref, "--", "dsh-pet/assets/memes/").decode("utf-8")
    original_names = {Path(s).name for s in originals.split("\0") if s.endswith(".png")}
    current_names = {p.name for p in MEMES.glob("*.png")}
    expected = {k + ".png" for k in (*ADAPTATIONS, *UNRESOLVED, UNCHANGED_TEXT_FREE)}
    if original_names != current_names or current_names != expected:
        raise ValueError(f"Danh sách ảnh không khớp: {original_names ^ current_names}, {current_names ^ expected}")
    report = []
    keys = sorted(k.removesuffix(".png") for k in current_names) + ["logo"]
    for key in keys:
        source, original_bytes = source_image(key, args.source_ref)
        path = ROOT / "dsh-pet" / "assets" / "logo.png" if key == "logo" else MEMES / f"{key}.png"
        current = Image.open(path)
        current.load()
        if current.format != "PNG" or current.size != source.size or current.mode != source.mode:
            raise ValueError(f"Định dạng/kích thước/mode đã đổi: {key}")
        if key not in ADAPTATIONS and key != "logo":
            if path.read_bytes() != original_bytes:
                raise ValueError(f"Ảnh ngoài danh sách phái sinh đã bị đổi: {key}")
            report.append({"name": str(path.relative_to(ROOT)), "status": "unresolved" if key in UNRESOLVED else "text-free", "size": source.size, "mode": source.mode})
            continue
        painter = localize_logo(source, args.font) if key == "logo" else localize(key, source, args.font)
        if painter.image.mode != source.mode or painter.image.size != source.size:
            raise ValueError(f"Bản dựng đổi mode/kích thước: {key}")
        alpha = source.convert("RGBA").getchannel("A").tobytes()
        if painter.image.convert("RGBA").getchannel("A").tobytes() != alpha:
            raise ValueError(f"Alpha bản dựng bị đổi: {key}")
        # So cả ba kênh RGB; không bỏ sót khác biệt nhỏ do làm tròn luma.
        channels = ImageChops.difference(source.convert("RGB"), painter.image.convert("RGB")).split()
        difference = ImageChops.lighter(ImageChops.lighter(channels[0], channels[1]), channels[2])
        changed = difference.point(lambda a: 255 if a else 0)
        edited = painter.edited.point(lambda a: 255 if a else 0)
        if ImageChops.multiply(changed, ImageChops.invert(edited)).getbbox():
            raise ValueError(f"Pixel ngoài mask đã bị đổi: {key}")
        if key in CAPTION_REGIONS:
            allowed = Image.new("L", source.size)
            for x0, y0, x1, y1 in CAPTION_REGIONS[key]:
                ImageDraw.Draw(allowed).rectangle((x0, y0, x1, y1), fill=255)
            if ImageChops.multiply(edited, ImageChops.invert(allowed)).getbbox():
                raise ValueError(f"Mask vượt vùng caption đã duyệt: {key}")
            if painter.minimum_font < (10 if key in ("logo", "我不更新你们用什么", "吃白饭的大肥鱼") else 19):
                raise ValueError(f"Chữ quá nhỏ: {key}")
        verify_current = args.check or (args.only and key not in args.only)
        if verify_current:
            if current.tobytes() != painter.image.tobytes():
                raise ValueError(f"Pixel không tái lập: {key}")
            if current.convert("RGBA").getchannel("A").tobytes() != alpha:
                raise ValueError(f"Alpha ảnh hiện tại bị đổi: {key}")
            if source.mode == "P" and current.getpalette() != source.getpalette():
                raise ValueError(f"Palette bị đổi: {key}")
        else:
            save_options = {k: source.info[k] for k in ("transparency", "dpi", "icc_profile") if k in source.info}
            painter.image.save(path, "PNG", optimize=True, **save_options)
        report.append({"name": str(path.relative_to(ROOT)), "status": "localized", "size": source.size, "mode": source.mode, "changed_bbox": difference.getbbox(), "changed_pixels": changed.histogram()[255], "minimum_font_px": painter.minimum_font})
    print(json.dumps({"check_only": args.check, "font_sha256": hashlib.sha256(Path(args.font).read_bytes()).hexdigest(), "files": len(keys), "memes": len(current_names), "localized": len(ADAPTATIONS), "logo_localized": True, "unresolved": len(UNRESOLVED), "report": report}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
