import { MessageMenuInteraction } from 'interactions/message';

import { editerComponent } from 'components/systemComponent';
import { selectEmbedUserDtilByEmbed } from 'controllers/embed';
import { getAuthbordeList } from 'controllers/guild/authDashbord';
import { APISelectMenuDefaultValue, SelectMenuDefaultValueType } from 'discord-api-types/v10';
import {
    createActionRow,
    createDangerButton,
    createPrimaryButton,
    createRoleSelectMenu,
    createSecondaryButton,
    createSuccessButton,
} from 'utils/discord/component';

/**
 *
 * 사용자 소셜 로그인 데시보드 설정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        values: [auth_type],
        guild_id,
    } = interaction;

    if (!guild_id) return;
    const [role] = await getAuthbordeList(guild_id, Number(auth_type));
    if (!role) return interaction.reply({ content: '해당 데시보드를 찾을 수 없습니다.', ephemeral: true });

    const result = await selectEmbedUserDtilByEmbed(role.embed_id);
    const id = `rules edit ${auth_type}`;

    if (result) {
        const { embed, content } = result;
        interaction.reply({
            content,
            embeds: [embed],
            ephemeral: true,
            components: [
                editerComponent(
                    id,
                    [
                        createSuccessButton(`${id} print`, {
                            label: '데시보드 출력하기',
                        }),
                        createPrimaryButton(`${id} reload`, {
                            label: '미리보기 새로고침',
                        }),
                        createSecondaryButton(`${id} nick`, {
                            label: '닉네임 형식 변경',
                        }),
                        createDangerButton(`${id} delete`, {
                            label: '데시보드 삭제',
                        }),
                    ],
                    true
                ),
                createActionRow(
                    createPrimaryButton(`${id} notice`, {
                        label: '인증 알림 설정(사용자가 인증시 최초 1회 출력합니다)',
                    })
                ),
                createRoleSelectMenu(`rules edit ${auth_type}`, {
                    default_values: [
                        {
                            id: role.role_id,
                            type: SelectMenuDefaultValueType.Role,
                        },
                    ].filter(v => v.id) as APISelectMenuDefaultValue<SelectMenuDefaultValueType.Role>[],
                    placeholder: '역할 선택',
                    max_values: 1,
                    min_values: 1,
                }),
            ],
        });
    } else {
        interaction.reply({
            content: `게시판이 없습니다! \n게시판을 생성해주세요(생성하지 않는 경우, 버튼만 생성 됩니다.)`,
            ephemeral: true,
            components: [
                createActionRow(
                    createPrimaryButton(`rules create ${auth_type}`, {
                        label: '새로만들기',
                    })
                ),
                createRoleSelectMenu(id, {
                    default_values: [
                        {
                            id: role.role_id,
                            type: SelectMenuDefaultValueType.Role,
                        },
                    ].filter(v => v.id) as APISelectMenuDefaultValue<SelectMenuDefaultValueType.Role>[],
                    placeholder: '역할 선택',
                    max_values: 1,
                    min_values: 1,
                }),
            ],
        });
    }
};
