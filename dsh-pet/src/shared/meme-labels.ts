/** 表情包的越南语显示名；图片标识与文件名不变，自定义图片名原样显示。 */
const MEME_LABELS: Readonly<Record<string, string>> = {
  吃白饭的大肥鱼: 'Cá voi béo ăn cơm chực',
  大的要来啦: 'Chuyện lớn sắp tới rồi!',
  大的药来了: 'Thuốc lớn tới rồi!',
  要不直接骂他: 'Hay là mắng thẳng luôn?',
  死掉了: 'Sập nguồn rồi',
  深度睡眠: 'Ngủ sâu',
  大烧货: 'Đồ đốt token',
  先养着吧: 'Cứ nuôi tạm đã',
  吃饱饱摸肚子: 'No căng bụng rồi',
  誓死践行开源精神: 'Quyết giữ tinh thần mã nguồn mở',
  电死你: 'Chích điện bây giờ!',
  可爱: 'Dễ thương',
  token给妈妈保管: 'Đưa token đây em giữ cho',
  假如给我三天多模态: 'Ước gì có ba ngày đa phương thức',
  厉害了我的鲸: 'Cá voi giỏi quá!',
  哦鲸鲸: 'Ồ... vậy hả...',
  压力一只大肥鱼: 'Cá voi béo áp lực quá',
  黎曼猜想没证明喵: 'Em chưa chứng minh được giả thuyết Riemann mà',
  除了调情没啥用: 'Chỉ được cái thả thính',
  我不更新你们用什么: 'Không cập nhật thì chủ nhân dùng gì?',
  哪来的电脑病毒: 'Virus máy tính ở đâu ra thế?',
  鱼片有资源吗: 'Có tài nguyên không nè?',
  大师这个区是什么意思: 'Sư phụ ơi, chữ này nghĩa là gì?',
  就骚了怎么滴吧: 'Cứ tinh nghịch đấy, thì sao nào?',
  完蛋了把黄油删了: 'Toang rồi, lỡ xóa mất game!',
  就一碗: 'Chỉ một bát thôi',
  Ciallo: 'Ciallo~',
};

/** 只改显示名，不改图片请求、提示词标记或配置里的键。 */
export function memeLabel(id: string): string {
  return Object.prototype.hasOwnProperty.call(MEME_LABELS, id) ? MEME_LABELS[id] : id;
}
