/**
 * 해당 문서는, 선택 옵션들을 불러오는 쿼리를 작성하는 문서입니다.
 * 페이징이 가능한 쿼리를 작성하는데 사용됩니다.
 *  - MVC 모델 규칙을 지키기 위하여 작성된 문서 입니다.
 * @patrickmonster
 */

const SelectNoticeDashbord = `
SELECT json_object( 'name', IF( nc.use_yn = 'Y', '🔴','⚫')) AS emoji
	, CAST(vn.notice_id AS CHAR) AS value
	, vn.notice_type_tag  AS label
	, LEFT(CONCAT( '마지막 변경 : ', vn.update_at ) , 100) AS description 
FROM v_notice vn 
LEFT JOIN notice_channel nc using(notice_id) 
WHERE guild_id = ?
`;

export default {
    SelectNoticeDashbord,
};
