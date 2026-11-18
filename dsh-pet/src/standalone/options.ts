/**
 * 独立模式的命令行解析与路径推导，纯逻辑、零 I/O。
 *
 * 负责把 argv 变成选项，并镜像宿主半侧推导出的配置路径；不读文件、不建目录。
 * 路径口径以宿主半侧为准，这里只是只读镜像，测试会钉住两者一致。
 * 必须始终成立：--check 不 apply 也能算出 DSH 会读的配置路径。
 * @module dsh-pet/src/standalone/options
 */
import { join } from 'node:path';

import type { ConfigPaths } from '../host/config.ts';
import { DEFAULT_STANDALONE_PORT } from './server.ts';

/** 解析后的命令行选项。 */
export interface CliOptions {
  port: number;
  check: boolean;
  help: boolean;
}

/** --help 正文。 */
export const USAGE = `dsh-pet chế độ độc lập (không cần DSH)

Cách dùng: dsh-pet-standalone [tùy chọn]

Tùy chọn:
  --port <cổng>   Cổng lắng nghe (mặc định ${DEFAULT_STANDALONE_PORT}; bị chiếm thì tự lùi sang cổng kế tiếp)
  --check         Chỉ kiểm tra: in nguồn cấu hình, danh sách pet và trạng thái Electron, không mở cửa sổ
  -h, --help      Hiện trợ giúp này

Ghi chú:
  Ở chế độ độc lập, pet chạy trong "cửa sổ nhỏ trong suốt luôn nằm trên cùng"; lớp phủ trong trình duyệt cần trang web DSH, chế độ độc lập không có.
  Trò chuyện và lẩm bẩm có thể bật sau khi cấu hình API ở trang cài đặt AI trên máy; chưa cấu hình thì không gửi yêu cầu tới mô hình.
  Số dư / trạng thái làm việc của phiên DSH / thông báo hệ thống vẫn cần DSH.
`;

/**
 * 解析 argv。
 * @param argv - 已去掉 node 与脚本路径的参数。
 * @returns 选项，或带 error 的失败结果，由调用方打印用法并以 2 退出。
 */
export function parseArgs(argv: string[]): { options: CliOptions } | { error: string } {
  const options: CliOptions = { port: DEFAULT_STANDALONE_PORT, check: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] ?? '';
    if (arg === '--check') {
      options.check = true;
    } else if (arg === '-h' || arg === '--help') {
      options.help = true;
    } else if (arg === '--port' || arg.startsWith('--port=')) {
      const raw = arg === '--port' ? String(argv[index + 1] ?? '') : arg.slice('--port='.length);
      if (arg === '--port') index += 1;
      const value = Number(raw);
      if (!Number.isInteger(value) || value < 1 || value > 65535) {
        return { error: `--port cần một cổng là số nguyên 1..65535, nhận được ${JSON.stringify(raw)}` };
      }
      options.port = value;
    } else {
      return { error: `Tham số không xác định: ${arg}` };
    }
  }
  return { options };
}

/**
 * 推导配置路径集（宿主半侧那份推导的只读镜像）。
 * @param root - 插件包根目录。
 * @param home - DSH_HOME。
 * @returns 与宿主半侧一致的路径集。
 */
export function configPathsFor(root: string, home: string): ConfigPaths {
  const userRoot = join(home, 'dsh-pet');
  return {
    defaultFile: join(root, 'assets', 'config.jsonc'),
    userFile: join(userRoot, 'main-config.jsonc'),
    legacyUserFile: join(userRoot, 'main-config.json'),
    petDir: join(userRoot, 'pet'),
  };
}

/** 宠物列表的展示串：display 原样打印，供用户确认。 */
export function describePets(pets: Record<string, unknown>[]): string {
  if (pets.length === 0) return '(không có pet: pets trong cấu hình đang trống)';
  return pets
    .map((pet) => `${String(pet.id ?? '?')}(size=${String(pet.size ?? '?')}, display=${String(pet.display ?? '?')})`)
    .join('  ');
}

/**
 * 判断实例是否会出现在桌面（display 含 desktop 或 both），只用于提示。
 * @param pet - 宠物条目。
 * @returns 是否会出现在桌面。
 */
export function isDesktopVisible(pet: Record<string, unknown>): boolean {
  const display = pet.display;
  return display === 'desktop' || display === 'both';
}
