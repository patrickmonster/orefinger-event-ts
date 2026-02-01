import { selectUser } from 'components/authTokenSelect';
import giveRoleAndNick from 'components/giveRoleAndNick';
import { MessageMenuInteraction } from 'interactions/message';

/**
 *
 * 인증 데시보드 선택
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, type_id: string) => {
    const {
        values: [user_id],
        guild_id,
        user,
        member,
        channel,
    } = interaction;

    await interaction.differ({ ephemeral: true });

    if (!guild_id || !channel)
        return interaction.reply({
            content: '서버 정보 또는 채널 정보를 찾을 수 없습니다.',
            ephemeral: true,
        });

    const apiUser = member?.user || user;
    if (!apiUser)
        return interaction.reply({
            content: '잘못된 접근 방식 입니다.',
            ephemeral: true,
        });

    try {
        console.log('selectUser', user_id, type_id);
        const user = await selectUser(apiUser.id, user_id, Number(type_id));

        giveRoleAndNick(interaction, {
            guild_id: guild_id,
            auth_id: user.auth_id,
            user_id: user.user_id,
            nick: user.name,
            type: type_id,
        }).catch(e => {
            // TODO: 에러 처리
            console.log('e', e);
        });
    } catch (e) {
        console.log('e', e);
        return interaction.reply({
            content: '선택한 사용자 정보를 찾을 수 없습니다.',
            ephemeral: true,
        });
    }
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
