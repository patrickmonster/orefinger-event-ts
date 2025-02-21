import { AppChatInputInteraction } from 'fastify-discord';
import { SelectOptionType } from 'interactions/app';
import { createActionRow, createChatinputCommand, createUrlButton } from 'utils/discord/component';

const { version } = require('../../../package.json');

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    interaction.reply({
        components: [
            createActionRow(
                createUrlButton('http://pf.kakao.com/_xnTkmG/chat', { label: '문의하기' }),
                createUrlButton('https://orefinger.notion.site/', { label: '설정 가이드' })
            ),
        ],
    });
};

const api = createChatinputCommand(
    {
        description: '서비스 상태를 확인합니다.',
    },
    __filename
);

// 인터렉션 이벤트
export default api;
