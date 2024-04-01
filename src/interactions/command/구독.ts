import { createChatinputCommand } from 'utils/discord/component';

const api = createChatinputCommand(
    {
        description: '구독 설정을 합니다',
    },
    __filename
);

export default api;
