import { selectQnaTypes } from 'controllers/guild/qna';
import { MessageInteraction } from 'interactions/message';
import { createTextShortInput } from 'utils/discord/component';
import { ParseInt } from 'utils/object';

/**
 * 질문/답변을 신고합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, qnaId: string, typeId: string) => {
    const { user, member, guild_id, message, channel } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.

    const { permissions } = member;

    const [item] = await selectQnaTypes(ParseInt(typeId));
    if (!item) return null;

    interaction.model({
        title: '문제 신고',
        custom_id: `qna report ${qnaId} ${typeId}`,
        components: [
            createTextShortInput('title', {
                label: '신고내용',
                placeholder: '신고내용을 입력 해 주세요.',
                min_length: 1,
                max_length: 100,
                required: true,
            }),
            createTextShortInput('1', {
                label: '안내',
                value: `
해당 내용은, 관리자에게 전달되며, 신고내용에 대한 답변은 이루어지지 않습니다.
신고하신 내용은 내부 검토 후, 적절한 조치가 이루어질 수 있습니다.
                `,
                placeholder: '-',
                min_length: 1,
                max_length: 1000,
                required: false,
            }),
        ],
    });
};
