import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody, RESTPatchAPIApplicationCommandJSONBody } from 'discord-api-types/v10';
import { appInteraction } from 'interactions/app';
import { basename } from 'path';

import authTokenSelect from 'components/authTokenSelect';
import { getUser } from 'components/twitch';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandType.User;

export const exec = (interaction: appInteraction) => {
    if (interaction.type !== type) return; // 유저 커맨드만
    const { target_id } = interaction;

    authTokenSelect(target_id, 'select nick', 2, 3)
        .then(async user => {
            if (Array.isArray(user)) {
                // 선택지
                interaction.re({
                    components: user,
                });
            } else {
                const [user_profile] = await getUser(target_id);
                const { display_name, login } = user_profile;
                // TODO: 닉네임 변경 선택지 구현
            }
        })
        .catch(err => {
            interaction.re({
                content: '해당하는 사용자는 로그인을 하지 않았어요!',
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
