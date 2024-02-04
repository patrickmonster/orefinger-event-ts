/**
 * 해당 문서는, 선택 옵션들을 불러오는 쿼리를 작성하는 문서입니다.
 * 페이징이 가능한 쿼리를 작성하는데 사용됩니다.
 *  - MVC 모델 규칙을 지키기 위하여 작성된 문서 입니다.
 * @patrickmonster
 */

const SelectNoticeDashbord = `
SELECT 
	json_object( 'name', '🔔') AS emoji
	, CAST(notice_type_id AS CHAR) AS value
	, tag AS label
FROM notice_type nt 
WHERE 1=1
AND use_yn = 'Y'
`;

export default {
    SelectNoticeDashbord,
};
