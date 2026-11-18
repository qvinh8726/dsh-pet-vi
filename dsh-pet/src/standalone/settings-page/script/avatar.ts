/**
 * 宠物头像行：预览当前头像、选图后压缩上传，成功即换版本号刷新预览。
 *
 * 后端就是插件自己的 /logo 与 /pet-avatar——独立模式经 apply() 原样挂载，不另开接口。
 * 超长边的图会先缩到上限再编 PNG；已在上限内则原样上传，透明与动图都不掉。
 * @module dsh-pet/src/standalone/settings-page/script/avatar
 */

/** 生成头像片段所需的常量；两处都取自插件自己的实现，避免第二份真相。 */
export interface AvatarScriptConsts {
  /** 头像读取地址（来自 shared/avatar.ts 的 LOGO_URL）。 */
  readonly logoUrl: string;
  /** 长边上限（来自 client/settings/avatar-upload.ts 的 AVATAR_MAX_SIDE）。 */
  readonly maxSide: number;
}

/** 生成头像片段。 */
export function avatarScript(consts: AvatarScriptConsts): string {
  return `
const AVATAR_LOGO_URL = ${JSON.stringify(consts.logoUrl)};
const AVATAR_MAX_SIDE = ${consts.maxSide};
let avatarVersion = Date.now();

function avatarSrc(assetRoot) {
  const root = String(assetRoot || '').trim();
  const query = root === '' ? '' : 'root=' + encodeURIComponent(root) + '&';
  return AVATAR_LOGO_URL + '?' + query + 'v=' + avatarVersion;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || '');
      resolve(url.slice(url.indexOf(',') + 1));
    };
    reader.onerror = () => reject(new Error('Không đọc được ảnh'));
    reader.readAsDataURL(file);
  });
}

async function encodeAvatar(file) {
  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  if (longest <= AVATAR_MAX_SIDE) return fileToBase64(file);
  const scale = AVATAR_MAX_SIDE / longest;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Trình duyệt không hỗ trợ thu nhỏ ảnh này');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

/**
 * 取头像并渲染。
 *
 * 不能把地址直接放进 img src：同源图片请求不带 Origin，打包版会把它判成文件来源而要令牌，结果是 403 裂图。
 * 所以带令牌 fetch 成 blob 再挂上去；取不到就留空白，预览失败不该挡住其它字段。
 */
async function loadAvatar(image, assetRoot) {
  try {
    const response = await fetch(avatarSrc(assetRoot), {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'X-DSH-Pet-Token': TOKEN },
    });
    if (!response.ok) return;
    const blob = await response.blob();
    const previous = image.dataset.blobUrl;
    if (previous) URL.revokeObjectURL(previous);
    const url = URL.createObjectURL(blob);
    image.dataset.blobUrl = url;
    image.src = url;
  } catch {
    // 预览失败保持空白。
  }
}

async function uploadAvatar(assetRoot, file, result, image) {
  setStatus(result, 'Đang tải lên…');
  try {
    const base64 = await encodeAvatar(file);
    const response = await fetch(API + '/pet-avatar?root=' + encodeURIComponent(assetRoot), {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'X-DSH-Pet-Token': TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64: base64 }),
    });
    if (response.status === 403) throw new Error('Phiên mở trang đã hết hạn. Hãy mở lại cài đặt từ menu của pet.');
    const data = await response.json().catch(() => null);
    if (!data) throw new Error('API trên máy không trả về kết quả, vui lòng thử lại.');
    if (data.ok !== true) throw new Error(data.message || 'Tải lên thất bại');
    // 用自增而不是 Date.now()：同一毫秒内连着传两张时，版本号必须仍然变化。
    avatarVersion += 1;
    await loadAvatar(image, assetRoot);
    setStatus(result, 'Đã cập nhật ảnh đại diện.', 'ok');
  } catch (error) {
    setStatus(result, error && error.message ? error.message : String(error), 'error');
  }
}

function avatarRow(pet) {
  // 条目名就是素材根（/config 的 pets 上没有 assetRoot，那是客户端拍平时补的）。
  const assetRoot = pet.assetRoot || state.entry;
  // pet/ 只归 pet pack：内置条目用包内 logo，只给预览不给上传，与服务端的拒绝保持一致。
  const editable = assetRoot !== 'main';
  const image = make('img', { class: 'avatarImg', alt: 'Ảnh đại diện' });
  void loadAvatar(image, editable ? assetRoot : '');
  const result = make('p', { class: 'status' });
  const children = [
    make('p', {
      class: 'fieldHint',
      text: editable
        ? 'Ảnh đại diện được lưu theo thư mục tài nguyên, các pet cùng thư mục tài nguyên dùng chung một ảnh; hỗ trợ PNG / JPEG / WebP / GIF, cạnh dài vượt quá ' + AVATAR_MAX_SIDE + ' sẽ tự thu nhỏ.'
        : 'Mục có sẵn luôn dùng logo trong gói, không đổi riêng được; muốn đổi ảnh đại diện cho pet dạng file, hãy chuyển sang mục chứa pet đó.',
    }),
  ];
  if (editable) {
    const input = make('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', hidden: true });
    const upload = make('button', { class: 'btn', type: 'button', text: 'Tải ảnh đại diện lên' });
    upload.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (file) void uploadAvatar(assetRoot, file, result, image);
    });
    children.push(upload, input);
  }
  children.push(result);
  return make('div', { class: 'avatarRow' }, [image, make('div', { class: 'avatarBox' }, children)]);
}
`;
}
