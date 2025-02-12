import { matchAuthNumber } from 'components/sms';
import { MessageMenuInteraction } from 'interactions/message';

const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
/**
 *
 * 인증번호 처리
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, target: string) => {
    const { user, member } = interaction;
    const user_id = user?.id || member?.user.id || '';

    const { authnum } = values;
    let phone = await matchAuthNumber(user_id, authnum);

    if (!phone) {
        // 모달 취소되게끔 수정
        return; // await interaction.reply({ content: '인증번호가 올바르지 않습니다.', ephemeral: true });
    }

    interaction.reply({ content: `인증되었습니다. [${phone}]`, ephemeral: true });
};
