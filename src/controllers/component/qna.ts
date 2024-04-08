/**
 * 해당 문서는, 선택 옵션들을 불러오는 쿼리를 작성하는 문서입니다.
 * 페이징이 가능한 쿼리를 작성하는데 사용됩니다.
 *  - MVC 모델 규칙을 지키기 위하여 작성된 문서 입니다.
 * @patrickmonster
 */

import { SqlInsertUpdate, calTo, query } from 'utils/database';

export const ParseInt = (id: string | number) => (typeof id == 'string' ? parseInt(id) : id);

interface QnaAnswer {
    auth_id: string;
    title: string;
    description: string;
    create_at: string;
    use_yn: 'Y' | 'N';
    answer: string;
    answer_id: string;
}

export const selectQnaQuestion = async (id: number, userId?: string) =>
    query<{
        idx: number;
        auth_id: string;
        title: string;
        description: string;
        create_at: string;
        use_yn: 'Y' | 'N';
        answer: string;
        answer_id: string;
    }>(
        `
SELECT
    idx
    , auth_id
    , title
    , description
    , create_at
    , use_yn
    , answer  
    , answer_id
FROM qna_question qq
WHERE qq.idx = ?
${calTo('AND (qq.auth_id = ? or qq.answer_id = ?)', userId, userId)}
AND qq.use_yn = 'Y'
    `,
        id
    ).then(result => result[0]);

export const insertQnaQuestion = async (data: Partial<QnaAnswer>) =>
    query<SqlInsertUpdate>(`INSERT INTO discord.qna_question SET ?`, data);

export const updateQnaQuestion = async (id: number, data: Partial<QnaAnswer>) =>
    query<SqlInsertUpdate>(`UPDATE discord.qna_question SET ?, update_at=CURRENT_TIMESTAMP WHERE idx = ?`, data, id);
