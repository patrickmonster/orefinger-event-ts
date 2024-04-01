import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    //
};

const api = createChatinputCommand(
    {
        description: '투표를 생성합니다.',
    },
    __filename
);

// 인터렉션 이벤트
export default api;
