import { selectQnaTypesByMenu } from 'controllers/guild/qna';
import { MessageInteraction } from 'interactions/message';
import { createTextParagraphInput, createTextShortInput } from 'utils/discord/component';

/**
 * 질문을 생성 합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, typeId: string) => {
    const { user, member, guild_id } = interaction;
    const userId = user?.id || member?.user.id; // 사용자 ID

    if (!guild_id) return; // 길드만 가능한 명령어 입니다.

    const list = await selectQnaTypesByMenu(); // 옵션 리스트

    const item = list.find(item => item.value === typeId);
    if (!item) return null;

    interaction.model({
        title: '어떤점이 궁금한가요?',
        custom_id: `qna write ${typeId}`,
        components: [
            createTextShortInput('title', {
                label: '제목',
                placeholder: '제목 요약을 입력 해 주세요.',
                min_length: 1,
                max_length: 100,
                required: true,
            }),
            createTextParagraphInput('content', {
                label: '내용',
                placeholder: '내용을 입력 해 주세요.',
                min_length: 1,
                required: true,
            }),
            createTextShortInput('1', {
                label: '설명',
                value: `해당 내용은, ${item.description}`,
                placeholder: '-',
                min_length: 1,
                max_length: 1000,
                required: false,
            }),
        ],
    });
};
