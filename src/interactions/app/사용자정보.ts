import { appInteraction } from 'interactions/app';

import { tokens, userAuthState } from 'controllers/auth';
import { ApplicationCommandType } from 'discord-api-types/v10';
import moment from 'moment';
import { createMenuinputCommand } from 'utils/discord/component';

export const exec = async (interaction: appInteraction) => {
    if (interaction.type !== ApplicationCommandType.User) return; // 유저 커맨드만
    const { target_id } = interaction;

    try {
        await interaction.reply({
            ephemeral: true,
            content: `사용자 <@${target_id}>님의 정보를 불러오는중....`,
        });

        console.log(`사용자 ${target_id}님의 정보를 불러오는중....`);

        const user = (await tokens(target_id, 2, 3, 5, 12, 13)).map(
            ({ type_kr, login, name, is_session, create_at }) => ({
                type_kr,
                login,
                name,
                is_session,
                create_at,
            })
        );

        const authState = await userAuthState(target_id);

        await interaction.reply({
            content: `사용자 <@${target_id}>님의 정보를 불러왔어요!
\`\`\`ansi
${user
    .slice(0, 10)
    .map(({ type_kr, login, name, is_session, create_at }) =>
        is_session == 'Y'
            ? `[0;34m឵${type_kr}]${name}(${login})[0m឵ - ${moment(create_at).format('YYYY년MMMDo')}`
            : `[0;37m឵${type_kr}]${name}(${login})[0m឵ - ${moment(create_at).format('YYYY년MMMDo')} (세션이 끊김)`
    )
    .join('\n')}\`\`\`
길드 연결 정보
\`\`\`ansi
${authState
    .slice(0, 10)
    .map(({ create_at, tag, name }) => `[0;34m឵${name}[0m឵ - ${tag} (${moment(create_at).format('YYYY년MMMDo')})`)
    .join('\n')}${authState.length > 10 ? `\n외 ${authState.length - 10}개의 채널` : ''}\`\`\``,
        });
    } catch (e) {
        await interaction.reply({
            content: '해당하는 사용자는 로그인을 하지 않았어요!',
        });
    }
};

const api = createMenuinputCommand(
    {
        dm_permission: false,
    },
    __filename
);

// 인터렉션 이벤트
export default api;
