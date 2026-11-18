// Real React + Chromium; API fixtures never touch the user's DSH configuration.
// First run: pnpm exec playwright install chromium
import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { rolldown } from 'rolldown';

const pet = {
  id: 'pet-1',
  assetRoot: 'main',
  name: 'Blue',
  size: 240,
  display: 'web',
  position: { corner: 'top-right', marginX: 20, marginY: 20 },
};
const defaults = {
  main: {
    pets: [pet],
    notificationsEnabled: true,
    whisperImageEnabled: false,
    chatImageEnabled: false,
    confineToScreen: false,
    physics: {
      gravity: 2400,
      restitution: 0.6,
      groundFriction: 4,
      throwPower: 1,
      ceilingBounce: false,
      petCollision: false,
      hapticEnabled: true,
      tiltGravity: true,
      shakeThrow: true,
      dragSpring: true,
    },
    whisperModel: { provider: '', model: '' },
    chatModel: { provider: '', model: '' },
    chatMemoryRounds: 5,
    chatImageLimit: 10,
  },
};
const customized = {
  main: {
    ...defaults.main,
    notificationsEnabled: false,
    whisperImageEnabled: true,
    chatImageEnabled: true,
    confineToScreen: true,
    chatMemoryRounds: 19,
    chatImageLimit: 2,
    whisperModel: { provider: 'test', model: 'model' },
    chatModel: { provider: 'test', model: 'model' },
    physics: {
      ...defaults.main.physics,
      gravity: 1200,
      throwPower: 2,
      ceilingBounce: true,
      petCollision: true,
      hapticEnabled: false,
      tiltGravity: false,
      shakeThrow: false,
      dragSpring: false,
    },
  },
};
let browser, server, url;
before(async () => {
  const bundle = await rolldown({
    input: fileURLToPath(new URL('./settings.fixture.js', import.meta.url)),
    platform: 'browser',
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  });
  const { output } = await bundle.generate({ format: 'iife' });
  await bundle.close();
  server = createServer((req, res) => {
    if (req.url === '/fixture.js') {
      res.setHeader('content-type', 'text/javascript');
      res.end(output[0].code);
      return;
    }
    if (req.url === '/pet-font.ttf') {
      res.setHeader('content-type', 'font/ttf');
      res.end(readFileSync(new URL('../../assets/fonts/上首软糖体.ttf', import.meta.url)));
      return;
    }
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(
      `<html><head><style>@font-face{font-family:"ShangshouSoftCandy";src:url('/pet-font.ttf')}:root{--dsw-alias-bg-layer-1:#fff;--dsw-alias-label-primary:#202020;--dsw-alias-label-secondary:#444;--dsw-alias-label-tertiary:#666;--dsw-alias-border-l2:#bbb;--dsw-alias-state-business-primary:#245eea;--dsw-alias-button-info-fill:#245eea;--dsw-alias-state-error-primary:#c22}body{margin:16px;font-family:sans-serif}</style></head><body><div id="root"></div><script>window.initialConfig=${JSON.stringify(defaults)};</script><script src="/fixture.js"></script></body></html>`,
    );
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});

async function open(
  t,
  { get = customized, put, post, viewport = { width: 900, height: 900 }, lang, locale = 'en-US' } = {},
) {
  const context = await browser.newContext({ viewport, locale });
  t.after(() => context.close());
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const writes = [],
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, []));
  await page.route('**/dsh-pet-7340/**', async (route) => {
    const request = route.request();
    if (new URL(request.url()).pathname === '/dsh-pet-7340/logo') {
      return route.fulfill({
        contentType: 'image/png',
        body: readFileSync(new URL('../../assets/logo.png', import.meta.url)),
      });
    }
    if (new URL(request.url()).pathname === '/dsh-pet-7340/config') {
      if (request.method() === 'PUT') {
        writes.push(request.postDataJSON());
        if (put) return put(route);
        return route.fulfill({ json: customized });
      }
      if (request.method() === 'POST') return post ? post(route) : route.fulfill({ json: defaults });
      if (typeof get === 'function') return get(route);
      return route.fulfill({ json: get });
    }
    if (request.url().endsWith('/config/meta')) {
      return route.fulfill({
        json: {
          user: '/test/main-config.jsonc',
          default: '/test/assets/config.jsonc',
          animations: '/test/main-animation',
        },
      });
    }
    return route.fulfill({
      json: { providers: [{ id: 'test', name: 'Test', models: [{ id: 'model', name: 'Model' }] }] },
    });
  });
  await page.goto(lang === undefined ? url : `${url}/?lang=${encodeURIComponent(lang)}`);
  await page.locator('.dsh-pet-cfg').waitFor();
  return { page, writes };
}

async function save(page) {
  await Promise.all([
    page.waitForResponse((response) => response.request().method() === 'PUT'),
    page.getByRole('button', { name: 'Lưu', exact: true }).first().click(),
  ]);
}

async function assertSaveDisabled(page) {
  const buttons = page.getByRole('button', { name: 'Lưu', exact: true });
  assert.equal(await buttons.count(), 2);
  for (const button of await buttons.all()) assert.equal(await button.isDisabled(), true);
}

test('config save errors: write failures keep edits visible and allow a retry', async (t) => {
  let attempts = 0;
  const { page, writes } = await open(t, {
    put: (route) =>
      ++attempts === 1
        ? route.fulfill({ status: 500, json: { error: 'failed to save config' } })
        : route.fulfill({ json: customized }),
  });
  const size = page.locator('input[type="number"]').first();
  await page.getByRole('button', { name: 'Lưu', exact: true }).first().waitFor({ state: 'visible' });
  await size.fill('320');
  await save(page);
  await page
    .getByText(
      'Không lưu được cấu hình, hãy kiểm tra kết nối dịch vụ, quyền ghi thư mục cấu hình hoặc nhật ký dịch vụ.',
      { exact: true },
    )
    .first()
    .waitFor();
  assert.equal(await page.getByText('Không tải được cấu hình', { exact: true }).count(), 0);
  assert.equal(await size.inputValue(), '320');
  await save(page);
  await page.getByText('Đã lưu, pet áp dụng ngay.', { exact: true }).first().waitFor();
  assert.equal(writes[1].pets[0].size, 320);
});

test('config save errors: validation failures explain the rejected configuration', async (t) => {
  const { page } = await open(t, {
    put: (route) => route.fulfill({ json: { ok: false, reason: 'bad-request', message: 'invalid pet config' } }),
  });
  await save(page);
  await page
    .getByText('Không lưu được cấu hình: nội dung không hợp lệ, hãy kiểm tra rồi thử lại.', { exact: true })
    .first()
    .waitFor();
});

test('config save errors: network failures display a save error and release the button', async (t) => {
  const { page } = await open(t, { put: (route) => route.abort('failed') });
  await page.getByRole('button', { name: 'Lưu', exact: true }).first().click();
  await page
    .getByText(
      'Không lưu được cấu hình, hãy kiểm tra kết nối dịch vụ, quyền ghi thư mục cấu hình hoặc nhật ký dịch vụ.',
      { exact: true },
    )
    .first()
    .waitFor();
  assert.equal(await page.getByRole('button', { name: 'Lưu', exact: true }).first().isEnabled(), true);
});

test('config save errors: sync failures use the sync message', async (t) => {
  const { page } = await open(t, { post: (route) => route.fulfill({ status: 500, json: { error: 'write failed' } }) });
  await page.getByRole('button', { name: 'Đồng bộ', exact: true }).click();
  await page.getByRole('button', { name: 'Đồng bộ', exact: true }).last().click();
  await page
    .getByText('Không đồng bộ được cấu hình, hãy kiểm tra kết nối dịch vụ và quyền ghi thư mục cấu hình.', {
      exact: true,
    })
    .first()
    .waitFor();
});

test('pending config prevents editing and saving placeholder defaults', async (t) => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const { page, writes } = await open(t, {
    get: async (route) => {
      await pending;
      await route.fulfill({ json: customized });
    },
  });
  try {
    await assertSaveDisabled(page);
    assert.equal(await page.locator('input[type=text]').first().isDisabled(), true);
    assert.deepEqual(writes, []);
  } finally {
    release();
  }
});

for (const failure of ['http', 'network', 'malformed', 'null']) {
  test(`failed config (${failure}) is visible, blocks Save and can be retried`, async (t) => {
    let fail = true;
    const { page, writes } = await open(t, {
      get: (route) =>
        !fail
          ? route.fulfill({ json: customized })
          : failure === 'network'
            ? route.abort()
            : route.fulfill(
                failure === 'http' ? { status: 503, body: 'unavailable' } : { json: failure === 'null' ? null : {} },
              ),
    });
    await page.getByRole('alert').waitFor();
    await assertSaveDisabled(page);
    assert.deepEqual(writes, []);
    fail = false;
    await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
    await save(page);
    assert.equal(writes.length, 1);
    for (const [key, value] of Object.entries(customized.main)) assert.deepEqual(writes[0][key], value, key);
  });
}

test('Sync updates all controls so a subsequent Save preserves the restored defaults', async (t) => {
  const { page, writes } = await open(t);
  await save(page);
  assert.equal(writes[0].chatMemoryRounds, 19);
  await page.getByRole('button', { name: 'Đồng bộ', exact: true }).click();
  await page.getByRole('button', { name: 'Đồng bộ', exact: true }).last().click();
  await save(page);
  assert.equal(writes.length, 2);
  for (const [key, value] of Object.entries(defaults.main)) assert.deepEqual(writes[1][key], value, key);
});

test('fresh config refreshes the pet list instead of saving an old bridge snapshot', async (t) => {
  const fresh = { main: { ...customized.main, pets: [{ ...pet, name: 'Updated elsewhere', size: 360 }] } };
  const { page, writes } = await open(t, { get: fresh });
  await save(page);
  assert.deepEqual(writes[0].pets, fresh.main.pets);
});

for (const { label, lang, locale } of [
  { label: 'default browser', locale: 'en-US' },
  { label: 'Vietnamese browser', locale: 'vi-VN' },
  { label: 'English host', lang: 'en', locale: 'en-US' },
  { label: 'Chinese host', lang: 'zh', locale: 'zh-CN' },
  { label: 'Vietnamese host', lang: 'vi', locale: 'en-US' },
  { label: 'unknown host fallback', lang: 'und', locale: 'en-US' },
]) {
  test(`settings always render Vietnamese (${label})`, async (t) => {
    const { page } = await open(t, { lang, locale });
    await page.getByRole('button', { name: 'Lưu', exact: true }).first().waitFor();
    await page.getByRole('button', { name: 'Đồng bộ', exact: true }).waitFor();
    await page.getByText('Thông báo hệ thống', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => navigator.language), locale);
    for (const name of ['Save', 'Sync', '保存', '同步']) {
      assert.equal(await page.getByRole('button', { name, exact: true }).count(), 0, name);
    }
  });
}

test('Vietnamese diacritics survive form editing and saving on a narrow viewport', async (t) => {
  const { page, writes } = await open(t, { locale: 'vi-VN', viewport: { width: 360, height: 800 } });
  const name = 'Cá voi nhỏ — Đặng Thị Mỹ, ắ ậ ệ ộ ớ ợ ứ ự';
  const input = page.locator('input[type="text"]').first();
  await input.fill(name);
  await save(page);
  await page.getByText('Đã lưu, pet áp dụng ngay.', { exact: true }).first().waitFor();
  assert.equal(await input.inputValue(), name);
  assert.equal(writes[0].pets[0].name, name);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
});

test('default pet font renders Vietnamese accents instead of missing-glyph boxes', async (t) => {
  const { page } = await open(t, { locale: 'vi-VN' });
  const missing = await page.evaluate(async () => {
    const stack = getComputedStyle(document.documentElement).getPropertyValue('--fixture-pet-font').trim();
    const accented =
      'ĐđĂăÂâÊêÔôƠơƯư' + Array.from({ length: 90 }, (_, index) => String.fromCodePoint(0x1ea0 + index)).join('');
    const font = `48px ${stack}`;
    await document.fonts.load(font, accented);
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 100;
    const context = canvas.getContext('2d');
    context.font = font;
    const raster = (text) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillText(text, 4, 70);
      return Array.from(context.getImageData(0, 0, canvas.width, canvas.height).data).join(',');
    };
    const absent = raster(String.fromCodePoint(0x10ffff));
    const blank = raster('');
    return [...accented].filter((character) => {
      const actual = raster(character);
      return actual === absent || actual === blank;
    });
  });
  assert.deepEqual(missing, [], 'Vietnamese accents must have visible glyphs through the default font stack');
});

for (const lang of ['en', 'zh', 'vi']) {
  for (const width of [320, 360, 520, 900]) {
    test(`settings keep controls and toggle labels readable (${lang}, ${width}px)`, async (t) => {
      const { page } = await open(t, { viewport: { width, height: 800 }, lang });
      await page.getByRole('button', { name: 'Lưu', exact: true }).first().waitFor();
      assert.ok((await page.locator('.dsh-pet-cfg__toggle>label>span').count()) > 0);
      const clipped = await page
        .locator('.dsh-pet-cfg__toggle>label>span')
        .evaluateAll((labels) =>
          labels.filter((label) => label.scrollWidth > label.clientWidth).map((label) => label.textContent),
        );
      assert.deepEqual(clipped, []);
      if (process.env.DSH_PET_UI_ARTIFACTS) {
        mkdirSync(process.env.DSH_PET_UI_ARTIFACTS, { recursive: true });
        await page.screenshot({
          path: join(process.env.DSH_PET_UI_ARTIFACTS, 'settings-' + lang + '-' + width + '.png'),
          fullPage: true,
        });
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    });
  }
}

test('model picker remains anchored while the responsive settings panel is scrolled', async (t) => {
  const { page, writes } = await open(t, { viewport: { width: 900, height: 700 } });
  const trigger = page.locator('.dsh-pet-mp__trigger').first();
  await trigger.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  const scrollStart = await page.evaluate(() => window.scrollY);
  await trigger.click();
  const panel = page.getByRole('menu');
  await panel.waitFor();
  for (const scrollY of [scrollStart, scrollStart + 120]) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForFunction(() => {
      const trigger = document.querySelector('.dsh-pet-mp__trigger').getBoundingClientRect();
      const panel = document.querySelector('.dsh-pet-mp__panel').getBoundingClientRect();
      const anchored = Math.min(Math.abs(panel.top - trigger.bottom - 4), Math.abs(trigger.top - panel.bottom - 4)) < 2;
      return Math.abs(panel.left - trigger.left) < 2 && anchored && panel.top >= 0 && panel.bottom <= innerHeight;
    });
  }
  await page.getByRole('menuitemradio', { name: 'Theo cuộc trò chuyện hiện tại' }).click();
  await save(page);
  assert.deepEqual(writes[0].whisperModel, { provider: '', model: '' });
});
