import getConnection, { SqlInsertUpdate, query } from 'utils/database';

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
		, ROW_NUMBER() OVER(ORDER BY \`point\` DESC) AS rnk
	FROM auth_point ap 
	INNER JOIN auth a ON a.auth_id = ap.auth_id
	WHERE ap.auth_id != '466950273928134666'
    AND ap.guild_id = ?
) A
WHERE rnk BETWEEN 1 AND 10
OR ? = auth_id 
        `,
        guild_id,
        auth_id
    );
