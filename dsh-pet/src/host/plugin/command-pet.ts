/**
 * 斜杠命令 /pet：按 id 或名字切换当前桌宠。
 * @module dsh-pet/src/host/plugin/command-pet
 */
import type { BalancePoll } from './balance-poll.ts';
import type { ChatMemory } from './chat-memory.ts';
import type { HostContext } from './context.ts';

/** 桌宠选择命令的输入。 */
export type CommandPetInput = {
  /** 宿主上下文（apply 收到的那一个）。 */
  ctx: HostContext;
} & Pick<BalancePoll, 'effectivePetList'> &
  Pick<BalancePoll, 'petDisplayName'> &
  Pick<BalancePoll, 'resolveActivePetId'> &
  Pick<ChatMemory, 'setActivePetId'>;

/** 注册桌宠选择命令；返回的清理函数由 ctx.effect 收集。 */
export function registerPetCommand(deps: CommandPetInput): void {
  const { ctx, effectivePetList, petDisplayName, resolveActivePetId, setActivePetId } = deps;
  // /pet 斜杠命令：选择「当前桌宠」（/chat 对话的目标）。浏览器端另有 commandUi 装饰的选择框
  // （裸输 /pet 回车或菜单点选时弹出，选中后提交 /pet <id> 走同一 handler）；手输参数认 id 或名字
  // （name 可重复：唯一命中才认，重名报错列出候选 id）。
  ctx.effect(
    () =>
      ctx.commands.register({
        name: 'pet',
        description: 'Chọn pet (đối tượng trò chuyện của /chat; chọn trong danh sách hoặc gõ id/tên)',
        input: { hint: '[id hoặc tên pet] (để trống để xem pet hiện tại)' },
        handler: ({ rawInput }: { rawInput: string }) => {
          const arg = rawInput.trim();
          let eff: Record<string, unknown>[];
          try {
            eff = effectivePetList();
          } catch {
            eff = [];
          }
          if (!arg) {
            const cur = resolveActivePetId();
            const found = eff.find((p) => String(p.id) === cur);
            return {
              kind: 'success',
              text: 'Pet hiện tại: ' + (found ? petDisplayName(found) : cur || '(không có pet nào để tương tác)'),
            };
          }
          const byId = eff.find((p) => String(p.id) === arg);
          if (byId) {
            setActivePetId(String(byId.id));
            return { kind: 'success', text: 'Đã chọn pet: ' + petDisplayName(byId) };
          }
          const byName = eff.filter((p) => petDisplayName(p) === arg);
          if (byName.length === 1) {
            setActivePetId(String(byName[0].id));
            return { kind: 'success', text: 'Đã chọn pet: ' + petDisplayName(byName[0]) };
          }
          if (byName.length > 1) {
            return {
              kind: 'error',
              text:
                'Có ' +
                byName.length +
                ' pet tên "' +
                arg +
                '" (id: ' +
                byName.map((p) => String(p.id)).join(', ') +
                '), vui lòng chọn bằng id',
            };
          }
          return { kind: 'error', text: 'Không tìm thấy pet "' + arg + '" (nhập id hoặc tên đều được; gõ /pet rồi Enter để mở danh sách chọn)' };
        },
      }),
    'dsh-pet: /pet command',
  );
}
