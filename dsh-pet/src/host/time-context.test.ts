/**
 * 时间背景单元测试 —— 钉住注入 system 末尾的那一行文字：
 *  - 时段 0–23 逐时映射（凌晨 0-4 / 清晨 5-6 / 早上 7-8 / 上午 9-10 / 中午 11-12 / 下午 13-16 / 傍晚 17-18 /
 *    晚上 19-22 / 深夜 23），分钟边界不越档（04:59 仍凌晨、05:00 进清晨）；
 *  - 整行 = 不补零月日 + 补零时分 + 星期 + 时段 + 周末/工作日（周六周日，与余额低谷同口径）+ 可选节日从句 + 克制的引导语；
 *  - 节日从句：节前「快要过X了」/「明天就是X」、当天「今天是X」、节期内「还在X假期里」/「X假期最后一天了」、
 *    节后「X刚过完」/「X这么快就过完了」，各按自己的 span / after；
 *  - 长度：元旦/端午/清明/劳动节/中秋各 3 天、国庆 7 天、春节 15 天（除夕→正月十五），寒假 30 天、暑假 60 天；
 *  - 一天命中多个节日时按 PRIORITY 数组顺序取靠前者：2/14、2/16 除夕、3/3 元宵、4/1、5/4、7/1 暑假、8/19 七夕、
 *    12/31 跨年夜均有用例；农历按 ICU 换算，闰月不误判（2028 闰五月初五非端午）；
 *  - 非法 Date → 空串（绝不产出「NaN年NaN月」）；日期用 `new Date(y, m, d, h, min)` 本地时间构造，断言不随运行机器时区变化。
 *  - ICU 降级分支未覆盖（需替换全局 Intl，会干扰其它用例）；跑法：node --experimental-strip-types --test src/host/time-context.test.ts
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { dayKindOf, historyStampOf, timeContextOf, timeSlotOf, type TimeSlot } from './time-context.ts';

/** 0–23 点逐时期望时段（改划分口径时必须同步这里，否则测试红） */
const EXPECTED_BY_HOUR: TimeSlot[] = [
  'rạng sáng',
  'rạng sáng',
  'rạng sáng',
  'rạng sáng',
  'rạng sáng',
  'sáng sớm',
  'sáng sớm',
  'buổi sáng',
  'buổi sáng',
  'giữa buổi sáng',
  'giữa buổi sáng',
  'buổi trưa',
  'buổi trưa',
  'buổi chiều',
  'buổi chiều',
  'buổi chiều',
  'buổi chiều',
  'chiều tối',
  'chiều tối',
  'buổi tối',
  'buổi tối',
  'buổi tối',
  'buổi tối',
  'đêm khuya',
];

/** 注入文本的固定尾巴（引导语）——主张克制，避免模型句句都提时间/节日 */
const TAIL = '. Đây chỉ là thông tin nền, không cần cố ý báo giờ, cũng đừng câu nào cũng nhắc đến ngày lễ. Phần lớn thời gian cứ nói chuyện bình thường, khi nào thật sự hợp thì mới tiện nhắc một câu. Luôn trả lời bằng tiếng Việt.';

/** 断言注入文本含指定节日从句（从句在整行里以「，…。」出现） */
function assertClause(date: Date, clause: string): void {
  const text = timeContextOf(date);
  assert.ok(text.includes(', ' + clause + '.'), `${date.toDateString()} 期望含「${clause}」，实际：${text}`);
}

/** 断言该日期没有任何节日从句（工作日/周末后直接接句号 + 引导语） */
function assertNoClause(date: Date): void {
  assert.match(timeContextOf(date), /(ngày thường|cuối tuần)\. Đây chỉ là thông tin nền/);
}

describe('timeSlotOf —— 小时 → 时段', () => {
  test('0–23 点逐时映射（钉死全部档位边界）', () => {
    const actual = Array.from({ length: 24 }, (_, h) => timeSlotOf(h));
    assert.deepEqual(actual, EXPECTED_BY_HOUR);
  });

  test('越界 / NaN → 凌晨兜底（不抛错，提示词路径不能因时间格式失败）', () => {
    assert.equal(timeSlotOf(-1), 'rạng sáng');
    assert.equal(timeSlotOf(24), 'đêm khuya');
    assert.equal(timeSlotOf(Number.NaN), 'rạng sáng');
  });
});

describe('dayKindOf —— 星期 → 工作日 / 周末', () => {
  test('周六（6）/ 周日（0）= 周末，周一至周五 = 工作日', () => {
    assert.equal(dayKindOf(0), 'cuối tuần');
    assert.equal(dayKindOf(6), 'cuối tuần');
    for (const day of [1, 2, 3, 4, 5]) {
      assert.equal(dayKindOf(day), 'ngày thường');
    }
  });
});

describe('timeContextOf —— 整行格式（无节日）', () => {
  test('无节日时是完整的一行，且不含节日从句', () => {
    assert.equal(
      timeContextOf(new Date(2026, 4, 12, 15, 4)),
      '【Hiện tại】Bây giờ là Thứ Ba ngày 12/5/2026 15:04, buổi chiều, ngày thường' + TAIL,
    );
  });

  test('时分补零、月日不补零', () => {
    assert.equal(
      timeContextOf(new Date(2026, 5, 5, 9, 7)),
      '【Hiện tại】Bây giờ là Thứ Sáu ngày 5/6/2026 09:07, giữa buổi sáng, ngày thường' + TAIL,
    );
  });

  test('周六算周末', () => {
    assert.equal(
      timeContextOf(new Date(2026, 4, 9, 23, 59)),
      '【Hiện tại】Bây giờ là Thứ Bảy ngày 9/5/2026 23:59, đêm khuya, cuối tuần' + TAIL,
    );
  });

  test('周日算周末、整点分钟补零', () => {
    assert.equal(
      timeContextOf(new Date(2026, 4, 10, 5, 0)),
      '【Hiện tại】Bây giờ là Chủ nhật ngày 10/5/2026 05:00, sáng sớm, cuối tuần' + TAIL,
    );
  });

  test('引导语克制：明确要求不必报时、别句句都提节日', () => {
    const text = timeContextOf(new Date(2026, 4, 12, 15, 4));
    assert.ok(text.includes('không cần cố ý báo giờ'));
    assert.ok(text.includes('cũng đừng câu nào cũng nhắc đến ngày lễ'));
  });

  test('分钟边界不越档：04:59 仍是凌晨、05:00 已进清晨', () => {
    assert.ok(timeContextOf(new Date(2026, 4, 12, 4, 59)).includes(', rạng sáng, ngày thường'));
    assert.ok(timeContextOf(new Date(2026, 4, 12, 5, 0)).includes(', sáng sớm, ngày thường'));
  });

  test('分钟边界不越档：22:59 仍是晚上、23:00 已进深夜', () => {
    assert.ok(timeContextOf(new Date(2026, 4, 12, 22, 59)).includes(', buổi tối, ngày thường'));
    assert.ok(timeContextOf(new Date(2026, 4, 12, 23, 0)).includes(', đêm khuya, ngày thường'));
  });

  test('非法 Date → 空串（整行不加，不产出 NaN 乱码）', () => {
    assert.equal(timeContextOf(new Date('not a date')), '');
  });
});

describe('节日 —— 单日节日（span = 1）', () => {
  test('当天：今天是国庆节', () => {
    assertClause(new Date(2026, 9, 1, 12, 0), 'hôm nay là Quốc khánh Trung Quốc');
  });

  test('当天用口语名：元旦说「新年第一天」', () => {
    assertClause(new Date(2026, 0, 1, 8, 0), 'hôm nay là ngày đầu tiên của năm mới');
  });

  test('跨年夜：排在元旦之前，12/31 说跨年夜而不是「明天就是元旦」', () => {
    assertClause(new Date(2025, 11, 31, 20, 0), 'hôm nay là đêm chuyển giao năm mới');
  });

  test('平安夜排在圣诞节之前且不留回味：12/24 说平安夜、12/25 说圣诞节', () => {
    assertClause(new Date(2025, 11, 24, 20, 0), 'hôm nay là đêm Giáng sinh');
    assertClause(new Date(2025, 11, 25, 20, 0), 'hôm nay là Lễ Giáng sinh');
  });

  test('节前 +3 / +2 天：快要过儿童节了', () => {
    assertClause(new Date(2026, 4, 29, 10, 0), 'sắp đến Ngày Quốc tế Thiếu nhi rồi');
    assertClause(new Date(2026, 4, 30, 10, 0), 'sắp đến Ngày Quốc tế Thiếu nhi rồi');
  });

  test('节前 +1 天：明天就是儿童节', () => {
    assertClause(new Date(2026, 4, 31, 10, 0), 'ngày mai là Ngày Quốc tế Thiếu nhi');
  });

  test('节后第 1 / 2 天：儿童节刚过完', () => {
    assertClause(new Date(2026, 5, 2, 10, 0), 'Ngày Quốc tế Thiếu nhi vừa mới qua');
    assertClause(new Date(2026, 5, 3, 10, 0), 'Ngày Quốc tế Thiếu nhi vừa mới qua');
  });

  test('节后第 3 天：儿童节这么快就过完了', () => {
    assertClause(new Date(2026, 5, 4, 10, 0), 'Ngày Quốc tế Thiếu nhi trôi qua nhanh thật');
  });

  test('窗口外（前后第 4 天）不注入节日', () => {
    assertNoClause(new Date(2026, 4, 28, 10, 0));
    assertNoClause(new Date(2026, 5, 5, 10, 0));
  });
});

describe('节日 —— 长度个性化（span > 1，长假分三段）', () => {
  test('国庆 7 天：开始 → 假期中 → 最后一天 → 回味', () => {
    assertClause(new Date(2026, 9, 1, 10, 0), 'hôm nay là Quốc khánh Trung Quốc');
    assertClause(new Date(2026, 9, 5, 10, 0), 'vẫn đang trong kỳ nghỉ Quốc khánh Trung Quốc');
    assertClause(new Date(2026, 9, 7, 10, 0), 'Quốc khánh Trung Quốc chỉ còn hôm nay là ngày nghỉ cuối');
    assertClause(new Date(2026, 9, 8, 10, 0), 'Quốc khánh Trung Quốc vừa mới qua');
    assertClause(new Date(2026, 9, 10, 10, 0), 'Quốc khánh Trung Quốc trôi qua nhanh thật');
    assertNoClause(new Date(2026, 9, 11, 10, 0));
  });

  test('元旦 3 天：假期中 → 最后一天 → 回味', () => {
    assertClause(new Date(2026, 0, 2, 10, 0), 'vẫn đang trong kỳ nghỉ Tết Dương lịch');
    assertClause(new Date(2026, 0, 3, 10, 0), 'Tết Dương lịch chỉ còn hôm nay là ngày nghỉ cuối');
    assertClause(new Date(2026, 0, 4, 10, 0), 'Tết Dương lịch vừa mới qua');
  });

  test('清明 3 天（大致 4/4 起）：愚人节次日才开始预热', () => {
    assertNoClause(new Date(2026, 3, 2, 10, 0));
    assertClause(new Date(2026, 3, 3, 10, 0), 'ngày mai là Tiết Thanh Minh');
    assertClause(new Date(2026, 3, 4, 10, 0), 'hôm nay là Tiết Thanh Minh');
    assertClause(new Date(2026, 3, 6, 10, 0), 'Tiết Thanh Minh chỉ còn hôm nay là ngày nghỉ cuối');
    assertClause(new Date(2026, 3, 7, 10, 0), 'Tiết Thanh Minh vừa mới qua');
  });

  test('劳动节 3 天与青年节让位：5/4 说青年节、5/5 再说劳动节', () => {
    assertClause(new Date(2026, 4, 1, 10, 0), 'hôm nay là Ngày Quốc tế Lao động');
    assertClause(new Date(2026, 4, 3, 10, 0), 'Ngày Quốc tế Lao động chỉ còn hôm nay là ngày nghỉ cuối');
    assertClause(new Date(2026, 4, 4, 10, 0), 'hôm nay là Ngày Thanh niên Trung Quốc');
    assertClause(new Date(2026, 4, 5, 10, 0), 'Ngày Quốc tế Lao động vừa mới qua');
  });

  test('中秋 3 天：假期中与最后一天', () => {
    assertClause(new Date(2026, 8, 25, 10, 0), 'hôm nay là Tết Trung Thu');
    assertClause(new Date(2026, 8, 26, 10, 0), 'vẫn đang trong kỳ nghỉ Tết Trung Thu');
    assertClause(new Date(2026, 8, 27, 10, 0), 'Tết Trung Thu chỉ còn hôm nay là ngày nghỉ cuối');
    // 中秋 after 只有 2 天，但优先级高于国庆：9/28 仍说中秋，9/30 才轮到国庆前夜
    assertClause(new Date(2026, 8, 28, 10, 0), 'Tết Trung Thu vừa mới qua');
    assertClause(new Date(2026, 8, 30, 10, 0), 'ngày mai là Quốc khánh Trung Quốc');
  });

  test('中秋 after=2：回味窗口到第 2 天为止（2027 验证）', () => {
    assertClause(new Date(2027, 8, 17, 10, 0), 'Tết Trung Thu chỉ còn hôm nay là ngày nghỉ cuối');
    assertClause(new Date(2027, 8, 18, 10, 0), 'Tết Trung Thu vừa mới qua');
    assertClause(new Date(2027, 8, 19, 10, 0), 'Tết Trung Thu vừa mới qua');
    assertNoClause(new Date(2027, 8, 20, 10, 0));
  });

  test('春节 15 天（正月初一 → 正月十五）：整段都在年味里', () => {
    assertClause(new Date(2026, 1, 17, 10, 0), 'hôm nay là mùng Một Tết');
    assertClause(new Date(2026, 1, 20, 10, 0), 'vẫn đang trong kỳ nghỉ Tết Nguyên Đán');
  });

  test('节前与当天压过「假期中」：3/2 说明天就是元宵节，3/3 是元宵节当天', () => {
    assertClause(new Date(2026, 2, 2, 10, 0), 'ngày mai là Tết Nguyên Tiêu');
    assertClause(new Date(2026, 2, 3, 10, 0), 'hôm nay là Tết Nguyên Tiêu');
  });

  test('元宵排在春节之前：元宵的当天与回味都归元宵', () => {
    assertClause(new Date(2026, 2, 4, 10, 0), 'Tết Nguyên Tiêu vừa mới qua');
    assertClause(new Date(2026, 2, 5, 10, 0), 'Tết Nguyên Tiêu vừa mới qua');
    assertClause(new Date(2026, 2, 7, 10, 0), 'ngày mai là Ngày Quốc tế Phụ nữ');
  });
});

describe('节日 —— 农历（ICU 换算）', () => {
  test('除夕：腊月最后一天（2026 是腊月廿九，不是三十）', () => {
    assertClause(new Date(2026, 1, 16, 12, 0), 'hôm nay là Đêm Giao thừa');
  });

  test('除夕 ahead=1：2/14 不说除夕，说情人节', () => {
    assertClause(new Date(2026, 1, 14, 12, 0), 'hôm nay là Lễ Tình nhân');
  });

  test('元宵节', () => {
    assertClause(new Date(2026, 2, 3, 12, 0), 'hôm nay là Tết Nguyên Tiêu');
  });

  test('端午节（3 天假）', () => {
    assertClause(new Date(2026, 5, 19, 12, 0), 'hôm nay là Tết Đoan Ngọ');
    assertClause(new Date(2026, 5, 21, 12, 0), 'Tết Đoan Ngọ chỉ còn hôm nay là ngày nghỉ cuối');
  });

  test('中秋节', () => {
    assertClause(new Date(2026, 8, 25, 12, 0), 'hôm nay là Tết Trung Thu');
  });

  test('腊八节（公历 1 月，农历还在上一年，且在寒假里照常说）', () => {
    assertClause(new Date(2026, 0, 26, 12, 0), 'hôm nay là Lễ Lạp Bát');
  });

  test('七夕（落在暑假里也要说节日，不被假期压掉）', () => {
    assertClause(new Date(2026, 7, 19, 12, 0), 'hôm nay là Thất Tịch');
  });

  test('闰月不误判：2028 闰五月初五不是端午，真端午在 2028-05-28', () => {
    assertClause(new Date(2028, 4, 28, 12, 0), 'hôm nay là Tết Đoan Ngọ');
    assertNoClause(new Date(2028, 5, 27, 12, 0)); // 闰五月初五：月为负，不参与匹配
  });
});

describe('假期区间 —— 寒假 30 天 / 暑假 60 天', () => {
  test('寒假：预热 → 开始 → 假期中', () => {
    assertClause(new Date(2026, 0, 17, 10, 0), 'sắp đến kỳ nghỉ đông rồi');
    assertClause(new Date(2026, 0, 19, 10, 0), 'ngày mai là bắt đầu kỳ nghỉ đông rồi');
    assertClause(new Date(2026, 0, 20, 10, 0), 'kỳ nghỉ đông bắt đầu rồi');
    assertClause(new Date(2026, 1, 5, 10, 0), 'đang trong kỳ nghỉ đông');
  });

  test('寒假末尾（用 2028：2026 的这几天被春节占了）', () => {
    assertClause(new Date(2028, 1, 18, 10, 0), 'kỳ nghỉ đông sắp kết thúc rồi');
    assertClause(new Date(2028, 1, 19, 10, 0), 'kỳ nghỉ đông vừa kết thúc');
    assertClause(new Date(2028, 1, 21, 10, 0), 'kỳ nghỉ đông trôi qua nhanh thật');
    assertNoClause(new Date(2028, 1, 22, 10, 0));
  });

  test('暑假：预热 → 首日 → 假期中', () => {
    // 暑假排在建党节之前：7/1 说「暑假开始了」，不再被建党节压掉
    assertClause(new Date(2026, 5, 28, 10, 0), 'sắp đến kỳ nghỉ hè rồi');
    assertClause(new Date(2026, 5, 30, 10, 0), 'ngày mai là bắt đầu kỳ nghỉ hè rồi');
    assertClause(new Date(2026, 6, 1, 10, 0), 'kỳ nghỉ hè bắt đầu rồi');
    assertClause(new Date(2026, 6, 15, 10, 0), 'đang trong kỳ nghỉ hè');
  });

  test('暑假末尾：中元节优先，随后是暑假的收尾', () => {
    assertClause(new Date(2026, 7, 27, 10, 0), 'hôm nay là Rằm tháng Bảy');
    assertClause(new Date(2026, 7, 28, 10, 0), 'Rằm tháng Bảy vừa mới qua');
    assertClause(new Date(2026, 7, 31, 10, 0), 'kỳ nghỉ hè vừa kết thúc');
    assertClause(new Date(2026, 8, 1, 10, 0), 'kỳ nghỉ hè trôi qua nhanh thật');
    assertNoClause(new Date(2026, 8, 2, 10, 0));
  });
});

describe('节日 —— 优先级＝数组顺序（靠前的先说话）', () => {
  test('当天压过节前：2026-02-14 是情人节（春节还差 3 天）', () => {
    assertClause(new Date(2026, 1, 14, 12, 0), 'hôm nay là Lễ Tình nhân');
  });

  test('节前压过节后：2026-02-15 说「明天就是除夕」', () => {
    assertClause(new Date(2026, 1, 15, 12, 0), 'ngày mai là Đêm Giao thừa');
  });

  test('除夕排在春节之前：2026-02-16 说除夕，而非「明天就是春节」', () => {
    assertClause(new Date(2026, 1, 16, 12, 0), 'hôm nay là Đêm Giao thừa');
  });

  test('愚人节排在清明之前：2026-04-01 说愚人节', () => {
    assertClause(new Date(2026, 3, 1, 12, 0), 'hôm nay là Cá tháng Tư');
  });

  test('春节压过寒假：寒假期间仍由春节说话', () => {
    assertClause(new Date(2026, 1, 18, 12, 0), 'vẫn đang trong kỳ nghỉ Tết Nguyên Đán');
  });

  test('传统节日压过暑假：8/19 七夕当天说七夕', () => {
    assertClause(new Date(2026, 7, 19, 12, 0), 'hôm nay là Thất Tịch');
  });

  test('暑假压过纪念日：7/1 既是建党节又是暑假首日，说暑假', () => {
    assertClause(new Date(2026, 6, 1, 12, 0), 'kỳ nghỉ hè bắt đầu rồi');
  });
});

describe('historyStampOf —— 历史消息的时间前缀', () => {
  test('同年：月日不补零、时分补零', () => {
    const at = new Date(2026, 9, 31, 22, 53).getTime();
    assert.equal(historyStampOf(at, new Date(2026, 10, 2, 0, 52)), '31/10 22:53');
  });

  test('个位数时/分补零：09:05 不能写成 9:5', () => {
    const at = new Date(2026, 10, 2, 9, 5).getTime();
    assert.equal(historyStampOf(at, new Date(2026, 10, 2, 9, 5)), '2/11 09:05');
  });

  test('跨年：带上年份，消掉“哪一年”的歧义', () => {
    const at = new Date(2025, 11, 31, 23, 59).getTime();
    assert.equal(historyStampOf(at, new Date(2026, 0, 1, 0, 30)), '31/12/2025 23:59');
  });

  test('ts 非法（NaN / 越界）→ 空串，调用方据此不发前缀', () => {
    assert.equal(historyStampOf(Number.NaN, new Date(2026, 10, 2)), '');
    assert.equal(historyStampOf(Number.POSITIVE_INFINITY, new Date(2026, 10, 2)), '');
  });

  test('now 非法 → 空串（没有“现在”就无法判断是否跨年）', () => {
    assert.equal(historyStampOf(new Date(2026, 9, 31).getTime(), new Date('nope')), '');
  });
});

describe('timeContextOf —— 环境行（城市与天气）', () => {
  /** 2026-11-11 星期三 20:50：工作日 + 晚上，落在断言的稳定区间里 */
  const EVENING = new Date(2026, 10, 11, 20, 50);
  const WEATHER = { summary: '阴', temperatureC: 13.1, apparentC: 12.9, humidityPercent: 84, windKph: 2 };

  test('不传 env：不带地点、不带天气，句尾也不提天气', () => {
    const text = timeContextOf(EVENING);
    assert.ok(!text.includes('Em đang ở'), '不该出现地点');
    assert.ok(!text.includes('bên ngoài'), '不该出现天气');
    assert.ok(text.endsWith('cũng đừng câu nào cũng nhắc đến ngày lễ. Phần lớn thời gian cứ nói chuyện bình thường, khi nào thật sự hợp thì mới tiện nhắc một câu. Luôn trả lời bằng tiếng Việt.'));
  });

  test('只给城市：地点在最前，没有天气就写“没查到”的交代', () => {
    const text = timeContextOf(EVENING, { city: '南昌市' });
    assert.ok(text.startsWith('【Hiện tại】Em đang ở 南昌市 (ước lượng theo mạng, chưa chắc chính xác). Bây giờ là'));
    assert.ok(text.includes('ngày thường, lần này chưa tra được thời tiết bên ngoài, chủ nhân có hỏi thì cứ nói là không biết, đừng bịa.'), `实际：${text}`);
    assert.ok(text.includes('cũng đừng câu nào cũng nhắc đến ngày lễ hay thời tiết'));
  });

  test('省 + 市：连写成“江西省南昌市”', () => {
    const text = timeContextOf(EVENING, { region: '江西省', city: '南昌市' });
    assert.ok(text.startsWith('【Hiện tại】Em đang ở 江西省南昌市 (ước lượng theo mạng, chưa chắc chính xác). Bây giờ là'), `实际：${text}`);
  });

  test('省市互相包含：只留带后缀的那个，不写成“北京市北京”', () => {
    const text = timeContextOf(EVENING, { region: '北京市', city: '北京' });
    assert.ok(text.startsWith('【Hiện tại】Em đang ở 北京市 (ước lượng theo mạng, chưa chắc chính xác). Bây giờ là'), `实际：${text}`);
  });

  test('拉丁文地名之间补一个空格', () => {
    const text = timeContextOf(EVENING, { region: 'Jiangxi', city: 'Nanchang' });
    assert.ok(text.startsWith('【Hiện tại】Em đang ở Jiangxi Nanchang (ước lượng theo mạng, chưa chắc chính xác). Bây giờ là'), `实际：${text}`);
  });

  test('城市与天气都有：天气接在工作日后面', () => {
    const text = timeContextOf(EVENING, { region: '江西省', city: '南昌市', weather: WEATHER });
    assert.ok(text.includes('ngày thường, thời tiết bên ngoài: 阴, nhiệt độ 13.1°C, cảm giác như 12.9°C, độ ẩm 84%, gió 2 km/h.'), `实际：${text}`);
  });

  test('只有天气没有城市：省掉“你在……”，天气照写', () => {
    const text = timeContextOf(EVENING, { weather: WEATHER });
    assert.ok(!text.includes('Em đang ở'));
    assert.ok(text.includes('ngày thường, thời tiết bên ngoài: 阴, nhiệt độ 13.1°C'));
  });

  test('整数气温不带小数点', () => {
    const text = timeContextOf(EVENING, { weather: { ...WEATHER, temperatureC: 20, apparentC: 20 } });
    assert.ok(text.includes('nhiệt độ 20°C, cảm giác như 20°C'), `实际：${text}`);
  });

  test('非法 Date 且给了 env：仍返回空串', () => {
    assert.equal(timeContextOf(new Date('nope'), { city: '南昌市' }), '');
  });
});
