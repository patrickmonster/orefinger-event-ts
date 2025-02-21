import { upsertDiscordUserAndJWTToken, userIds } from 'controllers/auth';
import { AppChatInputInteraction } from 'fastify-discord';
import { SelectOptionType } from 'interactions/app';
import { createButtonArrays, createChatinputCommand, createUrlButton } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { member, user } = interaction;

    await interaction.differ({ ephemeral: true });

    const apiUser = member?.user || user;

    if (!apiUser)
        return await interaction.reply({
            content: `잘못된 접근 방식 입니다.`,
            ephemeral: true,
        });

    const auths = await userIds(apiUser.id);

    console.log(auths);

    if (!auths.length)
        return await interaction.reply({
            content: `인증을 불러오지 못하였습니다.`,
            ephemeral: true,
        });

    const jwt = await upsertDiscordUserAndJWTToken(apiUser);

    await interaction.reply({
        components: createButtonArrays(
            ...auths.map(auth =>
                createUrlButton(`https://orefinger.click/discord/jwt?code=${jwt}&target=${auth.auth_type}`, {
                    label: `${auth.tag_kr}]${auth.user_id ? `${auth.name}(${auth.login})` : '계정 연결하기'}`,
                })
            )
        ),
    });
};

const api = createChatinputCommand(
    {
        description: '연결된 계정을 관리 합니다.',
    },
    __filename
);

// 인터렉션 이벤트
export default api;
