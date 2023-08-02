import { query, queryPaging, SqlInsertUpdate } from 'utils/database';

import { MessageCreate } from 'interfaces/message';
import { APIEmbed } from 'discord-api-types/v10';

export const getMessageList = async (page: number) =>
    queryPaging(
        `
SELECT message_id, context_id, tag, tts_yn as tts, ephemeral_yn as ephemeral, create_at, update_at
FROM notification.message`,
        page
    );

export const createMessage = async (message: MessageCreate) => query(`INSERT INTO notification.message set ?`, message);

export const updateMessage = async (message_id: number, message: MessageCreate) =>
    query<SqlInsertUpdate>(
        `
UPDATE message
SET ?, update_at=CURRENT_TIMESTAMP
WHERE message_id=?`,
        message,
        message_id
    );

// 광고 모듈
export const getAdvertisement = (game_id: string | number) =>
    query<{
        embed: APIEmbed;
        advertisement_id: number;
    }>(
        `
select embed, advertisement_id  from v_advertisement va
inner join (
select func_advert(?) as advertisement_id
) b using(advertisement_id)
    `,
        `${game_id}`
    ).then(([{ embed }]) => embed);
