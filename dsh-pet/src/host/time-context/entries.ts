/**
 * 节日与节气表：按优先级排好的条目，以及按日期建好的索引。
 *
 * 纯数据与索引构建。
 * 必须始终成立：新条目必须带 ahead/after 范围，否则索引会漏掉它。
 * @module dsh-pet/src/host/time-context/entries
 */
import { DEFAULT_AFTER, DEFAULT_AHEAD, DEFAULT_SPAN } from './constants.ts';

/** 节日/假期条目的公共字段。 */
interface EntryBase {
  /** 正式名：节前/节中/节后措辞用它（「快要过春节了」「还在春节假期里」） */
  name: string;
  /** 当天的口语名：用于「今天是…」；缺省 = 用 name */
  spoken?: string;
  ahead?: number;
  span?: number;
  after?: number;
}

/** 节日/假期条目（判别联合：公历日 / 农历日 / 除夕 / 假期区间）。 */
export type Entry = EntryBase &
  (
    | { kind: 'solar'; key: string }
    | { kind: 'lunar'; key: string }
    | { kind: 'lunarEve' }
    | { kind: 'season'; from: string; to: string }
  );

/**
 * 顺序 = 优先级（靠前的先说话）。一天只出一个从句，所以同一天被多个节日/假期覆盖时，谁在数组里
 * 靠前就由谁说；想改优先级就挪那几行，不必动逻辑。几条硬约束：只有当天值得说的小节排在邻座之前
 * 并掐掉回味；除夕、元宵必须排在春节之前；寒暑假排在传统节日之后、纪念日之前——假期里的节日仍由
 * 节日说话，7/1 这类与纪念日撞车的日子则由暑假说话。`ahead / span / after` 缺省 3 / 1 / 3。
 */
const PRIORITY: readonly Entry[] = [
  { kind: 'solar', key: '2-14', name: 'Lễ Tình nhân', after: 0 }, // 不让春节的 3 天前窗吃掉情人节当天
  { kind: 'solar', key: '12-31', name: 'đêm chuyển giao năm mới', after: 0 }, // 排在元旦前：12/31 说跨年夜，1/1 说元旦
  { kind: 'solar', key: '4-1', name: 'Cá tháng Tư', after: 0 }, // 排在清明前，否则 4/1 会说「快要过清明节了」
  { kind: 'solar', key: '5-4', name: 'Ngày Thanh niên Trung Quốc', ahead: 0, after: 0 }, // 排在劳动节前，否则 5/4 被劳动节回味压掉；不留前后窗，免得抢 5/3 的最后一天

  // ahead:1 → 2/15 起才预热，免得 2/14 就说「快要过除夕了」；after:0 → 2/17 交给春节当天，不说「除夕刚过完」
  { kind: 'lunarEve', name: 'Đêm Giao thừa', ahead: 1, after: 0 },
  { kind: 'lunar', key: '1-15', name: 'Tết Nguyên Tiêu' },
  { kind: 'lunar', key: '1-1', name: 'Tết Nguyên Đán', spoken: 'mùng Một Tết', span: 15 }, // 正月初一 → 正月十五

  { kind: 'lunar', key: '8-15', name: 'Tết Trung Thu', span: 3, after: 2 }, // 中秋假期 3 天；小节过去就过去了
  { kind: 'solar', key: '10-1', name: 'Quốc khánh Trung Quốc', span: 7 }, // 国庆假期 7 天
  { kind: 'solar', key: '1-1', name: 'Tết Dương lịch', spoken: 'ngày đầu tiên của năm mới', span: 3 }, // 元旦假期 3 天
  { kind: 'lunar', key: '5-5', name: 'Tết Đoan Ngọ', span: 3 },
  { kind: 'solar', key: '4-4', name: 'Tiết Thanh Minh', span: 3, ahead: 1 }, // 大致 4/4 起 3 天（真日期为节气 4/4 或 4/5）；ahead:1 让出 4/1–4/2 给愚人节
  { kind: 'solar', key: '5-1', name: 'Ngày Quốc tế Lao động', span: 3 },
  { kind: 'solar', key: '6-1', name: 'Ngày Quốc tế Thiếu nhi' },

  { kind: 'lunar', key: '7-7', name: 'Thất Tịch' },
  { kind: 'lunar', key: '7-15', name: 'Rằm tháng Bảy' },
  { kind: 'lunar', key: '2-2', name: 'ngày Rồng Ngẩng Đầu' },
  { kind: 'lunar', key: '9-9', name: 'Tết Trùng Cửu' },
  { kind: 'lunar', key: '12-8', name: 'Lễ Lạp Bát' },
  { kind: 'lunar', key: '12-23', name: 'Tết ông Công ông Táo' },

  { kind: 'season', from: '1-20', to: '2-18', name: 'kỳ nghỉ đông' }, // 30 天
  { kind: 'season', from: '7-1', to: '8-29', name: 'kỳ nghỉ hè' }, // 60 天

  { kind: 'solar', key: '3-8', name: 'Ngày Quốc tế Phụ nữ' },
  { kind: 'solar', key: '9-10', name: 'Ngày Nhà giáo Trung Quốc' },
  { kind: 'solar', key: '7-1', name: 'Ngày thành lập Đảng Cộng sản Trung Quốc' },
  { kind: 'solar', key: '8-1', name: 'Ngày thành lập Quân Giải phóng Nhân dân Trung Quốc' },
  { kind: 'solar', key: '10-31', name: 'đêm Halloween' },
  // 平安夜排在圣诞节之前（12/24 说平安夜），after:0 让它别用回味吃掉 12/25 的圣诞节当天
  { kind: 'solar', key: '12-24', name: 'đêm Giáng sinh', after: 0 },
  { kind: 'solar', key: '12-25', name: 'Lễ Giáng sinh' },
];

/** 带优先级的条目（priority = 在 PRIORITY 里的下标，越小越优先）。 */
export interface RankedEntry {
  entry: Entry;
  priority: number;
}

/** 公历 / 农历 / 除夕 / 假期区间的索引（模块加载时按 PRIORITY 建一次）。 */
export const SOLAR_INDEX = new Map<string, RankedEntry>();

export const LUNAR_INDEX = new Map<string, RankedEntry>();

export const SEASON_ENTRIES: Array<RankedEntry & { from: string; to: string }> = [];

export let LUNAR_EVE: RankedEntry | undefined;

PRIORITY.forEach((entry, priority) => {
  if (entry.kind === 'solar') SOLAR_INDEX.set(entry.key, { entry, priority });
  else if (entry.kind === 'lunar') LUNAR_INDEX.set(entry.key, { entry, priority });
  else if (entry.kind === 'lunarEve') LUNAR_EVE = { entry, priority };
  else SEASON_ENTRIES.push({ entry, priority, from: entry.from, to: entry.to });
});

/** 候选从句（连同优先级） */
export interface Candidate {
  clause: string;
  priority: number;
}

/** 农历月日（ICU 换算结果） */
export interface LunarParts {
  /** 农历月：1–12；闰月取负（闰六月 = -6），与平月区分开 */
  month: number;
  /** 农历日：1–30 */
  day: number;
}

/** 条目里最长的预热天数与回看距离（长假 15 天 + 回味 3 天），据此决定扫描窗口。 */
const HOLIDAY_ENTRIES = PRIORITY.filter((e) => e.kind !== 'season');

export const MAX_AHEAD = Math.max(...HOLIDAY_ENTRIES.map((e) => e.ahead ?? DEFAULT_AHEAD));

export const MAX_LOOKBACK = Math.max(
  ...HOLIDAY_ENTRIES.map((e) => (e.span ?? DEFAULT_SPAN) - 1 + (e.after ?? DEFAULT_AFTER)),
);
