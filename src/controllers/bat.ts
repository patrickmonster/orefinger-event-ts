// 배치용 쿼리

import { NoticeBat } from 'interfaces/notice';
import { Paging } from 'interfaces/swagger';
import { SqlInsertUpdate, query, selectPaging } from 'utils/database';

// 배치 조회
export const selectEventBats = (notice_type: number, paging: Paging) =>
    selectPaging<NoticeBat>(
        `
SELECT
	notice_id
	, hash_id
	, message
	, name
	, img_idx
	, JSON_ARRAYAGG(channel) AS channels
FROM (
	SELECT
		vn.notice_id
		, vn.hash_id
		, vn.message
		, vn.name
		, vn.img_idx
		, json_object( 'channel_id', nc.channel_id, 'notice_id', nc.notice_id, 'guild_id', nc.guild_id, 'create_at', nc.create_at, 'update_at', nc.update_at ) AS channel
	FROM v_notice vn
	LEFT JOIN notice_channel nc using(notice_id)
	WHERE vn.notice_type = ?
	AND use_yn = 'Y'
) A
GROUP BY hash_id
    `,
        paging,
        notice_type
    );

export const insertVideoEvents = async (notice_id: number, video_id: string, title: string) =>
    query(`INSERT INTO notice_video (video_id, title, notice_id) VALUES(?)`, [video_id, title, notice_id]);

export const insertLiveEvents = async (notice_id: number, id: string) =>
    query(`INSERT INTO notice_live SET ?`, {
        notice_id,
        id,
    });

export const updateLiveEvents = async (notice_id: number, id: string) =>
    query<SqlInsertUpdate>(
        `UPDATE notice_live SET end_at=CURRENT_TIMESTAMP WHERE notice_id=? AND id=? AND end_at IS NOT NULL`,
        notice_id,
        id
    );
