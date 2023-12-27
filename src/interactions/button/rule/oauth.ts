import { MessageInteraction } from 'interactions/message';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { copyComponent } from 'controllers/component';
import {
    selectEmbedUserBaseEditByModel,
    selectEmbedUserBaseEditByModel2,
    selectEmbedUserDtilByEmbed,
    upsertEmbedUser,
} from 'controllers/embed';

import QUERY from 'controllers/component/embedListQuerys';
import { getAuthbordeList } from 'controllers/guild/authDashbord';
import authTokenSelect from 'components/authTokenSelect';
import giveRoleAndNick from 'components/giveRoleAndNick';
/**
 *
 * 인증 - OAuth2.0
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, type_id: string) => {
    const { user, member, guild_id } = interaction;
    const user_id = user?.id || member?.user.id; // 사용자 ID

    if (!guild_id) return; // 길드만 가능한 명령어 입니다.

    await interaction.differ({ ephemeral: true });

    await authTokenSelect(user_id || '0', `select rule ${type_id}`, Number(type_id)).then(async user => {
        if (Array.isArray(user)) {
            interaction.reply({
                components: user,
            });
        } else {
            console.log('user', user);
            await giveRoleAndNick(interaction, {
                guild_id: guild_id,
                auth_id: user.auth_id,
                user_id: user.user_id,
                type: type_id,
            });
        }
    });
};
