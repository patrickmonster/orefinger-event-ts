/**
 * 해당 문서는, 선택 옵션들을 불러오는 쿼리를 작성하는 문서입니다.
 * 페이징이 가능한 쿼리를 작성하는데 사용됩니다.
 *  - MVC 모델 규칙을 지키기 위하여 작성된 문서 입니다.
 * @patrickmonster
 */

import { tastTo } from 'utils/database';

const SelectNoticeDashbord = `
SELECT 
	json_object( 'name', '🔔') AS emoji
	, CAST(notice_type_id AS CHAR) AS value
	, tag AS label
FROM notice_type nt 
WHERE 1=1
${tastTo('AND nt.use_yn = "Y"')}
`;

// 알림 상세 (7 번은 라프텔)
const SelectNoticeDashbordByNoticeId = `
SELECT
    JSON_OBJECT('name', IF(agg.has_active, '🔴', '⚫')) AS emoji,
    CAST(agg.notice_id AS CHAR) AS value,
    COALESCE(n.name, ng.name, n.hash_id) AS label,
    n.message AS description
FROM (
    -- 집계를 먼저 수행해서 그룹당 1행으로 축소
    SELECT
        nc.notice_id,
        nc.guild_id,          -- 대표 guild_id가 필요하면 MIN/MAX 등으로 명시
        MAX(nc.use_yn = 'Y') AS has_active
    FROM notice_channel nc
    GROUP BY nc.notice_id, nc.guild_id
) agg
INNER JOIN v_notice_guild n
    ON n.notice_id = agg.notice_id
    AND n.guild_id = agg.guild_id
LEFT JOIN (
    -- 상관 서브쿼리 → 파생 테이블로 한 번만 실행
    SELECT notice_id, MIN(name) AS name
    FROM notice_guild
    WHERE name IS NOT NULL
    GROUP BY notice_id
) ng ON ng.notice_id = agg.notice_id
WHERE n.notice_type = ?
AND (agg.guild_id = ? OR n.notice_type = 7)
`;
// 알림 상세 (7 번은 라프텔)
const SelectNoticeDashbordByGuildId = `
SELECT 
	JSON_OBJECT( 'name', IF(  SUM(IF(nc.use_yn = 'Y', 1,0)) >= 1, '🔴','⚫')) AS emoji
	, CAST(nc.notice_id AS CHAR) AS value
    , IFNULL(n.name, '지정되지 않음')  AS label
    , CONCAT(n.message) AS  description
FROM notice_channel nc 
INNER JOIN v_notice_guild n USING(notice_id, guild_id)
WHERE (nc.guild_id = ? OR notice_type = 7)
GROUP BY nc.notice_id 
`;

export default {
    SelectNoticeDashbord,
    SelectNoticeDashbordByNoticeId,
    SelectNoticeDashbordByGuildId,
};
