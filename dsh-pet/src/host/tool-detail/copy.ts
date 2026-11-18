/**
 * 气泡文案表：工具名 → 一句话，命令名 → 一句话。
 *
 * 纯数据，不含判定；加工具或改语气只改这里。
 * 必须始终成立：每句都带具体对象，不说空话；不出现参数值（可能含 token 或内网地址）。
 * @module dsh-pet/src/host/tool-detail/copy
 */
import { fileTarget, filesTarget, firstStr, queryTarget, urlHost } from './target.ts';

/** 句子里可用的占位符：{target} 目标名、{cmd} 命令名。 */
export type CopyLine = string;

/** 从解析后的参数里取「目标」（文件名 / 搜索词 / 域名…）；取不到 → null。 */
type TargetPicker = (args: Record<string, unknown>) => string | null;

/** 只描述「怎么取目标」，不含任何文案（文案全部在下面的表里）。 */
export interface ToolRule {
  pick: TargetPicker;
  /**
   * 目标是不是路径：只有路径才做「太长只留文件名」的压缩。
   * 描述、搜索词、域名这类文本不该被 `/` 切开。
   */
  path?: boolean;
}

/** 文件名/图片类：每句都带 {target}。 */
const FILE_COPY: readonly CopyLine[] = ['Lật xem {target} nào', '{target} viết gì thế nhỉ', 'Để em ngó {target} đã'];

/** 写文件。 */
const WRITE_COPY: readonly CopyLine[] = [
  'Viết chút gì vào {target}',
  '{target} viết xong ngay đây',
  'Thêm chút đồ vào {target}',
];

/** 改文件。 */
const EDIT_COPY: readonly CopyLine[] = [
  '{target} phải sửa chút rồi',
  'Để em chỉnh {target} nha',
  'Chỗ {target} này cần sửa',
];

/** 找文件。 */
const GLOB_COPY: readonly CopyLine[] = [
  '{target} trốn đâu hết rồi',
  'Tìm xem {target} có không',
  '{target} nấp ở góc nào ta',
];

/** 搜内容。 */
const GREP_COPY: readonly CopyLine[] = ['{target} giấu ở đâu nhỉ', 'Lục xem {target} ở đâu', 'Chỗ nào có {target} ta'];

/** 给人看文件。 */
const PRESENT_COPY: readonly CopyLine[] = ['Cho xem {target} nè', '{target} đây, xem thử nha', 'Nè, {target} ở đây'];

/** 学技能。 */
const SKILL_COPY: readonly CopyLine[] = [
  'Học chiêu mới {target}',
  'Chiêu {target} phải nhớ kỹ',
  'Học luôn {target} thôi',
];

/** 委派子任务。 */
const SUBAGENT_COPY: readonly CopyLine[] = [
  'Gọi người phụ: {target}',
  'Nhờ trợ thủ xem {target}',
  'Giao {target} cho trợ thủ',
];

/** 一个工具的文案：3 句带 {target} 的说法 + 目标太长时的一句纯氛围兜底。 */
export interface ToolCopy {
  readonly lines: readonly CopyLine[];
  /** 目标超过 TARGET_DISPLAY_MAX 时用：不出现文件名与工具名（气泡是氛围，不是信息面板） */
  readonly short: CopyLine;
}

/** 工具 → 文案。没列在这里的工具走 UNKNOWN_TOOL_LINE。 */
export const TOOL_COPY: Readonly<Record<string, ToolCopy>> = {
  read: { lines: FILE_COPY, short: 'Lật code ra xem nào' },
  read_image: {
    lines: ['{target} trông thế nào ta', 'Cho em xem {target} với', '{target} là ảnh gì nhỉ'],
    short: 'Xem ảnh này là gì nào',
  },
  write: { lines: WRITE_COPY, short: 'Viết chút gì vào đây' },
  edit: { lines: EDIT_COPY, short: 'Chỗ này phải sửa chút' },
  str_replace_editor: { lines: EDIT_COPY, short: 'Chỗ này phải sửa chút' },
  glob: { lines: GLOB_COPY, short: 'Tìm xem đồ ở đâu' },
  grep: { lines: GREP_COPY, short: 'Lục lọi khắp nơi nè' },
  present: { lines: PRESENT_COPY, short: 'Lấy cái này cho xem nè' },
  skill: { lines: SKILL_COPY, short: 'Học chiêu mới nè' },
  subagent: { lines: SUBAGENT_COPY, short: 'Gọi người tới phụ' },
  subagent_fork: { lines: SUBAGENT_COPY, short: 'Gọi người tới phụ' },
  workflow: {
    lines: ['Xếp việc theo thứ tự, bắt đầu nè', 'Lên lịch mấy việc cùng lúc', 'Làm lần lượt từng việc'],
    short: 'Sắp xếp công việc',
  },
  web_search: {
    lines: ['Em đi tra {target} đây', '{target} phải tra mới biết', 'Lên mạng hỏi {target} thôi'],
    short: 'Lên mạng tra chút',
  },
  web_fetch: {
    lines: ['Qua {target} xem có gì', 'Lật xem trang {target}', 'Xem {target} viết gì nào'],
    short: 'Lên mạng xem thử',
  },
};

/** 未知工具：只说一句氛围话，不报工具名（`str_replace_editor` 这种名字上屏很怪）。 */
export const UNKNOWN_TOOL_LINE: CopyLine = 'Công cụ này để làm gì ta';

/** 兜底：没进表的命令（npm / python / node / tsc / eslint / docker…），短命令名会上屏。 */
export const COMMAND_FALLBACK: readonly CopyLine[] = [
  'Chạy {cmd} chút nha',
  '{cmd} chạy rồi nè',
  'Cho {cmd} làm việc nào',
];

/** 兜底：命令名本身太长（如 Get-NetTCPConnection）时用，不带名字。 */
export const COMMAND_NAME_TOO_LONG: CopyLine = 'Chạy một lệnh nè';

const CD_COPY: readonly CopyLine[] = ['Dời chỗ một chút đã', 'Chuyển sang thư mục kia', 'Đổi chỗ làm tiếp nào'];

const LS_COPY: readonly CopyLine[] = ['Xem ở đây có gì nào', 'Tầng này có những gì ta', 'Lục xem ở đây có không'];

const CAT_COPY: readonly CopyLine[] = ['Mở nội dung ra xem nào', 'Xem bên trong viết gì', 'Đọc thử nội dung này'];

const MKDIR_COPY: readonly CopyLine[] = ['Tạo thư mục mới', 'Dọn ra một chỗ trống', 'Mở một thư mục mới'];

const RM_COPY: readonly CopyLine[] = ['Dọn mấy thứ không cần', 'Cái này bỏ đi thôi', 'Dọn dẹp mấy thứ này'];

const MV_COPY: readonly CopyLine[] = ['Dời đồ sang chỗ khác', 'Đổi chỗ để nè', 'Chuyển qua bên kia'];

const CP_COPY: readonly CopyLine[] = ['Chép một bản giữ lại', 'Sao một bản dự phòng', 'Thêm một bản nữa'];

const CURL_COPY: readonly CopyLine[] = [
  'Hỏi thử API có ai không',
  'Gõ cửa xem có thông không',
  'Gửi request tới địa chỉ đó',
];

const CHECKOUT_COPY: readonly CopyLine[] = ['Qua nhánh kia xem thử', 'Đổi nhánh xem sao', 'Rẽ lối khác đi tiếp'];

/** 命令 / 「命令 子命令」→ 3 句候选（键一律小写，别名共用同一组）。 */
export const COMMAND_COPY: Readonly<Record<string, readonly CopyLine[]>> = {
  cd: CD_COPY,
  'set-location': CD_COPY,
  ls: LS_COPY,
  dir: LS_COPY,
  'get-childitem': LS_COPY,
  cat: CAT_COPY,
  'get-content': CAT_COPY,
  mkdir: MKDIR_COPY,
  'new-item': MKDIR_COPY,
  rm: RM_COPY,
  del: RM_COPY,
  'remove-item': RM_COPY,
  mv: MV_COPY,
  'move-item': MV_COPY,
  cp: CP_COPY,
  'copy-item': CP_COPY,
  curl: CURL_COPY,
  'invoke-webrequest': CURL_COPY,

  // git：没命中子命令时用这一组
  git: ['Vọc vạch repo git', 'Làm việc với git chút', 'Bên git động đậy chút'],
  'git status': ['Xem giờ đã sửa những gì', 'Xem thư mục làm việc sạch chưa', 'Tình hình hiện tại sao rồi'],
  'git diff': ['Ngó xem lần này sửa chỗ nào', 'Rốt cuộc đụng vào đâu vậy', 'So sánh xem đã sửa gì'],
  'git log': ['Để em xem lịch sử commit nha', 'Lật xem gần đây commit gì', 'Xem mấy hôm nay làm gì'],
  'git add': ['Gom mấy cái này lại trước', 'Đồ tốt cất vào trước', 'Ghi danh hết thay đổi'],
  'git commit': ['Code phải lưu cho kỹ', 'Commit một cái, ghi sổ', 'Lưu một bản trước đã'],
  'git push': ['Đến lúc đẩy lên rồi, để em', 'Push một cái, giao em', 'Phải cho remote biết rồi'],
  'git pull': ['Kéo bản mới nhất về', 'Mang đồ mới từ remote về', 'Đồng bộ trước đã'],
  'git fetch': ['Hỏi remote có gì mới không', 'Lén ngó remote một cái', 'Lấy trạng thái mới nhất về'],
  'git checkout': CHECKOUT_COPY,
  'git switch': CHECKOUT_COPY,
  'git branch': ['Xem có những nhánh nào', 'Sắp xếp mấy nhánh này', 'Tạo nhánh mới dự phòng'],
  'git merge': ['Gộp hai bên lại', 'Merge một cái, đừng cãi nhau', 'Hai nhánh này nên gộp rồi'],
  'git rebase': ['Vuốt lại lịch sử cho thẳng', 'Sắp lại thứ tự', 'Chỉnh lại thứ tự commit'],
  'git stash': ['Cất tạm thay đổi đi', 'Mấy cái này để qua bên', 'Giấu tạm một chút'],
  'git clone': ['Bê cả repo về', 'Chép nguyên một bản', 'Lấy bản này về xem'],
  'git reset': ['Lùi cái vừa rồi lại', 'Hoàn tác mấy bước này', 'Quay về như trước'],
  'git tag': ['Đánh dấu lần này', 'Dán nhãn phiên bản', 'Ghi một cột mốc'],
};

/**
 * 语义已由别处表达、不该进气泡的工具：
 * `todo_write` 的文案本身就是气泡正文（写它等于自己盖自己）；`ask_user_question` 与 goal 系已有
 * 专门档位（waiting / success / error）；`exit_plan_mode` 是纯内部调度。
 * 这些报出来不是重复就是噪音。
 */
export const SILENT_TOOLS: ReadonlySet<string> = new Set([
  'todo_write',
  'ask_user_question',
  'create_goal',
  'get_goal',
  'update_goal',
  'exit_plan_mode',
]);

/** 取目标的方式（与文案表按工具名关联；pwsh 不在这里，它走命令表）。 */
export const TOOL_RULES: Readonly<Record<string, ToolRule>> = {
  read: { pick: fileTarget, path: true },
  read_image: { pick: fileTarget, path: true },
  write: { pick: fileTarget, path: true },
  edit: { pick: fileTarget, path: true },
  str_replace_editor: { pick: fileTarget, path: true },
  glob: { pick: (args) => firstStr(args, ['pattern', 'path']) },
  grep: { pick: (args) => firstStr(args, ['pattern', 'path']) },
  web_fetch: { pick: urlHost },
  web_search: { pick: queryTarget },
  subagent: { pick: (args) => firstStr(args, ['description']) },
  subagent_fork: { pick: (args) => firstStr(args, ['description']) },
  workflow: { pick: (args) => firstStr(args, ['name', 'description']) },
  skill: { pick: (args) => firstStr(args, ['name']) },
  present: { pick: filesTarget, path: true },
};
