import { PermissionFlagsBits } from 'discord-api-types/v10';
import { createChatinputCommand } from 'utils/discord/component';

const api = createChatinputCommand(
    {
        description: '디스코드 기능을 사용할 수 있는 명령어입니다.',
        default_member_permissions: `${PermissionFlagsBits.ManageChannels}`,
        dm_permission: false,
    },
    __filename
);

// 인터렉션 이벤트
export default api;
