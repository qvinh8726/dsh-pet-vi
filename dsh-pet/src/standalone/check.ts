/**
 * 独立模式体检：只读取配置与 Electron 解析结果并打印报告。
 *
 * 不启动宿主、不建窗口、不发网络请求，因此不会掩盖桌宠没出现的现场。
 * 依赖插件自己的纯模块，与运行时读的是同一份配置和同一套解析规则。
 * 必须始终成立：报告只描述事实，缺包内默认配置时以非零码退出。
 * @module dsh-pet/src/standalone/check
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { flattenPetList, readAllConfig } from '../host/config.ts';
import {
  dshHomeDir,
  electronLandingDir,
  hasGraphicalDisplay,
  packageRoot,
  resolveElectronPath,
} from '../host/helper-process.ts';
import type { StandaloneLogger } from './context.ts';
import { configPathsFor, describePets, isDesktopVisible } from './options.ts';

/** 读包版本，读不到时返回 unknown。 */
export function packageVersion(root: string): string {
  try {
    const parsed = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version?: unknown };
    return typeof parsed.version === 'string' ? parsed.version : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * 打印体检报告。
 * @param logger - 输出目标。
 * @returns 进程退出码：0 表示就绪，1 表示缺包内默认配置或配置读不出来。
 */
export function runCheck(logger: StandaloneLogger): number {
  const home = dshHomeDir();
  const paths = configPathsFor(packageRoot, home);
  const electron = resolveElectronPath();
  const lines: string[] = [
    `Node                ${process.version} (${process.platform}-${process.arch})`,
    `Plugin              dsh-pet@${packageVersion(packageRoot)}  ${packageRoot}`,
    `DSH_HOME            ${home}`,
    `Cấu hình người dùng ${paths.userFile}${existsSync(paths.userFile) ? '' : ' (không tồn tại → dùng mặc định trong gói)'}`,
    `Thư mục pet file    ${paths.petDir}${existsSync(paths.petDir) ? '' : ' (không tồn tại)'}`,
    `Cấu hình mặc định   ${paths.defaultFile}${existsSync(paths.defaultFile) ? '' : '  ✗ thiếu'}`,
    `Electron            ${electron ?? `chưa tìm thấy (lần chạy đầu sẽ tải về ${electronLandingDir()})`}`,
    `Màn hình đồ họa     ${hasGraphicalDisplay() ? 'có' : 'không (sẽ bỏ qua cửa sổ desktop; remote desktop/Xvfb có thể đặt DSH_PET_DESKTOP_FORCE=1)'}`,
  ];

  const fail = (message: string): number => {
    // 先打完整报告再报错，读者能一次看到全部环境信息。
    for (const line of lines) logger.info(line);
    logger.error(message);
    return 1;
  };

  if (!existsSync(paths.defaultFile)) {
    // 直接跑源码时包根会指向 src/，这里提示改用构建产物。
    return fail(
      'Không đọc được cấu hình mặc định trong gói: rất có thể bạn đang **chạy thẳng mã nguồn** (gốc gói bị hiểu thành src/). ' +
        'Chế độ độc lập hãy dùng bản build: chạy npm run bundle rồi node lib/standalone.js, hoặc npm run standalone.',
    );
  }

  try {
    const merged = readAllConfig(paths);
    const entries = Object.keys(merged);
    lines.push(`Mục cấu hình        ${entries.length} mục: ${entries.join(', ') || '(trống)'}`);
    for (const entry of entries) {
      // 按条目汇总宠物数与 idle 动画数，便于发现空配置。
      const conf = merged[entry] ?? {};
      const pets = Array.isArray(conf.pets) ? (conf.pets as Record<string, unknown>[]) : [];
      const animations = conf.animations as { idle?: unknown[] } | undefined;
      const idle = Array.isArray(animations?.idle) ? animations.idle.length : 0;
      lines.push(`  Mục ${entry}: ${pets.length} pet  ${describePets(pets)} | ${idle} hoạt ảnh idle`);
    }
    const desktopVisible = flattenPetList(merged).filter(isDesktopVisible);
    // 只有 display 为 desktop 或 both 的宠物会真的出现在桌面上。
    lines.push(
      `Cửa sổ desktop      ${desktopVisible.length} pet${
        desktopVisible.length === 0 ? ' (display cần là desktop hoặc both, nếu không chế độ độc lập sẽ không có pet nào để hiện)' : ''
      }`,
    );
    for (const line of lines) logger.info(line);
    logger.info('Kết luận: cấu hình và Electron đã sẵn sàng, có thể khởi động ngay (npm run standalone).');
    return 0;
  } catch (error) {
    return fail(`Đọc cấu hình thất bại: ${error instanceof Error ? error.message : String(error)}`);
  }
}
