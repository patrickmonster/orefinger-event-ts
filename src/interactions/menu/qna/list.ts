import { editerComponent } from 'components/systemComponent';
import { selectEmbedUserDtilByEmbed } from 'controllers/embed';
import { selectQnaTypesByMenu } from 'controllers/guild/qna';
import { MessageMenuInteraction } from 'fastify-discord';
import { createStringSelectMenu, createSuccessButton } from 'utils/discord/component';

/*
1. 사용 가능한 데시보들를 출력함
2. 데시보드를 선택하면 해당 데시보드의 정보를 출력함
3. 해당 데시보드의 정보를 수정할 수 있음
4. 수정된 정보를 저장할 수 있음
*/

/**
 *
 * 질문 응답 데시보드 설정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        values: [embed_id],
        guild_id,
    } = interaction;

    if (!guild_id) return;
    const { embed } = await selectEmbedUserDtilByEmbed(embed_id);
    const list = await selectQnaTypesByMenu(); // 옵션 리스트

    const id = `qna edit ${embed_id}`;
    interaction.reply({
        ephemeral: true,
        content: `
질문 응답 보드를 수정합니다
        `,
        embeds: embed ? [embed] : undefined,
        components: [
            editerComponent(
                id,
                [
                    createSuccessButton(`${id} reload`, {
                        label: '새로고침',
                    }),
                ],
                true
            ),
            createStringSelectMenu(`${id} print`, {
                max_values: 5,
                placeholder: '출력할 버튼 타입을 선택해 주세요',
                options: list,
            }),
        ],
    });
};
