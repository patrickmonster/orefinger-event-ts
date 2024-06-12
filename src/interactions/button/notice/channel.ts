import { getCardList } from 'components/billing';
import { sendTestNotice } from 'components/notice';
import { selectNoticeDetailEditByModel } from 'controllers/notice';
import { MessageInteraction } from 'interactions/message';
import { createActionRow, createUrlButton } from 'utils/discord/component';

/**
 *
 * 알림 수정 버튼
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, noticeId: string, modeType: string) => {
    const { guild_id, user, member } = interaction;
    const apiUser = member?.user || user;
    switch (modeType) {
        case 'edit': {
            const model = await selectNoticeDetailEditByModel(noticeId);

            interaction.model({
                ...model,
                custom_id: `notice edit ${noticeId}`,
            });
            break;
        }
        case 'hook': {
            getCardList(`${apiUser?.id}`, `notice hook ${noticeId}`)
                .then(card => {
                    if (Array.isArray(card)) {
                        interaction.reply({ components: card });
                    } else {
                        // 카드가 한장있는경우
                    }
                })
                .catch(e => {
                    // 카드가 없는경우
                    const apiUser = member?.user || user;

                    interaction.reply({
                        content: '부분 유료화 서비스 입니다. \n 하단 문서를 확인해 주세요',
                        components: [
                            createActionRow(
                                createUrlButton('https://orefinger.notion.site/3c4e7f6b9a9b4e6b8d7a0b3d0e2d4c0b', {
                                    label: '문서 확인',
                                    emoji: {
                                        name: '📌',
                                    },
                                })
                            ),
                        ],
                    });
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
                await sendTestNotice(noticeId, guild_id);
            } catch (e) {
                console.log('sendTestNotice', e);

                return interaction.reply({
                    content: '알림 전송에 실패하였습니다. \n 하단 문서를 확인해 주세요',
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

            interaction.reply({
                content: '알림이 전송되었습니다.',
                ephemeral: true,
            });
            break;
        }
    }
};
