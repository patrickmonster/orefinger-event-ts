import { MessageInteraction } from 'interactions/message';
import { createUrlButton } from 'utils/discord/component';

/**
 *
 * 쿼리키 페이징 처리
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, ...params: string[]) => {
    const [page, key] = params;
    console.log('구버전 시스템', params);

    interaction.reply({
        content: `
안녕하세요 스트리머님!

방송알리미는 현재 해당 자동 설정 시스템을 지원하지 않게 되었습니다! ㅠㅠ
새로운 시스템을 적용하여
더욱 간편한 설정으로 할 수 있도록 제공하고 있으니,
가이드 문서를 참고해서 설정 부탁 드립니다!

https://orefinger.notion.site/
        `,
        components: [
            {
                type: 1,
                components: [
                    createUrlButton('https://orefinger.notion.site/', {
                        label: '가이드 문서',
                    }),
                ],
            },
        ],
    });
};
