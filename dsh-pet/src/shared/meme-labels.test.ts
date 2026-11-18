/** 表情包显示名的行为测试：标签可读，图片键、缩略图与自定义名称保持原样。 */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { readJsonc } from '../host/config/jsonc.ts';
import { memeLabel } from './meme-labels.ts';
import { buildMemeBranch, memeThumbUrl } from './menu/memes.ts';
import type { MenuNode } from './menu/types.ts';

test('内置表情包：越南语标签不改变图片标识、顺序与缩略图地址', () => {
  const config = readJsonc(fileURLToPath(new URL('../../assets/config.jsonc', import.meta.url)));
  assert.ok(config?.memes);
  const memes = config.memes as Record<string, string>;
  const branch = buildMemeBranch({ memes, chatImageEnabled: true, chatImageLimit: 0 }, (id) =>
    memeThumbUrl('/pet', 'main', id),
  );
  assert.ok(branch);
  const collect = (nodes: readonly MenuNode[]): Array<{ label: string; image?: string; thumb?: string }> =>
    nodes.flatMap((node) => ('children' in node ? collect(node.children) : [node]));
  const leaves = collect(branch.children);
  assert.deepEqual(
    leaves.map((leaf) => leaf.image),
    Object.keys(memes),
  );
  for (const leaf of leaves) {
    assert.ok(leaf.image);
    assert.equal(leaf.label, memeLabel(leaf.image));
    assert.doesNotMatch(leaf.label, /[\u3400-\u9fff]/u);
    assert.equal(leaf.thumb, memeThumbUrl('/pet', 'main', leaf.image));
  }
});

test('自定义图片名与对象原型键：未收录时原样显示', () => {
  for (const id of ['Ảnh riêng', '自定义图片', '__proto__', 'toString']) assert.equal(memeLabel(id), id);
});
