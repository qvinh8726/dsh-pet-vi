'use strict';
/** 只翻译 Electron 默认菜单的标签，保留每个条目的 role、快捷键与点击行为。 */
const ROLE_LABELS = {
  about: 'Giới thiệu DSH Pet Việt',
  appmenu: 'DSH Pet Việt',
  filemenu: 'Tệp',
  editmenu: 'Chỉnh sửa',
  viewmenu: 'Hiển thị',
  windowmenu: 'Cửa sổ',
  help: 'Trợ giúp',
  close: 'Đóng cửa sổ',
  quit: 'Thoát',
  undo: 'Hoàn tác',
  redo: 'Làm lại',
  cut: 'Cắt',
  copy: 'Sao chép',
  paste: 'Dán',
  pasteandmatchstyle: 'Dán theo định dạng hiện tại',
  delete: 'Xóa',
  selectall: 'Chọn tất cả',
  reload: 'Tải lại',
  forcereload: 'Buộc tải lại',
  toggledevtools: 'Bật hoặc tắt công cụ phát triển',
  resetzoom: 'Cỡ hiển thị ban đầu',
  zoomin: 'Phóng to',
  zoomout: 'Thu nhỏ',
  togglefullscreen: 'Bật hoặc tắt toàn màn hình',
  minimize: 'Thu nhỏ cửa sổ',
  zoom: 'Phóng to cửa sổ',
  front: 'Đưa tất cả cửa sổ ra trước',
  window: 'Cửa sổ',
  services: 'Dịch vụ',
  hide: 'Ẩn DSH Pet Việt',
  hideothers: 'Ẩn ứng dụng khác',
  unhide: 'Hiện tất cả',
  startspeaking: 'Bắt đầu đọc',
  stopspeaking: 'Dừng đọc',
  recentdocuments: 'Tài liệu gần đây',
  clearrecentdocuments: 'Xóa danh sách gần đây',
};
const TOP_LABELS = { File: 'Tệp', Edit: 'Chỉnh sửa', View: 'Hiển thị', Window: 'Cửa sổ', Help: 'Trợ giúp' };

/** 原位更新现有菜单，不创建或移除功能项。 */
function localizeApplicationMenu(menu) {
  for (const item of menu?.items || []) {
    const translated = ROLE_LABELS[String(item.role || '').toLowerCase()] || TOP_LABELS[item.label];
    if (translated) item.label = translated;
    if (item.submenu) localizeApplicationMenu(item.submenu);
  }
  return menu;
}

module.exports = { localizeApplicationMenu };
