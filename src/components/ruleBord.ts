import { selectEmbedUserDtilByEmbed, upsertEmbedUser } from 'controllers/embed';
import { getAuthbordeList, upsertAuthBorde } from 'controllers/guild/authDashbord';
import { APISelectMenuDefaultValue, SelectMenuDefaultValueType } from 'discord-api-types/v10';
import { MessageInteraction } from 'interactions/message';
import {
    createActionRow,
    createPrimaryButton,
    createRoleSelectMenu,
    createSecondaryButton,
    createSuccessButton,
} from 'utils/discord/component';
import { editerComponent } from './systemComponent';

export const selectEmbedAuthBord = async (interaction: MessageInteraction, guild_id: string, auth_type: string) => {
    const { user, member } = interaction;
    const user_id = user?.id || member?.user.id;
    const [role] = await getAuthbordeList(guild_id, Number(auth_type));
    if (!role) return interaction.reply({ content: '해당 데시보드를 찾을 수 없습니다.', ephemeral: true });

    let result = await selectEmbedUserDtilByEmbed(role.embed_id);
    const id = `rules edit ${auth_type}`;

    if (!result) {
        await interaction.differ({ ephemeral: true });

        const { insertId } = await upsertEmbedUser({
            use_yn: 'N',
            title: '규칙을 확인해주세요!',
            description: `해당 서버는, 2단계(OAuth2.0)인증을 지원하여 쾌적환 환경을 만들기 위하여 노력 하고 있습니다!`,
            create_user: user_id,
        });

        await upsertAuthBorde(
            {
                embed_id: `${insertId}`,
            },
            {
                guild_id,
                type: auth_type,
            }
        );

        result = await selectEmbedUserDtilByEmbed(`${insertId}`);
        if (!result) return interaction.reply({ content: '해당 데시보드를 찾을 수 없습니다.', ephemeral: true });
    }
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
                    // createDangerButton(`${id} delete`, {
                    //     label: '데시보드 삭제',
                    // }),
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
                placeholder: '역할 선택(선택하지 않거나, 역활이 높으면 에러발생)',
                max_values: 1,
                min_values: 1,
            }),
        ],
    });
};
