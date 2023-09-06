import { MessageInteraction } from 'interactions/message';
import { RESTPostAPIChannelMessage } from 'plugins/discord';

import { attendanceList } from 'controllers/twitch';
import { getAdvertisement } from 'controllers/message';

const emote = '0️⃣,1️⃣,2️⃣,3️⃣,4️⃣,5️⃣,6️⃣,7️⃣,8️⃣,9️⃣,🔟'.split(',');

export const exec = async (interaction: MessageInteraction, broadcaster_user_id: string) => {
    const { user } = interaction;

    if (user === null)
        return interaction.deffer(/*{ ephemeral: true }*/).then(async send => send({ content: '처리 불가능한 상태. - 사용자를 찾을 수 없습니다.' }));

    interaction.deffer(/*{ ephemeral: true }*/).then(async send => {
        const advertisement = await getAdvertisement(0); // 광고 로딩

        const list = await attendanceList(0, broadcaster_user_id, `${user?.id}`);

        // if (list.length) {
        //     send({
        //         embeds: [
        //             advertisement,
        //             {
        //                 url: 'https://toss.me/방송알리미',
        //                 color: 0x9147ff,
        //                 footer: {
        //                     text: 'Create by.뚱이(Patrickmonster)',
        //                     icon_url: 'https://media.discordapp.net/attachments/682449668428529743/873590308502372362/79e40d246645eefc.png',
        //                 },
        //                 // title: `총 ${list.length}달 동안의 출석 기록`,
        //                 //                         description: list
        //                 //                             .map(
        //                 //                                 ({ total, cnt, yymm, late_time, per }) => `${yymm}] ${cnt}/${total}회 ${late_time}후 출석
        //                 // ${emote.map((e, i) => (per / ((i + 1) * 10) ? '💟' : e)).join('')} (${per}%)
        //                 //                     `
        //                 //                             )
        //                 //                             .join(''),
        //             },
        //         ],
        //     });
        // }
    });
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
