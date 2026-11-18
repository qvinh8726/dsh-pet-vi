/** 对照固定上游的运行结果，验证内置文案覆盖与只影响语音的边界。 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { LINES } from '../client/baifan/constants.ts';
import * as copy from '../host/tool-detail/copy.ts';
import { clip } from '../host/tool-detail/target.ts';
import { reminderText } from '../host/todo/policy.ts';
import type { TodoRecord } from '../host/todo/types.ts';
import { frameToToast, type NotifyFrame } from './notify.ts';
import { balanceBubbleView } from './balance/view.ts';
import { originalSpeechParts, originalSpeechText } from './speech-original.ts';

const ROOT = new URL('../../../', import.meta.url);
const PACKAGE = new URL('../../', import.meta.url);
const ORIGINAL = 'fb38ce6';

function originalSource(path: string): string {
  return execFileSync('git', ['show', `${ORIGINAL}:dsh-pet/${path}`], {
    cwd: fileURLToPath(ROOT),
    encoding: 'utf8',
  });
}

/** 加载固定原文实现而非重建预期文案；相对依赖只供无副作用的台词表取名函数使用。 */
async function originalModule(path: string): Promise<Record<string, unknown>> {
  const javascript = stripTypeScriptTypes(originalSource(path)).replace(
    /from '([.][^']+)'/g,
    (_match: string, relative: string) => `from '${new URL(relative, new URL(path, PACKAGE)).href}'`,
  );
  return import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
}

function assertPairs(display: readonly string[], original: readonly string[], label: string): void {
  assert.equal(display.length, original.length, `${label}: 台词数量`);
  const before = [...display];
  display.forEach((line, index) => assert.equal(originalSpeechText(line), original[index], `${label}: ${line}`));
  assert.deepEqual(display, before, `${label}: 显示文案不得改变`);
}

test('内置睡眠与六档工作事件：当前显示表全部对应 fb38ce6 原话', () => {
  const path = 'assets/config.jsonc';
  const display = ts.parseConfigFileTextToJson(path, readFileSync(new URL(path, PACKAGE), 'utf8')).config as Record<
    string,
    string[][]
  >;
  const original = ts.parseConfigFileTextToJson(path, originalSource(path)).config as Record<string, string[][]>;
  let count = 0;
  for (const key of ['sleepRefuseTexts', 'sleepStartTexts', 'sleepEndTexts', 'workStatusTexts']) {
    const lines = display[key].flat();
    assertPairs(lines, original[key].flat(), key);
    count += lines.length;
  }
  assert.equal(count, 23);
});

test('吃白饭七组台词：21 句显示不变且保留上游标点', async () => {
  const upstream = await originalModule('src/client/baifan/constants.ts');
  const originals = upstream.LINES as typeof LINES;
  for (const key of Object.keys(LINES) as (keyof typeof LINES)[]) assertPairs(LINES[key], originals[key], key);
  assert.equal(Object.values(LINES).flat().length, 21);
  assert.equal(LINES.start[0], 'Tới giờ ăn rồi~');
  assert.equal(originalSpeechText(LINES.start[0]), '开饭了——');
});

test('工具与命令表：所有备选句、短句与别名都保留固定原文', async () => {
  const upstream = await originalModule('src/host/tool-detail/copy.ts');
  const originals = upstream as unknown as typeof copy;
  const fill = (line: string, target: string) => clip(line.split('{target}').join(target).split('{cmd}').join('node'));
  for (const target of ['a.ts', 'Việt 🐳', "$&$`$'\\{x}", 'a.b+[c](d)?', '🐳'.repeat(20)]) {
    for (const [tool, entry] of Object.entries(copy.TOOL_COPY)) {
      assertPairs(
        entry.lines.map((line) => fill(line, target)),
        originals.TOOL_COPY[tool].lines.map((line) => fill(line, target)),
        tool,
      );
      assert.equal(originalSpeechText(entry.short), originals.TOOL_COPY[tool].short);
    }
  }
  for (const [command, lines] of Object.entries(copy.COMMAND_COPY))
    assertPairs(lines, originals.COMMAND_COPY[command], command);
  assertPairs(
    copy.COMMAND_FALLBACK.map((line) => fill(line, '')),
    originals.COMMAND_FALLBACK.map((line) => fill(line, '')),
    'fallback',
  );
  assert.equal(originalSpeechText(copy.COMMAND_NAME_TOO_LONG), originals.COMMAND_NAME_TOO_LONG);
  assert.equal(originalSpeechText(copy.UNKNOWN_TOOL_LINE), originals.UNKNOWN_TOOL_LINE);
});

function todo(text: string, dueAt: number): TodoRecord {
  return {
    id: 'todo-1',
    text,
    dueAt,
    done: false,
    createdAt: 0,
    updatedAt: 0,
    completedAt: null,
    lastRemindedAt: null,
  };
}

test('待办三种提醒与三种时间单位：实际产出的越南语映射到上游输出', async () => {
  const upstream = await originalModule('src/host/todo/policy.ts');
  const originalReminder = upstream.reminderText as typeof reminderText;
  const now = 10 * 24 * 60 * 60_000;
  const spans = [
    0,
    -59_000,
    25 * 60_000,
    -25 * 60_000,
    3 * 60 * 60_000,
    -3 * 60 * 60_000,
    2 * 24 * 60 * 60_000,
    -2 * 24 * 60 * 60_000,
  ];
  for (const text of ['Uống nước', '"Họp" $& 🐳', '🐳'.repeat(20)]) {
    for (const span of spans) {
      const record = todo(text, now + span);
      const before = structuredClone(record);
      const display = reminderText(record, now);
      assert.equal(originalSpeechText(display), originalReminder(record, now), display);
      assert.deepEqual(record, before);
      assert.equal(reminderText(record, now), display);
    }
  }
  const display = reminderText(todo('Uống nước', now + 25 * 60_000), now);
  assert.equal(display, 'Còn 25 phút nữa là đến giờ "Uống nước" rồi nè');
  assert.equal(originalSpeechText(display), '「Uống nước」还有25分钟就到点啦');
});

test('通知事件：完整标题保留会话名，动态正文不被翻译', async () => {
  const upstream = await originalModule('src/shared/notify.ts');
  const originalToast = upstream.frameToToast as typeof frameToToast;
  const frames: NotifyFrame[] = [
    { type: 'session/event', event: { type: 'turn/end', data: { reason: { kind: 'max-tokens' } } } },
    { type: 'session/event', event: { type: 'turn/end', data: { reason: { kind: 'error' } } } },
    { type: 'approval/requested' },
    { type: 'question/requested' },
  ];
  for (const frame of frames) {
    for (const name of [undefined, 'Dự án 🐳', 'Một cuộc trò chuyện có tên dài hơn ba mươi ký tự']) {
      const display = frameToToast(frame, name)!;
      const original = originalToast(frame, name)!;
      assert.equal(originalSpeechText(display.title), original.title);
      if (display.body) assert.equal(originalSpeechText(display.body), original.body);
    }
  }
  assert.equal(originalSpeechText('Đã trả lời xong'), '对话完成');
  assert.equal(originalSpeechText('Nội dung trả lời do AI tạo riêng'), undefined);
});

test('余额不可用：三类气泡提示精确对应原文', () => {
  const cases = [
    ['unsupported', '当前服务商暂不支持余额查询'],
    ['credential-missing', '缺少余额查询凭证'],
    ['fetch-error', '余额查询失败'],
  ] as const;
  for (const [reason, expected] of cases) {
    const rows = balanceBubbleView({ ok: false, reason, provider: 'demo' });
    const first = rows[0];
    assert.ok(first && 'text' in first);
    assert.equal(originalSpeechText(first.text), expected);
  }
});

test('未知、修改过的台词与部分命中：返回 undefined 而不猜测翻译', () => {
  for (const text of [
    '',
    'Xin chào, câu mới của AI',
    '我在睡觉，别烦我……',
    'Tới giờ ăn rồi~ nhé',
    ' Tới giờ ăn rồi~',
    'Tới giờ ăn rồi~\n',
    'Chủ nhân xác nhận giúp em với nhé',
    'Lật xem  nào',
    'Lật xem a.ts nào\n',
    'Lật xem ' + 'x'.repeat(21) + ' nào',
    'Chạy rm -rf chút nha',
    'Còn -2 phút nữa là đến giờ "Họp" rồi nè',
    'Còn 0 giờ nữa là đến giờ "Họp" rồi nè',
    'Còn 02 ngày nữa là đến giờ "Họp" rồi nè',
    'Còn 2 tuần nữa là đến giờ "Họp" rồi nè',
    'Còn 2 giờ nữa là đến giờ "Họp" rồi nè và làm tiếp',
    '"Họp" đến giờ rồi nè, nhớ làm nha\n',
    '"' + 'x'.repeat(19) + '" đến giờ rồi nè, nhớ làm nha',
    'Lật xem a\nb nào',
    ' · Đang xin quyền',
    'x'.repeat(32) + ' · Đang xin quyền',
  ])
    assert.equal(originalSpeechText(text), undefined, JSON.stringify(text));
});

test('边界名称：20 个码点的目标与截断的待办字符原样保留', () => {
  const target = '🐳'.repeat(20);
  assert.equal(originalSpeechText(`Lật xem ${target} nào`), `翻翻 ${target} 看看嘛`);
  const label = '🐳'.repeat(18) + '…';
  assert.equal(originalSpeechText(`"${label}" đến giờ rồi nè, nhớ làm nha`), `「${label}」到点啦，记得处理`);
  assert.equal(originalSpeechText('Chạy node.exe chút nha'), '跑一下 node.exe 咯');
});

test('待办分段：ASCII 与越南语标题单独翻译，中文外壳和时间保持原文', () => {
  for (const title of ['Di hop', 'Đi họp']) {
    const cases = [
      [`"${title}" đến giờ rồi nè, nhớ làm nha`, '」到点啦，记得处理'],
      [`"${title}" đã trễ 3 giờ rồi đó, nhớ làm nha`, '」已经逾期3小时啦，记得处理'],
      [`Còn 25 phút nữa là đến giờ "${title}" rồi nè`, '」还有25分钟就到点啦'],
      [`Còn 2 ngày nữa là đến giờ "${title}" rồi nè`, '」还有2天就到点啦'],
    ];
    for (const [display, suffix] of cases) {
      const parts = originalSpeechParts(display);
      assert.deepEqual(parts, [{ text: '「' }, { text: title, translate: true }, { text: suffix }]);
      assert.equal(parts?.map((part) => part.text).join(''), originalSpeechText(display));
    }
  }
});

test('通知分段：只翻译会话名，分隔符和四类通知后缀保持上游原文', () => {
  const labels = [
    ['Tạo phản hồi thất bại', '生成失败'],
    ['Phản hồi bị cắt ngang', '输出被截断'],
    ['Đang xin quyền', '正在申请权限'],
    ['Mô hình chờ bạn trả lời', '模型在等你回答'],
  ];
  for (const name of ['Du an', 'Dự án 🐳']) {
    for (const [displayLabel, originalLabel] of labels) {
      const display = `${name} · ${displayLabel}`;
      const parts = originalSpeechParts(display);
      assert.deepEqual(parts, [{ text: name, translate: true }, { text: ` · ${originalLabel}` }]);
      assert.equal(parts?.map((part) => part.text).join(''), originalSpeechText(display));
    }
  }
});

test('固定与技术台词分段：完整原文不标记翻译，未知或无效模板不匹配', () => {
  for (const [display, original] of [
    ['Tới giờ ăn rồi~', '开饭了——'],
    ['Em đang ngủ mà, đừng làm phiền em...', '我在睡觉，别烦我……'],
    ['Lật xem src/main.ts nào', '翻翻 src/main.ts 看看嘛'],
    ['Lật xem C:\\src\\main.ts nào', '翻翻 C:\\src\\main.ts 看看嘛'],
    ['Lật xem Việt 🐳 nào', '翻翻 Việt 🐳 看看嘛'],
    ['Chạy node.exe chút nha', '跑一下 node.exe 咯'],
  ]) {
    assert.deepEqual(originalSpeechParts(display), [{ text: original }]);
    assert.equal(original, originalSpeechText(display));
  }
  for (const display of [
    'Nội dung trả lời do AI tạo riêng',
    'Tới giờ ăn rồi~ nhé',
    'Chạy rm -rf chút nha',
    'Còn 0 giờ nữa là đến giờ "Di hop" rồi nè',
    'Còn 02 ngày nữa là đến giờ "Đi họp" rồi nè',
    '"' + 'x'.repeat(19) + '" đến giờ rồi nè, nhớ làm nha',
    '"Di hop" đến giờ rồi nè, nhớ làm nha\n',
    ' · Đang xin quyền',
    'x'.repeat(32) + ' · Đang xin quyền',
  ])
    assert.equal(originalSpeechParts(display), undefined, JSON.stringify(display));
});
