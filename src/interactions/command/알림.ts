import { PermissionFlagsBits } from 'discord-api-types/v10';
import { createChatinputCommand } from 'utils/discord/component';

const api = createChatinputCommand(
    {
        description: '방송 및 기타 알림을 설정합니다',
        default_member_permissions: `${PermissionFlagsBits.ManageChannels}`,
        dm_permission: false,
    },
    __filename
);

// 인터렉션 이벤트
export default api;
