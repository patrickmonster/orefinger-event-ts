import {
    APIEmbed,
    APIModalInteractionResponseCallbackData,
    APISelectMenuDefaultValue,
    SelectMenuDefaultValueType,
} from 'discord-api-types/v10';
import getConnection, { query } from 'utils/database';

export type NoticeId = number | string;

export const ParseInt = (id: NoticeId) => (typeof id == 'string' ? parseInt(id) : id);

export const list = async () =>
    query<{
        notice_type_id: number;
        notice_type_tag: string;
    }>("select notice_type_id, tag as notice_type_tag from notice_type nt WHERE nt.use_yn = 'Y'");

// ========================================================================================================
// select embed
/**
 * 컴포넌트 디테일 정보를 Embde 형태로 반환합니다.
 * @param component_id
 * @returns
 */
export const selectNoticeDtilByEmbed = async (notice_id: NoticeId, guild_id: string) =>
    query<{ embed: APIEmbed; channels: APISelectMenuDefaultValue<SelectMenuDefaultValueType.Channel>[] }>(
        `
SELECT 
    JSON_OBJECT(
        'title', nd.name, 
        'description', CONCAT(
            'message : ', nd.message
        ) 
    ) AS embed
    , JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', nc.channel_id,
            'type', 'channel'
        ) 
    ) AS channels  
FROM notice_channel nc 
INNER JOIN notice n USING(notice_id)
INNER JOIN notice_detail nd using(notice_id)
WHERE 1=1
AND notice_id = ?
AND guild_id = ?
    `,
        ParseInt(notice_id),
        guild_id
    ).then(res => res[0]);

export const deleteOrInsertNoticeChannels = async (notice_id: NoticeId, guild_id: string, channel_ids: string[]) =>
    getConnection(async query => {
        await query(
            `
UPDATE notice_channel 
SET use_yn = 'N', update_at = CURRENT_TIMESTAMP
WHERE notice_id = ? AND guild_id = ? AND channel_id NOT IN (?)
            `,
            notice_id,
            guild_id,
            channel_ids
        );

        query(
            `
INSERT INTO notice_channel 
SET ? ON DUPLICATE KEY UPDATE use_yn = 'Y', update_at=CURRENT_TIMESTAMP
        `,
            {
                notice_id,
                guild_id,
                channel_id: channel_ids,
            }
        );
    }, true);

export const upsertNoticeChannel = async (notice_id: NoticeId) => {
    // TODO : upsertNoticeChannel
};
export const upsertNotice = async (notice_id: NoticeId) => {
    // TODO : upsertNoticeChannel
};

export const deleteNoticeChannel = async (notice_id: NoticeId, channel_id: string) =>
    updateNoticeChannelState(notice_id, channel_id, 'N');

export const updateNoticeChannelState = async (notice_id: NoticeId, channel_id: string, use_yn: 'N' | 'Y') =>
    query(
        `UPDATE discord.notice_channel SET use_yn=?, update_at=CURRENT_TIMESTAMP WHERE channel_id=? AND notice_id= ?`,
        use_yn,
        channel_id,
        notice_id
    );

export const selectNoticeDetailEditByModel = async (notice_id: NoticeId) =>
    query<Omit<APIModalInteractionResponseCallbackData, 'custom_id'>>(
        `
SELECT 
    CONCAT(nd.notice_id, '] 알림 맨트 수정') as title
    , JSON_ARRAY(
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'message', 'label', '알림맨트', 'value', message, 'min_length', 1, 'max_length', 1000, 'style', 2, 'required', true )
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'name', 'label', '표기이름', 'value', IFNULL(name, ''), 'min_length', 0, 'max_length', 50, 'style', 1, 'required', false)
            )
        )
    ) AS components
FROM notice_detail nd 
WHERE notice_id = ?
        `,
        ParseInt(notice_id)
    ).then(res => res[0]);
