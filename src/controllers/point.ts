import getConnection, { SqlInsertUpdate, query } from 'utils/database';

interface Message {
    message_id: string;
    channel_id: string;
    message: string;
}

export const CreateMessage = async (message: Message) =>
    query<SqlInsertUpdate>(`INSERT INTO message_log set ?`, message);

// '466950273928134666', 100, 'test' - 포인트 추가
export const addPoint = async (auth_id: string, point: number, message: string) =>
    query<{
        point: number;
    }>(`SELECT func_add_point(?) AS \`point\``, [auth_id, point, message]).then(([row]) => row?.point || 0);

export const getPoint = async (auth_id: string) =>
    query<{ point: number }>(`SELECT point FROM auth_point WHERE auth_id = ?`, auth_id).then(
        ([rows]) => rows?.point || 0
    );

export const getPointLogs = async (auth_id: string) =>
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
limit 20
            `,
            auth_id
        );

        const point =
            (await query<{
                point: number;
            }>(`SELECT point FROM auth_point WHERE auth_id = ?`, auth_id).then(([rows]) => rows?.point)) || 0;

        return {
            point,
            logs,
        };
    });

export const selectPointRanking = async (auth_id: string) =>
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
) A
WHERE rnk BETWEEN 1 AND 10
OR ? = auth_id 
        `,
        auth_id
    );
