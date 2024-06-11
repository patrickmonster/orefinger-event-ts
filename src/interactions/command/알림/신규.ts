import { getNoticeDetailByEmbed } from 'components/notice';
import { getAfreecabeUser } from 'components/user/afreeca';
import { getChzzkUser } from 'components/user/chzzk';
import { searchYoutubeUser } from 'components/user/youtube';
import { deleteOrInsertNoticeChannels } from 'controllers/notice';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import {
    createActionRow,
    createChatinputCommand,
    createDangerButton,
    createStringSelectMenu,
    createSuccessButton,
} from 'utils/discord/component';

const StreamChannelRegex =
    /^(http(s):\/\/)(chzzk.naver.com|play.afreecatv.com|bj.afreecatv.com|afreecatv.com|www.youtube.com)(\/channel|\/live)?\/([\w|@]+)/;

// https://play.afreecatv.com/sikhye1004/null
export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id, channel } = interaction;

    if (!guild_id) return;

    const url = selectOption.get('링크');
    const help = selectOption.get('help');
    if (help) {
        // 도움말 출력
        interaction.reply({
            content: `
# 복잡한 절차를 간소화 하기 위한 기능!
 - \`/알림 신규\` 명령어를 통해서, 알림을 손쉽게 추가 해 보세요!

# 지원하는 링크
    - 치지직: https://chzzk.naver.com/...
    - 아프리카: https://[bj,play,www].afreecatv.com/...
    - 유튜브: https://www.youtube.com/@채널명

명령어와 동시에, "알림설정" 및 채널 등록까지 한번에 처리 가능합니다.
            `,
        });
        return;
    }

    if (!url) {
        return interaction.reply({
            content: '링크를 입력해주세요.',
        });
    }

    const data = StreamChannelRegex.exec(`${url}`);

    if (!data) {
        return interaction.reply({
            content: '지원하지 않는 링크입니다.',
        });
    }

    const [, , , domain, , id] = data;

    await interaction.differ({ ephemeral: true });

    let noticeId;
    switch (domain) {
        case 'chzzk.naver.com':
            noticeId = await getChzzkUser(id);
            break;
        case 'play.afreecatv.com':
        case 'bj.afreecatv.com':
        case 'afreecatv.com':
            noticeId = await getAfreecabeUser(id);
            break;
        case 'www.youtube.com':
            const list = await searchYoutubeUser(id);
            // 채널
            interaction.reply({
                content: '검색결과',
                ephemeral: true,
                components: list.length
                    ? [
                          createStringSelectMenu(`notice add 2`, {
                              placeholder: '원하시는 사용자를 선택해주세요.',
                              options: list.map(({ name, value }) => ({ label: name, value })),
                              max_values: 1,
                              min_values: 1,
                          }),
                          createActionRow(
                              createSuccessButton(`notice add 2 1`, {
                                  emoji: { name: '🔍' },
                                  label: `재검색`,
                              })
                          ),
                      ]
                    : [
                          createActionRow(
                              createDangerButton(`not found`, {
                                  emoji: { name: '❗' },
                                  label: `검색결과가 없습니다.`,
                                  disabled: true,
                              }),
                              createSuccessButton(`notice add 2 1`, {
                                  emoji: { name: '🔍' },
                                  label: `재검색`,
                              })
                          ),
                      ],
            });
            return;
    }

    if (!noticeId) {
        return interaction.reply({
            content: '알림을 생성하지 못했습니다. - 사용자를 찾을 수 없습니다.',
        });
    }

    await deleteOrInsertNoticeChannels(noticeId, guild_id, [channel.id]);

    const { embeds, components } = await getNoticeDetailByEmbed(noticeId, guild_id);

    interaction.reply({
        embeds,
        ephemeral: true,
        components,
    });
};

const api = createChatinputCommand(
    {
        description: '소셜 알림을 새로 만듭니다.',
        options: [
            {
                name: '링크',
                description: '소셜 채널 주소를 입력해주세요.',
                type: ApplicationCommandOptionType.String,
            },
            {
                name: 'help',
                description: '도움말을 봅니다.',
                type: ApplicationCommandOptionType.Boolean,
            },
        ],
    },
    __filename
);
export default api;
