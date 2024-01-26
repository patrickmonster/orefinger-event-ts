import { query } from 'utils/database';

export const list = async () =>
    query<{
        notice_type_id: number;
        notice_type_tag: string;
    }>("select notice_type_id, tag as notice_type_tag from notice_type nt WHERE nt.use_yn = 'Y'");
// export const list = async (guild_id: string) =>
//     query<{
//         notice_channel_id: number;
//         channel_id: string;
//         notice_id: number;
//         guild_id: string;
//         create_at: string;
//         update_at: string;
//         use_yn: string;
//         hash_id: string;
//         notice_type: number;
//         notice_type_tag: string;
//     }>(
//         `
// SELECT nc.notice_channel_id, nc.channel_id, nc.notice_id, nc.guild_id, nc.create_at, nc.update_at, nc.use_yn
// 	, vn.hash_id
// 	, vn.notice_type
// 	, vn.notice_type_tag
// FROM notice_channel nc
// LEFT JOIN v_notice vn
// 	ON nc.notice_id = vn.notice_id
// WHERE nc.guild_id = ?
//     `,
//         guild_id
//     );
