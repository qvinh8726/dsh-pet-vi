/**
 * 设置页字典的唯一出口：命名空间、键类型与全部语言的汇总。
 * zh 是键集真源，每种语言都声明成 `Record<Key, string>`，漏翻一个键在类型检查期就报错。
 * 宿主 0.2.2 起内置 zh / en / ja / es / fr / de / ru / pt 八种语言，其余语言按 `en` 逐键回退。
 * @module dsh-pet/src/client/settings/locales
 */
import { zh } from './zh.ts';

/** 越南语版保留旧语言 id，宿主未知语言的 en 回退也必须显示越南语。 */
export const vi = zh;

/** 字典命名空间。 */
export const NS = 'pet.config';

/** 按宿主语言 id 汇总的字典，整包交给 `ctx.locale.register`。 */
export const dicts = { vi, 'vi-VN': vi, zh: vi, en: vi, ja: vi, es: vi, fr: vi, de: vi, ru: vi, pt: vi };

export { zh } from './zh.ts';
export type { Key } from './zh.ts';
