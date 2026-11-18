/**
 * 内置实现的音色清单：provider 内的 id、展示元数据与默认值。
 *
 * 这里只是 edge 这一个实现声明自己有哪些嗓子；第三方各自的清单随注册一起提交，
 * 对外的限定 id 由注册表统一拼，本文件不参与。
 * @module dsh-pet/src/host/voice/voices
 */

/** 一个可选音色；`id` 是 edge 服务端的 short name，其余字段只用于展示。 */
export interface VoiceInfo {
  readonly id: string;
  readonly name: string;
  readonly tag: string;
  readonly default: boolean;
}

/** 内置越南语音色及兼容既有配置的中文音色；恰好一个标记为默认。 */
export const VOICES: readonly VoiceInfo[] = [
  { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My', tag: 'Nữ · tiếng Việt', default: true },
  { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh', tag: 'Nam · tiếng Việt', default: false },
  { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao', tag: 'Nữ · Phổ thông · tiếng Trung', default: false },
  { id: 'zh-CN-XiaoyiNeural', name: 'Xiaoyi', tag: 'Nữ · Năng động · tiếng Trung', default: false },
  { id: 'zh-CN-YunxiNeural', name: 'Yunxi', tag: 'Nam · Trẻ trung · tiếng Trung', default: false },
  { id: 'zh-CN-YunjianNeural', name: 'Yunjian', tag: 'Nam · Trầm ổn · tiếng Trung', default: false },
];

/** 默认音色 id；内置实现用它做 ensure 的探针，必须与 {@link VOICES} 里 `default` 标记的那个一致。 */
export const DEFAULT_VOICE = 'vi-VN-HoaiMyNeural';
