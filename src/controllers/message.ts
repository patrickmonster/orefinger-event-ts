import { query, queryPaging, selectPaging, SqlInsertUpdate } from 'utils/database';

import { MessageCreate } from 'interfaces/message';
import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/rest/v10';
import { APIEmbed } from 'discord-api-types/v10';

export const getMessageList = async (page: number, tag: string | undefined) =>
    selectPaging<{
        message_id: number;
        context_id: number;
        tag: string;
        tts: boolean;
        ephemeral: boolean;
        create_at: string;
        update_at: string;
    }>(
        `
SELECT message_id, context_id, tag, tts_yn as tts, ephemeral_yn as ephemeral, create_at, update_at
FROM notification.message
WHERE 1=1
${tag ? '' : '-- '}AND tag LIKE CONCAT('%', ?, '%')
        `,
        page,
        tag
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

// TODO: 메세지 조회 - 임베드 컴포넌트
const regEx = /\{([0-9A-Za-z_]+)\}/i;
type Tage = {
    [key: string]: string | number | boolean;
};

/**
 * 메세지 조회 - 임베드 컴포넌트
 * @param user_id
 * @param message_id
 * @returns
 */
export const getMessage = async (user_id: string | number, message_id: number, tags: Tage = {}) =>
    query<Pick<RESTPostAPIChannelMessageJSONBody, 'content' | 'embeds' | 'components'>>(
        `
select 
ifnull((select message from text_message tm where tm.text_id = m.content_id), null) as content
, if( mc.embed_id is null , null , json_array( func_get_embed(mc.embed_id) )) as embeds
, if( mc.component_col_id is null , null , func_get_component( ? , component_col_id ) ) as components
from message m
left join message_conntection mc on m.message_id = mc.message_id
where m.message_id = ?`,
        user_id,
        message_id
    )
        .then(([message]) =>
            JSON.stringify(Object.fromEntries(Object.entries(message).filter(([_, v]) => v != null)), (k, v) => {
                if (typeof v != 'string') return v;

                if (k.endsWith('_yn')) return v == 'Y';

                // 정규 변환식
                let tag;
                while ((tag = v.match(regEx)) !== null) {
                    const [org, name] = tag;

                    if (name in tags) v = `${v.slice(0, tag.index)}${tags[name]}${v.slice(tag.index + org.length)}`;
                    else v = `${v.slice(0, tag.index)}${v.slice(tag.index + org.length)}`; // 정규식 취약점 수정 (공란일 경우, 무한루프로)
                }
                return v;
            })
        )
        .then(message => JSON.parse(message));
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
