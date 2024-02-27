import { searchAfreecabeUser } from 'components/afreecaUser';
import { searchChzzkUser } from 'components/chzzkUser';
import { searchYoutubeUser } from 'components/youtubeUser';
import { APIActionRowComponent, APIMessageActionRowComponent } from 'discord-api-types/v10';
import { MessageMenuInteraction } from 'interactions/message';
import {
    createActionRow,
    createDangerButton,
    createStringSelectMenu,
    createSuccessButton,
} from 'utils/discord/component';

const hashIdChzzk = new RegExp('^[a-zA-Z0-9]{32}$');

const searchUser = async (
    keyword: string,
    noticeType: string
): Promise<APIActionRowComponent<APIMessageActionRowComponent>[]> => {
    let list: Array<{ name: string; value: string }> = [];
    switch (noticeType) {
        case '2': {
            list = await searchYoutubeUser(keyword);
            break;
        }
        case '4': {
            list = await searchChzzkUser(keyword);
            break;
        }
        case '5': {
            list = await searchAfreecabeUser(keyword);
            break;
        }
        default:
            return [
                createActionRow(
                    createDangerButton(`not found`, {
                        emoji: { name: '❗' },
                        label: `해당하는 알림은 사용할 수 없습니다.`,
                        disabled: true,
                    })
                ),
            ];
    }

    if (!list.length) {
        return [
            createActionRow(
                createDangerButton(`not found`, {
                    emoji: { name: '❗' },
                    label: `검색결과가 없습니다.`,
                    disabled: true,
                }),
                createSuccessButton(`notice add ${noticeType} 1`, {
                    emoji: { name: '🔍' },
                    label: `재검색`,
                })
            ),
        ];
    }

    return [
        createStringSelectMenu(`notice add ${noticeType}`, {
            placeholder: '원하시는 사용자를 선택해주세요.',
            options: list.map(({ name, value }) => ({ label: name, value })),
            max_values: 1,
            min_values: 1,
        }),
        createActionRow(
            createSuccessButton(`notice add ${noticeType} 1`, {
                emoji: { name: '🔍' },
                label: `재검색`,
            })
        ),
    ];
};
/**
 * 사용자를 검색합니다
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, noticeType: string) => {
    const { value } = values;

    interaction.reply({
        content: '검색결과',
        ephemeral: true,
        components: await searchUser(value, noticeType),
    });
};
