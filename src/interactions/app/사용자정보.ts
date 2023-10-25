import { ApplicationCommandType, RESTPatchAPIApplicationCommandJSONBody } from 'discord-api-types/v10';
import { appInteraction } from 'interactions/app';
import { basename } from 'path';

import { tokens, userAuthState } from 'controllers/auth';
import moment from 'moment';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandType.User;

export const exec = async (interaction: appInteraction) => {
    if (interaction.type !== type) return; // 유저 커맨드만
    const { target_id } = interaction;

    try {
        await interaction.reply({
            content: `사용자 <@${target_id}>님의 정보를 불러오는중....`,
        });

        console.log(`사용자 ${target_id}님의 정보를 불러오는중....`);

        const user = (await tokens(target_id, 2, 3)).map(({ login, name, is_session, create_at }) => ({
            login,
            name,
            is_session,
            create_at,
        }));

        const authState = await userAuthState(target_id);

        await interaction.reply({
            content: `사용자 <@${target_id}>님의 정보를 불러왔어요!
\`\`\`ansi
${user
    .slice(0, 10)
    .map(({ login, name, is_session, create_at }) =>
        is_session == 'Y'
            ? `[0;34m឵${name}(${login})[0m឵ - ${moment(create_at).format('YYYY년MMMDo')}`
            : `[0;37m឵${name}(${login})[0m឵ - ${moment(create_at).format('YYYY년MMMDo')} (세션이 끊김)`
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

const api: RESTPatchAPIApplicationCommandJSONBody = {
    name,
    type,
    dm_permission: false,
};

// 인터렉션 이벤트
export default api;
