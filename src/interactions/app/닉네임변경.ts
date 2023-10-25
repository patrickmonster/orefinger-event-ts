import { ApplicationCommandType, RESTPatchAPIApplicationCommandJSONBody } from 'discord-api-types/v10';
import { appInteraction } from 'interactions/app';
import { basename } from 'path';

import authTokenSelect from 'components/authTokenSelect';
import { setUserNick } from 'components/discordUser';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandType.User;

export const exec = (interaction: appInteraction) => {
    if (interaction.type !== type) return; // 유저 커맨드만
    const { target_id } = interaction;

    authTokenSelect(target_id, 'select nick', 2, 3)
        .then(async user => {
            if (Array.isArray(user)) {
                console.log('컴포넌트 :', ...user.map(v => v.components));

                await interaction.reply({ components: user });
            } else {
                await setUserNick(target_id, user.user_id);
            }
        })
        .catch(err => {
            interaction.reply({
                content: '해당하는 사용자는 로그인을 하지 않았거나, 관리자에욧!!!',
            });
        });
};

const api: RESTPatchAPIApplicationCommandJSONBody = {
    name,
    type,
    dm_permission: false,
};

// 인터렉션 이벤트
export default api;
