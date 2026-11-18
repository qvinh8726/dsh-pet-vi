"""Việt hóa chữ trong hai video bong bóng từ nguồn Git cố định.

Dùng FFmpeg/libvpx-vp9, NumPy, Pillow và phông Arial Bold có tiếng Việt.
Chỉ sửa dải chữ trong bong bóng; giữ alpha và YUV ngoài vùng sửa nguyên vẹn.
Mặc định ghi bản thử và báo cáo vào Temp; --apply mới thay hai asset đích.
"""
from __future__ import annotations

import argparse
from collections import deque
from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter


SOURCE_REF = "494a50e"
WIDTH, HEIGHT, FRAME_COUNT = 640, 360, 241
FPS = 24
ASSETS = {
    "eat": "是啊，吃什么.webm",
    "think": "深度思考碎碎念.webm",
}
SOURCE_BLOBS = {
    "eat": "e347b7574b4dca0d65bdd34bf9af0a176fbb15a1",
    "think": "5a40d5bfdfa818a1df37cef6405f10cd8b71961c",
}
REGIONS = {
    "eat": [(20, 35, 255, 220), (420, 40, 620, 205)],
    "think": [(95, 50, 240, 140), (370, 43, 501, 128),
              (85, 139, 211, 219), (420, 130, 558, 212)],
}


@dataclass(frozen=True)
class Cue:
    """Mốc khung hình tính từ 0, gồm cả đầu lẫn cuối; vùng theo REGIONS."""

    region: int
    first: int
    last: int
    text: str
    fade_start: int | None = None


CUES = {
    "eat": [Cue(0, 2, 127, "Ăn gì?"),
            Cue(0, 128, 214, "Ăn gì… ăn gì…"),
            Cue(1, 83, 137, "Ừ, ăn gì?"),
            Cue(1, 138, 217, "Ăn gì… ăn gì…")],
    "think": [Cue(0, 54, 181, "Trưa ăn gì…", 173),
              Cue(1, 89, 181, "Buồn ngủ quá…", 173),
              Cue(2, 155, 208, "Chẳng muốn\nnhúc nhích", 198),
              Cue(3, 129, 206, "Chẳng muốn\nnhúc nhích…", 198)],
}


def run(arguments: list[str], data: bytes | None = None) -> bytes:
    """Chạy công cụ và dừng ngay khi lỗi; không che thông báo FFmpeg."""
    return subprocess.run(arguments, input=data, stdout=subprocess.PIPE,
                          check=True).stdout


def probe(ffprobe: str, path: Path) -> dict:
    """Lấy cả số khung hình giải mã thực, không suy ra bằng thời lượng."""
    return json.loads(run([ffprobe, "-v", "error", "-count_frames", "-show_streams",
                           "-show_format", "-of", "json", str(path)]))


def decode(ffmpeg: str, source: Path, pixel_format: str) -> bytes:
    """Ép libvpx: bộ giải mã VP9 mặc định có thể bỏ phần alpha WebM."""
    return run([ffmpeg, "-v", "error", "-c:v", "libvpx-vp9", "-i", str(source),
                "-f", "rawvideo", "-pix_fmt", pixel_format, "-"])


def largest_component(mask: np.ndarray) -> np.ndarray:
    """Tách nền xám bong bóng khỏi các phần rời của tóc và viền nhân vật."""
    remaining = mask.copy()
    best: list[tuple[int, int]] = []
    while remaining.any():
        ys, xs = np.where(remaining)
        start = int(ys[0]), int(xs[0])
        queue = deque([start])
        remaining[start] = False
        points = []
        while queue:
            y, x = queue.popleft()
            points.append((y, x))
            for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if (0 <= yy < remaining.shape[0] and
                        0 <= xx < remaining.shape[1] and remaining[yy, xx]):
                    remaining[yy, xx] = False
                    queue.append((yy, xx))
        if len(points) > len(best):
            best = points
    return np.asarray(best)


def bubble_box(frame: np.ndarray, region: tuple, faded: bool) -> tuple:
    """Theo dõi đúng nền bong bóng hiện tại; không dùng hộp che cố định."""
    x0, y0, x1, y1 = region
    crop = frame[y0:y1, x0:x1].astype(np.int16)
    rgb = crop[..., :3]
    threshold = 108 if faded else 143
    mask = ((rgb.min(2) > threshold) &
            (rgb.max(2) - rgb.min(2) < 35) & (crop[..., 3] > 100))
    points = largest_component(mask)
    if len(points) < 350:
        raise ValueError(f"Không định vị được nền bong bóng tại {region}")
    ys, xs = points[:, 0], points[:, 1]
    return (int(xs.min()) + x0, int(ys.min()) + y0,
            int(xs.max()) + x0 + 1, int(ys.max()) + y0 + 1)


def fit_text(text: str, font_path: Path, width: int, height: int) -> Image.Image:
    """Vẽ ở độ phân giải 4× để dấu tiếng Việt không răng cưa khi thu nhỏ."""
    scale = 4
    for size in range(112, 23, -1):
        font = ImageFont.truetype(str(font_path), size)
        layout = ImageDraw.Draw(Image.new("L", (1, 1)))
        bbox = layout.multiline_textbbox((0, 0), text, font=font, spacing=3 * scale,
                                        align="center")
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        if tw <= width * scale and th <= height * scale:
            layer = Image.new("L", (width * scale, height * scale))
            draw = ImageDraw.Draw(layer)
            draw.multiline_text(((width * scale - tw) / 2 - bbox[0],
                                 (height * scale - th) / 2 - bbox[1]), text,
                                font=font, spacing=3 * scale, align="center", fill=255)
            return layer.resize((width, height), Image.Resampling.LANCZOS)
    raise ValueError(f"Không đủ vùng vẽ tiếng Việt: {text!r}")


def caption_geometry(key: str, region: int, n: int, box: tuple) -> tuple:
    """Giới hạn dải chữ theo hình dạng thân bong bóng, không gồm đuôi."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    if key == "eat":
        center_y = y0 + h * (0.47 if region == 0 and 192 <= n <= 207 else 0.52)
        erase = (round(x0 + w * 0.07), round(center_y - h * 0.20),
                 round(x1 - w * 0.07), round(center_y + h * 0.20))
        text_box = (round(x0 + w * 0.10), round(center_y - h * 0.125),
                    round(x1 - w * 0.10), round(center_y + h * 0.125))
    else:
        center_y = y0 + h * 0.405
        erase = (round(x0 + w * 0.07), round(center_y - h * 0.20),
                 round(x1 - w * 0.07), round(center_y + h * 0.20))
        if region < 2:
            text_box = (round(x0 + w * 0.11), round(center_y - h * 0.16),
                        round(x1 - w * 0.11), round(center_y + h * 0.16))
        else:
            text_box = (round(x0 + w * 0.12), round(center_y - h * 0.245),
                        round(x1 - w * 0.12), round(center_y + h * 0.245))
    return erase, text_box


def restore_band(frame: np.ndarray, rect: tuple) -> np.ndarray:
    """Xóa nét chữ tối, giữ điểm sáng bong bóng; không sửa alpha nguồn."""
    x0, y0, x1, y1 = rect
    inset = (x1 - x0) // 5
    top = np.median(frame[y0 - 3:y0, x0 + inset:x1 - inset, :3], axis=(0, 1))
    bottom = np.median(frame[y1:y1 + 3, x0 + inset:x1 - inset, :3], axis=(0, 1))
    factors = np.linspace(0, 1, y1 - y0 + 2)[1:-1, None, None]
    fill = np.broadcast_to(top * (1 - factors) + bottom * factors,
                           (y1 - y0, x1 - x0, 3))
    target = frame[y0:y1, x0:x1, :3]
    ink = target.mean(axis=2) < fill.mean(axis=2) - 5
    ink = np.asarray(Image.fromarray(ink.astype(np.uint8) * 255)
                     .filter(ImageFilter.MaxFilter(3))) > 0
    target[ink] = np.rint(fill[ink]).astype(np.uint8)
    return ink


def localize(key: str, frames: np.ndarray, font: Path) -> tuple:
    """Thay từng cue, trả mặt nạ sửa để bảo toàn dữ liệu ngoài vùng chữ."""
    result = frames.copy()
    edit_masks = np.zeros(frames.shape[:3], dtype=bool)
    records = []
    for cue in CUES[key]:
        last_box = None
        for n in range(cue.first, cue.last + 1):
            fading = cue.fade_start is not None and n >= cue.fade_start
            if fading:
                box = last_box
            else:
                box = bubble_box(frames[n], REGIONS[key][cue.region], False)
                last_box = box
            if box is None:
                raise ValueError("Thiếu vùng tham chiếu trước khi tan chữ")
            erase, text_box = caption_geometry(key, cue.region, n, box)
            x0, y0, x1, y1 = erase
            edit_masks[n, y0:y1, x0:x1] |= restore_band(result[n], erase)
            tx0, ty0, tx1, ty1 = text_box
            text_mask = np.asarray(fit_text(cue.text, font, tx1 - tx0, ty1 - ty0))
            opacity = 1.0
            if fading:
                opacity = max(0.0, (cue.last + 1 - n) / (cue.last + 1 - cue.fade_start))
            strength = text_mask[..., None].astype(np.float32) / 255 * opacity
            target = result[n, ty0:ty1, tx0:tx1, :3].astype(np.float32)
            color = np.array((105, 117, 113), dtype=np.float32)
            result[n, ty0:ty1, tx0:tx1, :3] = np.rint(
                target * (1 - strength) + color * strength).astype(np.uint8)
            edit_masks[n, ty0:ty1, tx0:tx1] |= text_mask > 0
            records.append({"frame": n, "region": cue.region,
                            "bubble": box, "erase": erase, "text_box": text_box})
    assert np.array_equal(result[..., 3], frames[..., 3])
    assert np.array_equal(result[~edit_masks], frames[~edit_masks])
    return result, edit_masks, records


def merge_yuv(source: bytes, converted: bytes, masks: np.ndarray) -> bytes:
    """Giữ YUV và alpha nguồn ngoài mask; mã hóa lossless không đổi nhân vật."""
    y_size = WIDTH * HEIGHT
    uv_size = y_size // 4
    stride = y_size * 2 + uv_size * 2
    original = np.frombuffer(source, dtype=np.uint8).reshape(FRAME_COUNT, stride)
    rendered = np.frombuffer(converted, dtype=np.uint8).reshape(FRAME_COUNT, stride)
    merged = original.copy()
    y = merged[:, :y_size].reshape(FRAME_COUNT, HEIGHT, WIDTH)
    new_y = rendered[:, :y_size].reshape(y.shape)
    y[masks] = new_y[masks]
    source_y = original[:, :y_size].reshape(y.shape)
    assert np.array_equal(y[~masks], source_y[~masks])
    chroma_masks = masks.reshape(FRAME_COUNT, HEIGHT // 2, 2,
                                WIDTH // 2, 2).any(axis=(2, 4))
    for offset in (y_size, y_size + uv_size):
        plane = merged[:, offset:offset + uv_size].reshape(FRAME_COUNT, HEIGHT // 2, WIDTH // 2)
        new_plane = rendered[:, offset:offset + uv_size].reshape(plane.shape)
        plane[chroma_masks] = new_plane[chroma_masks]
        source_plane = original[:, offset:offset + uv_size].reshape(plane.shape)
        assert np.array_equal(plane[~chroma_masks], source_plane[~chroma_masks])
    assert np.array_equal(merged[:, y_size + uv_size * 2:],
                          original[:, y_size + uv_size * 2:])
    return merged.tobytes()


def save_evidence(key: str, frames: np.ndarray, work: Path, suffix: str) -> None:
    """Lưu mẫu gốc 640×360 và chuỗi dày để kiểm tra chữ bằng mắt."""
    out = work / f"{key}-{suffix}-frames"
    out.mkdir(exist_ok=True)
    for n, frame in enumerate(frames):
        Image.fromarray(frame).save(out / f"{n:03}.png")
    for start in (0, 120):
        indices = list(range(start, min(start + 120, FRAME_COUNT), 6))
        if start == 120:
            indices.append(240)
        sheet = Image.new("RGB", (640 * 4, 386 * ((len(indices) + 3) // 4)), "#181818")
        draw = ImageDraw.Draw(sheet)
        for i, n in enumerate(indices):
            image = Image.fromarray(frames[n])
            background = Image.new("RGBA", image.size, (24, 24, 24, 255))
            background.alpha_composite(image)
            x, y = i % 4 * 640, i // 4 * 386
            sheet.paste(background.convert("RGB"), (x, y + 26))
            draw.text((x + 8, y + 5), f"{n} / {n / FPS:.3f} s", fill="white")
        sheet.save(work / f"{key}-{suffix}-sequence-{start}.jpg", quality=95)


def process(key: str, args: argparse.Namespace, tools: tuple[str, str]) -> dict:
    """Lấy nguồn bất biến, xuất thử, kiểm chứng rồi mới áp dụng nếu được chọn."""
    ffmpeg, ffprobe = tools
    asset = Path("dsh-pet/assets/webm") / ASSETS[key]
    source = args.work_dir / f"{key}-source.webm"
    blob = run(["git", "rev-parse", f"{SOURCE_REF}:{asset.as_posix()}"], None).decode().strip()
    if blob != SOURCE_BLOBS[key]:
        raise ValueError(f"Blob nguồn không khớp: {key} {blob}")
    source.write_bytes(run(["git", "show", f"{SOURCE_REF}:{asset.as_posix()}"]))
    metadata = probe(ffprobe, source)
    stream = metadata["streams"][0]
    color_args = []
    for field, option in (("color_space", "-colorspace"), ("color_range", "-color_range"),
                          ("color_transfer", "-color_trc"), ("color_primaries", "-color_primaries")):
        if field in stream:
            color_args.extend((option, stream[field]))
    # FFmpeg uses BT.601 when an SD source leaves its matrix unspecified.
    matrix = stream.get("color_space", "bt601")
    assert stream.get("color_range", "tv") == "tv"
    assert (stream["width"], stream["height"], stream["avg_frame_rate"],
            stream["nb_read_frames"]) == (WIDTH, HEIGHT, "24/1", str(FRAME_COUNT))
    raw_source = decode(ffmpeg, source, "yuva420p")
    source_frames = np.frombuffer(decode(ffmpeg, source, "rgba"), dtype=np.uint8).reshape(
        FRAME_COUNT, HEIGHT, WIDTH, 4)
    localized, masks, records = localize(key, source_frames, args.font)
    (args.work_dir / f"{key}-masks.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    conversion = run([ffmpeg, "-v", "error", "-f", "rawvideo", "-pixel_format", "rgba",
                      "-video_size", "640x360", "-framerate", "24", "-i", "-",
                      "-vf", f"scale=out_color_matrix={matrix}:out_range=tv",
                      "-f", "rawvideo", "-pix_fmt", "yuva420p", "-"], localized.tobytes())
    merged = merge_yuv(raw_source, conversion, masks)
    output = args.work_dir / f"{key}-vi.webm"
    run([ffmpeg, "-v", "error", "-y", "-f", "rawvideo", "-pixel_format", "yuva420p",
         "-video_size", "640x360", "-framerate", "24", *color_args, "-i", "-", "-an",
         "-c:v", "libvpx-vp9", "-lossless", "1", "-pix_fmt", "yuva420p",
         "-auto-alt-ref", "0", "-row-mt", "1", "-threads", "4", "-deadline", "good",
         "-cpu-used", "2", *color_args, "-map_metadata", "-1", str(output)], merged)
    actual_raw = decode(ffmpeg, output, "yuva420p")
    assert actual_raw == merged, "Mã hóa phải giữ nguyên YUVA đã chuẩn bị"
    result_metadata = probe(ffprobe, output)
    after_stream = result_metadata["streams"][0]
    for field in ("width", "height", "r_frame_rate", "avg_frame_rate", "time_base",
                  "start_time", "nb_read_frames"):
        assert stream[field] == after_stream[field], field
    assert metadata["format"]["duration"] == result_metadata["format"]["duration"]
    for field in ("color_space", "color_range", "color_transfer", "color_primaries"):
        assert stream.get(field) == after_stream.get(field), field
    assert after_stream["tags"]["alpha_mode"] == "1"
    actual_frames = np.frombuffer(decode(ffmpeg, output, "rgba"), dtype=np.uint8).reshape(
        FRAME_COUNT, HEIGHT, WIDTH, 4)
    assert np.array_equal(source_frames[..., 3], actual_frames[..., 3])
    # A changed 4:2:0 sample covers its complete 2x2 luma cell. FFmpeg's
    # default bicubic chroma reconstruction can reach a further three pixels.
    # Derive this footprint from the written chroma cells, not the observed diff.
    chroma_cells = masks.reshape(FRAME_COUNT, HEIGHT // 2, 2,
                                WIDTH // 2, 2).any(axis=(2, 4))
    footprint = chroma_cells.repeat(2, axis=1).repeat(2, axis=2)
    outside_changed = 0
    outside_max = 0
    original_guard_changed = 0
    for n in range(FRAME_COUNT):
        safe = np.asarray(Image.fromarray(footprint[n].astype(np.uint8) * 255)
                          .filter(ImageFilter.MaxFilter(7))) == 0
        old_safe = np.asarray(Image.fromarray(masks[n].astype(np.uint8) * 255)
                              .filter(ImageFilter.MaxFilter(5))) == 0
        delta = np.abs(source_frames[n].astype(np.int16) -
                       actual_frames[n].astype(np.int16)).max(axis=2)
        original_guard_changed += int(np.count_nonzero(delta[old_safe]))
        outside_changed += int(np.count_nonzero(delta[safe]))
        outside_max = max(outside_max, int(delta[safe].max()))
    print(f"{key}: old 2px guard differences={original_guard_changed}; "
          f"chroma footprint outside pixels={outside_changed}, max={outside_max}", flush=True)
    assert outside_changed == 0, "Có thay đổi ngoài vùng chữ và nội suy chroma"
    assert original_guard_changed == 0, "Có thay đổi ngoài mask chữ cộng biên 2px"
    save_evidence(key, actual_frames, args.work_dir, "vi")
    report = {"asset": asset.as_posix(), "source_ref": SOURCE_REF, "source_blob": blob,
              "width": WIDTH, "height": HEIGHT, "frames": FRAME_COUNT, "fps": "24/1",
              "duration_seconds": result_metadata["format"]["duration"],
              "probe_pixel_format": after_stream["pix_fmt"],
              "decoder_pixel_format": "yuva420p", "alpha_mode": 1,
              "alpha_exact": True, "alpha_min": int(actual_frames[..., 3].min()),
              "alpha_max": int(actual_frames[..., 3].max()),
              "outside_mask_yuv_exact": True, "outside_mask_rgba_exact": True,
               "encoded_yuva_exact": True,
               "source_color_space": stream.get("color_space", "unspecified"),
               "source_color_range": stream.get("color_range", "unspecified"),
               "rgba_validation_footprint": "edited 2x2 chroma cells plus 3px bicubic support",
               "outside_footprint_changed_pixels": outside_changed,
               "outside_footprint_max_rgba_delta": outside_max,
               "outside_original_2px_guard_changed_pixels": original_guard_changed,
              "max_edited_frame_percent": float(masks.sum((1, 2)).max() / (WIDTH * HEIGHT) * 100),
              "output_bytes": output.stat().st_size,
              "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
              "captions": [dict(region=c.region, first_frame=c.first, last_frame=c.last,
                                 first_seconds=c.first / FPS, end_seconds=(c.last + 1) / FPS,
                                 text=c.text) for c in CUES[key]]}
    return report


def main() -> None:
    """Chỉ --apply ghi vào hai asset; phần kiểm chứng luôn nằm ngoài repo."""
    parser = argparse.ArgumentParser(description="Việt hóa chữ trong hai video, giữ nguyên alpha và chuyển động.")
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--work-dir", type=Path,
                        default=Path(tempfile.gettempdir()) / "dsh-pet-vi-video")
    parser.add_argument("--font", type=Path, default=Path("C:/Windows/Fonts/arialbd.ttf"))
    parser.add_argument("--ffmpeg", default=shutil.which("ffmpeg"))
    parser.add_argument("--ffprobe", default=shutil.which("ffprobe"))
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if not args.ffmpeg or not args.ffprobe or not args.font.is_file():
        parser.error("Cần FFmpeg, ffprobe, phông chữ hỗ trợ tiếng Việt (không tự cài phụ thuộc).")
    args.work_dir = args.work_dir.resolve()
    args.repo = args.repo.resolve()
    if args.work_dir.is_relative_to(args.repo):
        parser.error("Thư mục bằng chứng phải nằm ngoài repo để không sinh file theo dõi tạm.")
    args.work_dir.mkdir(parents=True, exist_ok=True)
    import os
    os.chdir(args.repo)
    reports = [process(key, args, (args.ffmpeg, args.ffprobe)) for key in ASSETS]
    (args.work_dir / "validation.json").write_text(
        json.dumps(reports, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.apply:
        # Neither target is replaced until both renders pass every check.
        for key, report in zip(ASSETS, reports):
            asset = args.repo / report["asset"]
            output = args.work_dir / f"{key}-vi.webm"
            backup = args.work_dir / f"{key}-before-apply.webm"
            if not backup.exists():
                shutil.copy2(asset, backup)
            shutil.copy2(output, asset)
            assert hashlib.sha256(asset.read_bytes()).hexdigest() == report["sha256"]
    print(json.dumps(reports, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
