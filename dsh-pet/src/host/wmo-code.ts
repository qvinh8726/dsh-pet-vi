/** WMO 天气码 → 中文短语；表里没有的码返回“未知天气”，不猜。 */

/** 码 → 中文；只收 Open-Meteo 的 current / daily 会用到的那些码。 */
const TEXT_BY_CODE: Record<number, string> = {
  0: 'trời quang',
  1: 'trời quang, ít mây',
  2: 'nhiều mây',
  3: 'trời âm u',
  45: 'sương mù',
  48: 'sương mù đóng băng',
  51: 'mưa phùn nhẹ',
  53: 'mưa phùn',
  55: 'mưa phùn dày',
  56: 'mưa phùn băng giá',
  57: 'mưa phùn băng giá dày',
  61: 'mưa nhỏ',
  63: 'mưa vừa',
  65: 'mưa to',
  66: 'mưa băng giá',
  67: 'mưa băng giá nặng hạt',
  71: 'tuyết rơi nhẹ',
  73: 'tuyết rơi vừa',
  75: 'tuyết rơi dày',
  77: 'hạt tuyết',
  80: 'mưa rào nhẹ',
  81: 'mưa rào',
  82: 'mưa rào lớn',
  85: 'mưa tuyết rào nhẹ',
  86: 'mưa tuyết rào lớn',
  95: 'mưa dông',
  96: 'mưa dông kèm mưa đá',
  99: 'mưa dông lớn kèm mưa đá',
};

/**
 * 天气码换中文。
 * @param code - WMO 4677 天气码。
 * @returns 对应说法；未收录的码返回“未知天气”。
 */
export function wmoText(code: number): string {
  return TEXT_BY_CODE[code] ?? 'không rõ thời tiết';
}
