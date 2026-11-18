/** 越南语显示名的行为测试：内置菜单可读，播放标识与自定义名称保持原样。 */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { readJsonc } from '../host/config/jsonc.ts';
import { animationLabel, categoryLabel } from './animation-labels.ts';
import { buildMenuTree } from './menu/tree.ts';
import type { Animations } from './types.ts';
import type { MenuNode } from './menu/types.ts';

/** 默认配置是菜单输入数据，不读取被测模块的源码。 */
function builtinAnimations(): Animations {
  const config = readJsonc(fileURLToPath(new URL('../../assets/config.jsonc', import.meta.url)));
  assert.ok(config?.animations);
  return config.animations as unknown as Animations;
}

/** 收集叶子的显示名与播放标识，保留菜单顺序。 */
function animationLeaves(nodes: readonly MenuNode[]): Array<{ label: string; anim: string }> {
  return nodes.flatMap((node) =>
    'children' in node ? animationLeaves(node.children) : node.anim ? [{ label: node.label, anim: node.anim }] : [],
  );
}

test('内置菜单：显示名为越南语，播放标识与配置顺序不变', () => {
  const animations = builtinAnimations();
  const leaves = animationLeaves(buildMenuTree(animations));
  const expected = [
    ...animations.idle,
    ...animations.turn,
    ...animations.drag,
    ...animations.clicks,
    ...animations.moves.actions.map((move) => move.name),
    ...animations.categories.flatMap((category) => category.actions),
    ...Object.values(animations.events).flatMap((slots) => slots.flat()),
  ];
  assert.deepEqual(
    leaves.map((leaf) => leaf.anim),
    expected,
  );
  for (const leaf of leaves) {
    assert.equal(leaf.label, animationLabel(leaf.anim));
    assert.doesNotMatch(leaf.label, /[\u3400-\u9fff]/u, leaf.anim);
    assert.notEqual(leaf.label, leaf.anim);
  }
  const root = buildMenuTree(animations)[0];
  assert.ok(root && 'children' in root);
  for (const category of animations.categories) {
    assert.ok(root.children.some((node) => node.label === categoryLabel(category.id)));
    assert.doesNotMatch(categoryLabel(category.id), /[\u3400-\u9fff]/u);
  }
});

test('睡觉与玩法：内置动画也有显示名，不改原始标识', () => {
  const animations = builtinAnimations();
  const names = [
    ...(animations.sleep ?? []).flatMap((suite) => [...suite.start, ...suite.loop, ...suite.end]),
    ...(animations.baifan ?? []),
  ];
  assert.ok(names.length > 0);
  for (const id of names) {
    assert.notEqual(animationLabel(id), id);
    assert.doesNotMatch(animationLabel(id), /[\u3400-\u9fff]/u);
  }
});

test('自定义名称与对象原型键：未收录时原样显示，不影响用户配置', () => {
  for (const id of ['Động tác riêng', '自定义动作', 'toString', '__proto__']) {
    assert.equal(animationLabel(id), id);
    assert.equal(categoryLabel(id), id);
  }
});
