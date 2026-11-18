/**
 * 消息头像与消息节点的渲染契约：头像地址必须按素材根与版本号生成。
 *
 * 只钉节点属性，不引 jsdom；用假的 `h` 记录树。
 * 跑法：node --experimental-strip-types --test src/client/chat/view-message.test.ts
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { avatarNode, messageNode, roundNode } from './view-message.ts';
import { ROUTE_PATH } from '../../shared/constants.ts';
import type { ChatMessageView } from './api.ts';
import type { ChatPanelRuntime } from './runtime.ts';
import type { ChatPanelState } from './types.ts';
import { zh } from './locales/zh.ts';

interface Node {
  tag: string;
  props: Record<string, unknown>;
}

const h = ((tag: unknown, props: Record<string, unknown>) => ({ tag, props })) as unknown as ChatPanelRuntime['h'];

/** 中文桩：本文件不断言文案，只用它满足运行时契约。 */
const t = ((key: string) => (zh as Record<string, string>)[key] ?? key) as unknown as ChatPanelRuntime['t'];

describe('roundNode —— 动作显示名与播放标识', () => {
  test('内置动作显示越南语，重播仍发送原始动画标识', () => {
    const played: string[] = [];
    const state = {
      selected: [],
      selecting: false,
      assetRoot: 'main',
      avatarVersion: 1,
      speaking: null,
      showImage: () => {},
      playAction: (id: string) => played.push(id),
    } as unknown as ChatPanelState;
    const translate = ((key: string, params?: Record<string, string | number>) => {
      let value = (zh as Record<string, string>)[key] ?? key;
      for (const [name, replacement] of Object.entries(params ?? {})) {
        value = value.replace('{' + name + '}', String(replacement));
      }
      return value;
    }) as ChatPanelRuntime['t'];
    const node = roundNode({ h, t: translate } as ChatPanelRuntime, state, {
      ts: 1,
      assistant: { ...message, action: '优雅女仆舞' },
    }) as Node;
    const body = (node.props.children as Node[])[1];
    const time = (body.props.children as Node[])[2];
    const action = (time.props.children as Node[])[2];
    assert.equal(action.props['aria-label'], 'Phát động tác: Điệu múa hầu gái thanh lịch');
    let stopped = false;
    (action.props.onClick as (event: { stopPropagation: () => void }) => void)({
      stopPropagation: () => {
        stopped = true;
      },
    });
    assert.equal(stopped, true);
    assert.deepEqual(played, ['优雅女仆舞']);
  });
});

const message: ChatMessageView = { role: 'assistant', text: '在的', ts: 1 };

describe('avatarNode', () => {
  test('宠物侧按素材根与版本号拼地址', () => {
    const node = avatarNode(h, false, 'baimao', 7) as unknown as Node;
    assert.equal(node.tag, 'img');
    assert.equal(node.props.className, 'pet-chat-avatar');
    assert.equal(node.props.src, ROUTE_PATH + '/logo?root=baimao&v=7');
  });

  test('没有素材根时只带版本号（宿主回默认 logo）', () => {
    const node = avatarNode(h, false, '', 7) as unknown as Node;
    assert.equal(node.props.src, ROUTE_PATH + '/logo?v=7');
  });

  test('用户侧是内联 SVG，不吃头像地址', () => {
    const node = avatarNode(h, true, 'baimao', 7) as unknown as Node;
    assert.equal(node.tag, 'svg');
    assert.equal(node.props.src, undefined);
  });

  test('版本号变化 → 头像 URL 变化（破缓存靠这一点）', () => {
    const first = avatarNode(h, false, 'baimao', 1) as unknown as Node;
    const second = avatarNode(h, false, 'baimao', 2) as unknown as Node;
    assert.notEqual(first.props.src, second.props.src);
  });
});

describe('messageNode', () => {
  test('宠物消息的头像跟随传入的素材根与版本号', () => {
    const node = messageNode(h, t, {
      message,
      isMe: false,
      assetRoot: 'baimao',
      avatarVersion: 3,
      onOpenImage: () => {},
    }) as unknown as Node;
    const avatar = (node.props.children as unknown[])[0] as Node;
    assert.equal(avatar.props.src, ROUTE_PATH + '/logo?root=baimao&v=3');
  });

  test('用户消息的头像仍是 SVG', () => {
    const node = messageNode(h, t, {
      message: { ...message, role: 'user' },
      isMe: true,
      assetRoot: 'baimao',
      avatarVersion: 3,
      onOpenImage: () => {},
    }) as unknown as Node;
    const avatar = (node.props.children as unknown[])[0] as Node;
    assert.equal(avatar.tag, 'svg');
  });
});
