/**
 * 해당 문서는, 선택 옵션들을 불러오는 쿼리를 작성하는 문서입니다.
 * 페이징이 가능한 쿼리를 작성하는데 사용됩니다.
 *  - MVC 모델 규칙을 지키기 위하여 작성된 문서 입니다.
 * @patrickmonster
 */

const GuildShopByMenuListQuery = `
SELECT 
	JSON_OBJECT( 'name', IF(  SUM(IF(aps.use_yn = 'Y', 1,0)) >= 1, '🔴','⚫')) AS emoji
	, CAST(aps.idx AS CHAR) AS value
    , IFNULL(aps.name, '지정되지 않음')  AS label
    , CONCAT(aps.detail) AS  description
FROM auth_point_shop aps 
WHERE aps.guild_id = IFNULL
(
    (SELECT guild_id FROM auth_point_guild apg WHERE ? = apg.guild_id LIMIT 1),
    '00000000000000000000' 
)
    `;

export default {
    GuildShopByMenuListQuery,
};
