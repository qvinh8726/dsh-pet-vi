/** 菜单翻译只改标签；原始行为、role 与快捷键保持不变。 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { localizeApplicationMenu } = require('../../runtime/electron-helper/main/application-menu.js');

test('Electron menu labels are Vietnamese without replacing actions', () => {
  const click = () => 'kept';
  const submenu = {
    items: [
      { role: 'copy', label: 'Copy', accelerator: 'Ctrl+C', click },
      { role: 'toggleDevTools', label: 'Toggle Developer Tools', click },
      { role: 'quit', label: 'Quit', click },
    ],
  };
  const menu = { items: [{ role: 'fileMenu', label: 'File', submenu }] };
  assert.equal(localizeApplicationMenu(menu), menu);
  assert.equal(menu.items[0].label, 'Tệp');
  assert.deepEqual(
    submenu.items.map((item) => item.label),
    ['Sao chép', 'Bật hoặc tắt công cụ phát triển', 'Thoát'],
  );
  assert.equal(submenu.items[0].accelerator, 'Ctrl+C');
  assert.equal(submenu.items[0].role, 'copy');
  assert.ok(submenu.items.every((item) => item.click === click));
});

test('custom labels and missing menus stay safe', () => {
  assert.equal(localizeApplicationMenu(null), null);
  const item = { label: 'Tên do plugin đặt' };
  localizeApplicationMenu({ items: [item] });
  assert.equal(item.label, 'Tên do plugin đặt');
});
