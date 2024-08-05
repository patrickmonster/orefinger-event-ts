import { PermissionFlagsBits } from 'discord-api-types/v10';
import { createChatinputCommand } from 'utils/discord/component';

const api = createChatinputCommand(
    {
        description: '포인트를 관리 합니다.',
        default_member_permissions: `${PermissionFlagsBits.ViewChannel}`,
        dm_permission: true,
    },
    __filename
);

// 인터렉션 이벤트
export default api;
