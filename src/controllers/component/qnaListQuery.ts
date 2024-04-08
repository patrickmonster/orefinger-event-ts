/**
 * 해당 문서는, 선택 옵션들을 불러오는 쿼리를 작성하는 문서입니다.
 * 페이징이 가능한 쿼리를 작성하는데 사용됩니다.
 *  - MVC 모델 규칙을 지키기 위하여 작성된 문서 입니다.
 * @patrickmonster
 */

const SelectQnaTypesByMenu = `
SELECT CAST(qt.qna_type AS CHAR) AS value
    , qt.name  AS lable
    , LEFT(IFNULL(qt.description, null), 100) AS description
FROM qna_type qt
WHERE qt.use_yn = 'Y'
`;

const SelectQnaDashbord = `
SELECT
    json_object( 'name', IF( eu.use_yn = 'Y', '🔴','⚫')) AS emoji
    ,  CAST(eu.embed_id AS CHAR) AS value
    , eu.title  AS lable
    , LEFT(IFNULL(eu.description, null), 100) AS description
FROM embed_user eu
WHERE 1=1
AND eu.use_yn = 'Y'
    `;

export default {
    //
    SelectQnaTypesByMenu,
    SelectQnaDashbord,
};
