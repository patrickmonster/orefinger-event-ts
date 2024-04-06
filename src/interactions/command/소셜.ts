import { PermissionFlagsBits } from 'discord-api-types/v10';
import { createChatinputCommand } from 'utils/discord/component';

const api = createChatinputCommand(
    {
        description: '계정 연동 및 커뮤니티용 명령을 관리합니다',
        default_member_permissions: `${PermissionFlagsBits.ManageChannels}`,
        dm_permission: false,
    },
    __filename
);

// 인터렉션 이벤트
export default api;
