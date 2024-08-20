import { APIEmbed, APIModalInteractionResponseCallbackData } from 'discord-api-types/v10';
import { PointPK, PshopItem } from 'interfaces/point';
import getConnection, { SqlInsertUpdate, calTo, query } from 'utils/database';

interface Message {
    message_id: string;
    channel_id: string;
    message: string;
}
export const CreateMessage = async (message: Message) =>
    query<SqlInsertUpdate>(`INSERT INTO message_log set ?`, message);

// '466950273928134666', 100, 'test' - 포인트 추가
export const addPoint = async (
    auth_id: string,
    point: number,
    message: string,
    guild_id: string = '00000000000000000000'
) =>
    query<{
        point: number;
    }>(`SELECT func_add_point(?) AS \`point\``, [auth_id, point, message, guild_id]).then(([row]) => row?.point || 0);

// order_id, item_idx, auth_id, `point`, name, create_at, use_yn
export const addOrder = async (
    data: {
        order_id: string;
        item_idx: number;
        auth_id: string;
        point: number;
        name: string;
    },
    guild_id: string = '00000000000000000000'
) =>
    getConnection(async query => {
        const { auth_id, point, item_idx, order_id, name } = data;
        await query<{
            point: number;
        }>(`SELECT func_add_point(?) AS \`point\``, [
            auth_id,
            -point,
            `${item_idx})${name} 상품구매 - ${order_id}`,
            guild_id,
        ]).then(([row]) => row?.point || 0);

        await query<SqlInsertUpdate>(`INSERT INTO discord.auth_point_shop_order SET ?`, {
            ...data,
            use_yn: 'Y',
        });

        return true;
    }, true).catch(async e => {
        await query<SqlInsertUpdate>(`INSERT INTO discord.auth_point_shop_order SET ?`, {
            ...data,
            use_yn: 'N',
        });

        return false;
    });

export const cancelOrder = async (order_id: string, guild_id: string = '00000000000000000000') =>
    getConnection(async query => {
        const [order] = await query<{
            order_id: string;
            item_idx: number;
            auth_id: string;
            point: number;
            name: string;
        }>(`SELECT * FROM auth_point_shop_order WHERE order_id = ?`, order_id);

        if (!order) return false;

        await query<{
            point: number;
        }>(`SELECT func_add_point(?) AS \`point\``, [
            order.auth_id,
            order.point,
            `${order.item_idx})${order.name} 상품환불 - ${order.order_id}`,
            guild_id,
        ]);

        await query<SqlInsertUpdate>(`UPDATE auth_point_shop_order SET use_yn = 'N' WHERE order_id = ?`, order_id);

        return true;
    });

export const selectPointGuild = async (guild_id: string = '00000000000000000000') =>
    query<{
        auth_id: string;
        guild_id: string;
        guild_name: string;
        channel_id: string;
    }>(`SELECT * FROM auth_point_guild WHERE guild_id = ?`, guild_id).then(([rows]) => rows);

export const getPoint = async (auth_id: string) =>
    query<{ point: number }>(`SELECT point FROM auth_point WHERE auth_id = ?`, auth_id).then(
        ([rows]) => rows?.point || 0
    );

export const getPointLogs = async (auth_id: string, guild_id: string = '00000000000000000000') =>
    getConnection(async query => {
        const logs = await query<{
            idx: number;
            auth_id: string;
            point: number;
            point_old: number;
            message: string;
            create_at: string;
        }>(
            `
SELECT
    idx
    , auth_id
    , \`point\`
    , point_old
    , message
    , create_at 
FROM auth_point_log apl
WHERE auth_id = ?
AND apl.guild_id = IFNULL
(
    (SELECT guild_id FROM auth_point_guild apg WHERE ? = apg.guild_id LIMIT 1),
    '00000000000000000000' 
)
ORDER BY create_at DESC 
limit 15
            `,
            auth_id,
            guild_id
        );

        const point =
            (await query<{
                point: number;
            }>(`SELECT point FROM auth_point WHERE auth_id = ? AND guild_id = ?`, auth_id, guild_id).then(
                ([rows]) => rows?.point
            )) || 0;
        return {
            point,
            logs,
        };
    });

export const selectPointRanking = async (auth_id: string, guild_id: string = '00000000000000000000') =>
    query<{
        auth_id: string;
        name: string;
        point: number;
        rnk: number;
    }>(
        `
SELECT *
FROM (
	SELECT
		ap.auth_id
		, IFNULL(a.name, a.username) AS name
		, \`point\`
		, ROW_NUMBER() OVER(ORDER BY \`point\` DESC, ap.update_at) AS rnk
	FROM auth_point ap 
	INNER JOIN auth a ON a.auth_id = ap.auth_id
	WHERE ap.auth_id != '466950273928134666'
    AND ap.guild_id = IFNULL
    (
        (SELECT guild_id FROM auth_point_guild apg WHERE ? = apg.guild_id LIMIT 1),
        '00000000000000000000' 
    )
) A
WHERE rnk BETWEEN 1 AND 15
OR ? = auth_id 
        `,
        guild_id,
        auth_id
    );

export const selectShop = async (guild_id: string = '00000000000000000000') =>
    query<{
        idx: number;
        guild_id: string;
        point: number;
        name: string;
        detail: string;
        use_yn: string;
        create_at: string;
        update_at: string;
        create_user: string;
        update_user: string;
    }>(
        `
SELECT
	idx
	, guild_id
	, aps.point
	, name
	, detail
	, use_yn
	, create_at
	, update_at
	, create_user
	, update_user
FROM auth_point_shop aps 
    `,
        guild_id
    );

export const selectPshopItemEditByModel = async (idx: string) =>
    query<Omit<APIModalInteractionResponseCallbackData, 'custom_id'>>(
        `
SELECT CONCAT(name, ' 상품 수정') as title,
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'name', 'label', '상품명', 'value', name, 'min_length', 1, 'max_length', 500, 'style', 1, 'required', true )
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'point', 'label', '포인트', 'value',IFNULL(point, 10) , 'min_length', 0, 'max_length', 1000, 'style', 1, 'required', true)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'detail', 'label', '설명', 'value', IFNULL(detail , ''), 'min_length', 0, 'max_length', 1000, 'style', 2, 'required', false)
            )
        )
    ) AS components
FROM auth_point_shop a
WHERE a.idx = ?
        `,
        idx
    ).then(res => res[0]);

export const upsertGuildPoint = async (data: {
    auth_id: string;
    guild_id: string;
    guild_name: string;
    channel_id: string;
}) =>
    query<SqlInsertUpdate>(
        `INSERT INTO auth_point_guild SET ? ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP`,
        data,
        data
    );

export const upsertPshopItem = async (item: Partial<Omit<PshopItem, 'idx'>>, pk?: PointPK) =>
    pk
        ? query<SqlInsertUpdate>(`UPDATE auth_point_shop SET ? WHERE idx = ?`, item, pk.idx)
        : query<SqlInsertUpdate>(`INSERT INTO auth_point_shop SET ?`, item);

export const selectPointDetailByEmbed = async (guild_id: string = '00000000000000000000', pk?: PointPK) =>
    query<{
        embed: APIEmbed;
        use_yn: boolean;
    }>(`
SELECT JSON_OBJECT(
    'title', IFNULL(aps.name, '없음'),
    'timestamp', aps.create_at,
    'description', aps.detail ,
    'fields', JSON_ARRAY( 
        JSON_OBJECT('name', '포인트','value', IFNULL(aps.point , '없음'), 'inline', true),
--             JSON_OBJECT('name', '소비타입','value', IFNULL(aps.use_yn , '없음'), 'inline', true),
        JSON_OBJECT('name','상태','value', IF(aps.use_yn = 'Y', '활성화', '비활성화'), 'inline', false)
    )
) AS embed
, use_yn
FROM auth_point_shop aps
WHERE 1=1
${calTo('AND aps.idx = ?', pk?.idx)}
${calTo('AND aps.guild_id = ?', guild_id)}
        `).then(res => res[0]);

export const selectPointDetail = async (guild_id: string = '00000000000000000000', pk?: PointPK) =>
    query<PshopItem>(
        `
SELECT
	aps.idx
	, aps.guild_id
	, aps.point
	, aps.name
	, aps.detail
	, aps.use_yn
	, aps.create_at
	, aps.update_at
	, aps.create_user
	, aps.update_user
FROM auth_point_shop aps 
WHERE 1=1
${calTo('AND aps.idx = ?', pk?.idx)}
AND aps.guild_id = IFNULL
(
    (SELECT guild_id FROM auth_point_guild apg WHERE ? = apg.guild_id LIMIT 1),
    '00000000000000000000' 
)
        `,
        guild_id
    );
