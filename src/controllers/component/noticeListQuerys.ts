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
    JSON_OBJECT( 'name', IF(  SUM(IF(nc.use_yn = 'Y', 1,0)) >= 1, '🔴','⚫')) AS emoji
    , CAST(nc.notice_id AS CHAR) AS value
    , IFNULL(n.name, '지정되지 않음')  AS label
    , CONCAT(n.message) AS  description
FROM notice_channel nc 
INNER JOIN v_notice n USING(notice_id)
WHERE n.notice_type = ?
AND (guild_id = ? OR notice_type = 7)
GROUP BY nc.notice_id 
`;
// 알림 상세 (7 번은 라프텔)
const SelectNoticeDashbordByGuildId = `
SELECT 
	JSON_OBJECT( 'name', IF(  SUM(IF(nc.use_yn = 'Y', 1,0)) >= 1, '🔴','⚫')) AS emoji
	, CAST(nc.notice_id AS CHAR) AS value
    , IFNULL(n.name, '지정되지 않음')  AS label
    , CONCAT(n.message) AS  description
FROM notice_channel nc 
INNER JOIN v_notice n USING(notice_id)
WHERE (guild_id = ? OR notice_type = 7)
GROUP BY nc.notice_id 
`;

export default {
    SelectNoticeDashbord,
    SelectNoticeDashbordByNoticeId,
    SelectNoticeDashbordByGuildId,
};
