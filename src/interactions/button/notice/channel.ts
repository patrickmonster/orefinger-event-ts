import { sendTestNotice } from 'components/notice';
import { selectNoticeDetailEditByModel } from 'controllers/notice';
import { MessageInteraction } from 'fastify-discord';
import { createActionRow, createUrlButton } from 'utils/discord/component';

/**
 *
 * 알림 수정 버튼
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, noticeId: string, modeType: string) => {
    const { guild_id, user, member } = interaction;
    const apiUser = member?.user || user;
    if (!guild_id) return;
    switch (modeType) {
        case 'edit': {
            const model = await selectNoticeDetailEditByModel(noticeId, guild_id);

            interaction.model({
                ...model,
                custom_id: `notice edit ${noticeId}`,
            });
            break;
        }
        case 'hook': {
            await interaction.reply({
                content: '결제를 위한 컨텐츠를 생성중입니다...',
                ephemeral: true,
            });

            break;
        }
        case 'test': {
            interaction.differ({ ephemeral: true });
            if (!guild_id) {
                return interaction.reply({
                    content: '서버 정보를 찾을 수 없습니다.',
                    ephemeral: true,
                });
            }

            try {
                console.log('sendTestNotice', noticeId, guild_id);

                await sendTestNotice(noticeId, guild_id);
                interaction.reply({
                    content: '알림이 전송되었습니다.',
                    ephemeral: true,
                });
            } catch (e) {
                console.log('sendTestNotice', e);

                return interaction.reply({
                    content: `\n알림 전송에 실패하였습니다. \n 하단 문서를 확인해 주세요 `,
                    ephemeral: true,
                    components: [
                        createActionRow(
                            createUrlButton('https://orefinger.notion.site/e5856c2d3e6f494e95e1ea5a927f31bf', {
                                label: '문서 확인',
                                emoji: {
                                    name: '📌',
                                },
                            })
                        ),
                    ],
                });
            }

            break;
        }
    }
};
