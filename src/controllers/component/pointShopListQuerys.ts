/**
 * 해당 문서는, 선택 옵션들을 불러오는 쿼리를 작성하는 문서입니다.
 * 페이징이 가능한 쿼리를 작성하는데 사용됩니다.
 *  - MVC 모델 규칙을 지키기 위하여 작성된 문서 입니다.
 * @patrickmonster
 */

const GuildShopByMenuListQuery = `
SELECT 
    JSON_OBJECT( 'name', IF(aps.use_yn = 'Y', '🔴','⚫')) AS emoji
    , CAST(aps.idx AS CHAR) AS value
    , IFNULL(aps.name, '지정되지 않음')  AS label
    , CONCAT(aps.detail) AS  description
FROM auth_point_shop aps 
WHERE aps.guild_id = ?
    `;

const GuildShopOrderItemByMenuListQuery = `
SELECT
	JSON_OBJECT( 'name', IF(apso.use_yn = 'Y', '🔴','⚫')) AS emoji
	, CAST(apso.order_id AS CHAR) AS value
	, IFNULL(apso.name, '알수없음') AS label
FROM auth_point_shop_order apso
WHERE 1=1
AND apso.item_idx = ?
    `;

export default {
    GuildShopByMenuListQuery,
    GuildShopOrderItemByMenuListQuery,
};
