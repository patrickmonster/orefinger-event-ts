import {
    APIEmbed,
    APIModalInteractionResponseCallbackData,
    APISelectMenuDefaultValue,
    SelectMenuDefaultValueType,
} from 'discord-api-types/v10';
import { NoticeDetail } from 'interfaces/notice';
import getConnection, { SqlInsertUpdate, format, query } from 'utils/database';

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
    , (
        select json_arrayagg(
                JSON_OBJECT(
                    'id', nc.channel_id,
                    'type', 'channel'
                ) 
            )
        from notice_channel nc 
        WHERE guild_id = ?
        AND nc.notice_id = n.notice_id
        AND nc.use_yn = 'Y'
    ) as channels
from notice n
INNER JOIN notice_detail nd using(notice_id)
WHERE 1=1
AND notice_id = ?
    
    `,
        guild_id,
        ParseInt(notice_id)
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

        console.log(
            '????',
            channel_ids,
            channel_ids.map(channel_id => format('(?)', [[notice_id, guild_id, channel_id]])).join(',')
        );

        // 다중 insert
        query(
            `
INSERT INTO notice_channel (notice_id, guild_id, channel_id)
VALUES ${channel_ids.map(channel_id => format('(?)', [[notice_id, guild_id, channel_id]])).join(',')}
ON DUPLICATE KEY UPDATE use_yn = 'Y', update_at=CURRENT_TIMESTAMP
        `
        );
    }, true);

export const upsertNotice = async (notiecData: Partial<NoticeDetail>, noChageOrigin?: boolean) =>
    getConnection(async query => {
        console.log('notiecData', notiecData);
        let id = notiecData.notice_id;
        if (id === undefined) {
            const notice = await query<SqlInsertUpdate>(
                `INSERT INTO notice SET ? ON DUPLICATE KEY UPDATE use_yn = 'Y', update_at=CURRENT_TIMESTAMP `,
                {
                    hash_id: notiecData.hash_id,
                    notice_type: notiecData.notice_type,
                }
            );
            id = notice.insertId;
        }

        const props: any = [
            {
                notice_id: id,
                message: notiecData.message,
                name: notiecData.name,
            },
        ];

        if (!noChageOrigin)
            props.push({
                message: notiecData.message,
                name: notiecData.name,
            });

        await query<SqlInsertUpdate>(
            `INSERT IGNORE INTO notice_detail SET ? ${!noChageOrigin ? 'ON DUPLICATE KEY UPDATE ?' : ''}`,
            ...props
        );

        return id;
    }, true);

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
