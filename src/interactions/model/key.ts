import { selectComponentPagingMenuKey } from 'components/systemComponent';
import { MessageMenuInteraction } from 'interactions/message';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, target: string, key: string) => {
    const { user } = interaction;

    console.log(values, target, key);

    switch (target) {
        case 'search': // 검색
            // label, value, description
            interaction.reply({
                ephemeral: true,
                components: await selectComponentPagingMenuKey(key, 0, { label: values.value, value: values.value, description: values.value }),
            });
            return;
    }

    interaction.reply({ content: '응답', ephemeral: true });
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
