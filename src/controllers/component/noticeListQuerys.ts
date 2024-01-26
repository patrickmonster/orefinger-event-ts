/**
 * 해당 문서는, 선택 옵션들을 불러오는 쿼리를 작성하는 문서입니다.
 * 페이징이 가능한 쿼리를 작성하는데 사용됩니다.
 *  - MVC 모델 규칙을 지키기 위하여 작성된 문서 입니다.
 * @patrickmonster
 */

const SelectNoticeDashbord = `
select  json_object( 'name', IF( n.use_yn = 'Y', '🔴','⚫')) AS emoji
    , CAST(nt.notice_type_id AS CHAR) AS value
    , nt.tag  AS label
    , LEFT(CONCAT( '마지막 변경 : ', n.update_at ) , 100) AS description
from notice_type nt
left join notice n on nt.notice_type_id = n.notice_type 
WHERE nt.use_yn = 'Y'
AND guild_id = ?
`;

export default {
    SelectNoticeDashbord,
};
