import { MessageMenuInteraction } from 'interactions/message';

import { editerComponent } from 'components/systemComponent';
import { selectEmbedDtilByEmbed, selectEmbedUserDtilByEmbed } from 'controllers/embed';
import {
    APIActionRowComponent,
    APIMessageActionRowComponent,
    APISelectMenuDefaultValue,
    ButtonStyle,
    ComponentType,
    SelectMenuDefaultValueType,
} from 'discord-api-types/v10';
import {
    createActionRow,
    createDangerButton,
    createPrimaryButton,
    createRoleSelectMenu,
    createSuccessButton,
} from 'utils/discord/component';
import { getAuthbordeList } from 'controllers/guild/authDashbord';

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
    const id = `rule edit ${auth_type}`;

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
                        createPrimaryButton(`${id} option`, {
                            label: '보조옵션 수정',
                        }),
                        createSuccessButton(`${id} reload`, {
                            label: '새로고침',
                        }),
                        createDangerButton(`${id} delete`, {
                            label: '삭제',
                        }),
                    ],
                    true
                ),
                createRoleSelectMenu('rule', {
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
            content: `임베드가 없습니다! \n임베드를 생성해주세요(생성하지 않는 경우, 버튼만 생성 됩니다.)`,
            ephemeral: true,
            components: [
                createActionRow(
                    createPrimaryButton(`rule create ${auth_type}`, {
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
