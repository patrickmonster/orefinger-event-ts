// 배치용 쿼리

import { NoticeBat } from 'interfaces/notice';
import { Paging } from 'interfaces/swagger';
import { SqlInsertUpdate, query, selectPaging } from 'utils/database';

type NoticeId = string | number;

const getNoticeId = (noticeId: NoticeId) => (typeof noticeId === 'string' ? parseInt(noticeId) : noticeId);

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
	, channels
	, id
FROM (
	SELECT
		notice_id
		, hash_id
		, message
		, name
		, img_idx
		, JSON_ARRAYAGG(channel) AS channels
		, IFNULL(
			IF( 
				video_yn = 'N',
				(
					SELECT 
						IF (
							nl.create_at < DATE_ADD(NOW(), INTERVAL -1 HOUR),
							if(nl.end_at IS NOT NULL, '0', nl.id),
							'-1'
						)
					FROM notice_live nl 
					WHERE nl.notice_id = A.notice_id
					ORDER BY nl.id desc
					LIMIT 1
				),
				(
					SELECT 
						IF (
							nv.create_at < DATE_ADD(NOW(), INTERVAL -1 HOUR),
							video_id,
							'-1'
						)
					FROM notice_video nv 
					WHERE nv.notice_id = A.notice_id
					ORDER BY nv.create_at DESC
					LIMIT 1
				)
			), '0'
		) AS id
	FROM (
		SELECT
			vn.notice_id
			, vn.hash_id
			, vn.message
			, vn.name
			, vn.img_idx
			, vn.video_yn 
			, json_object( 'channel_id', nc.channel_id, 'notice_id', nc.notice_id, 'guild_id', nc.guild_id, 'create_at', nc.create_at, 'update_at', nc.update_at ) AS channel
		FROM v_notice vn
		LEFT JOIN notice_channel nc using(notice_id)
		WHERE vn.notice_type = ?
		AND nc.use_yn = 'Y'
	) A
	GROUP BY hash_id
) A
WHERE id <> '-1'
		`,
        paging,
        notice_type
    );

/**
 * 	단일 항목 조회
 * @param noticeType
 * @param guildId
 */
export const selectEventBat = (hashId: string) =>
    query<NoticeBat>(
        `
SELECT
	notice_id
	, hash_id
	, message
	, name
	, img_idx
	, JSON_ARRAYAGG(channel) AS channels
	, IFNULL(
		IF( 
			video_yn = 'N',
			(
				SELECT if(nl.end_at IS NOT NULL, 0, nl.id) FROM notice_live nl 
				WHERE nl.notice_id = A.notice_id
				ORDER BY nl.id desc
				LIMIT 1
			),
			(
				SELECT video_id FROM notice_video nv 
				WHERE nv.notice_id = A.notice_id
				ORDER BY nv.create_at DESC
				LIMIT 1
			)
		), 0
	) AS id
FROM (
	SELECT
		vn.notice_id
		, vn.hash_id
		, vn.message
		, vn.name
		, vn.img_idx
		, vn.video_yn 
		, json_object( 'channel_id', nc.channel_id, 'notice_id', nc.notice_id, 'guild_id', nc.guild_id, 'create_at', nc.create_at, 'update_at', nc.update_at ) AS channel
	FROM v_notice vn
	LEFT JOIN notice_channel nc using(notice_id)
	WHERE vn.hash_id = ?
	AND use_yn = 'Y'
) A
	`,
        hashId
    ).then(([item]) => item);

export const insertVideoEvents = async (notice_id: NoticeId, video_id: string, title: string) =>
    query(`INSERT INTO notice_video (video_id, title, notice_id) VALUES(?)`, [video_id, title, getNoticeId(notice_id)]);

export const selectVideoEvents = async (notice_id: NoticeId) =>
    query<{
        video_id: string;
        title: string;
        create_at: string;
    }>(
        `
SELECT video_id, title, create_at  
FROM notice_video
WHERE 1=1
AND notice_id = ?
ORDER BY create_at DESC
	`,
        getNoticeId(notice_id)
    );

export const insertLiveEvents = async (
    notice_id: NoticeId,
    id: string | number,
    {
        image,
        title,
        game,
    }: {
        image: string;
        title: string;
        game: string;
    }
) =>
    query(`INSERT INTO notice_live SET ?`, {
        notice_id: getNoticeId(notice_id),
        id,
        image,
        title,
        game,
    });

export const updateLiveEvents = async (notice_id: number) =>
    query<SqlInsertUpdate>(
        `UPDATE notice_live SET end_at=CURRENT_TIMESTAMP WHERE notice_id=? AND end_at IS NULL`,
        getNoticeId(notice_id)
    );

export const selectNoticeGuildChannel = (notice_id: number | string, guild_id: string) =>
    query<{
        channel_id: string;
        notice_id: string;
        hash_id: string;
        notice_type: number;
        notice_type_tag: string;
        message: string;
        name: string;
        img_idx: number | null;
    }>(
        `
SELECT 
	nc.channel_id 
	, nc.notice_id
	, vn.hash_id
	, vn.notice_type
	, vn.notice_type_tag
	, vn.message
	, vn.name
	, vn.img_idx 
FROM notice_channel nc 
INNER JOIN v_notice vn ON nc.notice_id = vn.notice_id 
WHERE 1=1
AND nc.notice_id = ?
AND nc.guild_id = ?
AND nc.use_yn = 'Y'
		`,
        getNoticeId(notice_id),
        guild_id
    );
