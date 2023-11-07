import { MessageInteraction } from 'interactions/message';

/**
 *
 * 쿼리키 페이징 처리
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, ...params: string[]) => {
    const { user, guild_id } = interaction;
    const [page, key] = params;
    console.log('컴포넌트 수신', params);

    interaction.model({
        title: '33] 컴포넌트 수정',
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        label: '이름',
                        style: 1,
                        value: '결제정보 추가',
                        required: true,
                        custom_id: 'name',
                        max_length: 100,
                        min_length: 1,
                    },
                ],
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        label: '아이디',
                        style: 1,
                        value: 'payment add',
                        required: false,
                        custom_id: 'custom_id',
                        max_length: 100,
                        min_length: 0,
                    },
                ],
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        label: '값',
                        style: 1,
                        value: '',
                        required: false,
                        custom_id: 'value',
                        max_length: 100,
                        min_length: 0,
                    },
                ],
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        label: '최소값',
                        style: 1,
                        value: '',
                        required: false,
                        custom_id: 'min_values',
                    },
                ],
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        label: '최대값',
                        style: 1,
                        value: '',
                        required: false,
                        custom_id: 'max_values',
                    },
                ],
            },
        ],
        custom_id: 'base 33',
    });
};
