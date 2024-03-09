import { config } from 'dotenv';
import { join } from 'path';
import { env } from 'process';
config({
    path: join(env.PWD || __dirname, `/src/env/.env.local`),
});

import { query } from 'utils/database';
import discord from 'utils/discordApiInstance';

query<{
    channel_id: string;
}>(`
SELECT channel_id
FROM event_channel ec 
WHERE 1=1
AND delete_yn = 'N'
AND \`type\` = 14
`)
    .then(data => {
        for (const { channel_id } of data) {
            console.log('Channel ::', channel_id);
            discord.post(`/channels/${channel_id}/messages`, {
                body: {
                    embeds: [
                        {
                            title: '방송알리미 향후 서비스 제공 계획 안내',
                            description: `
안녕하세요, 방송알리미입니다.
방송알리미 서비스는 지난 3월9일부터 개발을 시작하여, 3월 31일부로 서비스를 시작하였습니다.
서비스 시작 이후 많은 분들이 서비스를 이용해주시고, 많은 피드백을 주셨습니다.
그 피드백을 바탕으로 서비스를 개선하고자 노력하고 있습니다.
또한, 서비스를 이용해주시는 분들에게 더 나은 서비스를 제공하기 위해 노력하고 있습니다.

아래는 향후 서비스 제공 계획입니다.

1. 치지직, 유튜브, 아프리카 서비스 제공
기존 twitch 에서만 알림을 제공하고 있던 서비스를 치지직, 아프리카, 유튜브로 확장하였습니다.

2. 트위치 알림 서비스 제공
현재 트위치 신규 등록은 중지 되었으며, 추가로 향후, 트위치 알림 서비스를 중단할 예정 입니다.
* 일정
 - 2024. 4. 1 이벤트 수신 중단
 - 2024. 4. 6 이벤트 발송 중단
 - 2024. 4. 14 알림 데이터 및 알림 관련 데이터 삭제

3. 서비스 개선
방송알림이는 품질 개선을 위하여 많은 노력을 하고 있습니다.
다른 서비스와 다르게, 무중단 서비스 및 AutoScale 서비스를 통한 안정적인 서비스를 제공하기 위해 노력하고 있습니다.

4. 서비스 확장
방송알림이는 서비스 확장을 위하여 노력하고 있습니다.
이름에 맞는 "방송알리미" 서비스를 제공하기 위하여 노력하고 있습니다.
TV 방송까지 확장 계획을 검도하고 있으며,
추후 요청사항을 보내 주시면, 검토하여 서비스를 제공하고자 합니다.

                            `,
                        },
                    ],
                },
            });
        }
    })
    .catch(e => {});
