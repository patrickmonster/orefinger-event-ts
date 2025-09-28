import { FastifyInstance } from 'fastify';

import { Paging } from 'interfaces/swagger';
import { calTo, query, selectPaging } from 'utils/database';
import client from 'utils/redis';

// Redis 기반 포스팅 캐시 인터페이스
interface PostingCache {
    clientIp: string;
    lastPostTime: number;
    postContent: string;
}

// 연속 포스팅 방지 설정
const POSTING_COOLDOWN_TIME = 60 * 5; // 5분 (Redis TTL)

// Redis 키 생성
const getPostingCacheKey = (ip: string) => `posting_cache:${ip}`;

// 컨텐츠 해시 생성 (중복 체크용)
/**
 * Redis 기반 연속 포스팅 방지 검사
 * @param clientIp 클라이언트 IP
 * @param title 게시글 제목
 * @param description 게시글 내용
 * @returns 포스팅 가능 여부와 메시지
 */
async function checkPostingAllowed(
    clientIp: string,
    title: string,
    description: string
): Promise<{ allowed: boolean; message?: string; remainingTime?: number }> {
    try {
        const cacheKey = getPostingCacheKey(clientIp);

        const lastPostTime = await client.get(cacheKey);
        if (lastPostTime) {
            const ttl = await client.ttl(cacheKey);
            if (ttl > 0) {
                return {
                    allowed: false,
                    message: `잠시만 기다려 주세요. ${ttl}초 후에 다시 시도할 수 있습니다.`,
                    remainingTime: ttl,
                };
            }
        }
        return { allowed: true };
    } catch (error) {
        console.error('Redis 포스팅 검사 오류:', error);
        // Redis 오류 시 기본적으로 허용 (서비스 중단 방지)
        return { allowed: true };
    }
}

/**
 * Redis 기반 포스팅 캐시 업데이트
 * @param clientIp 클라이언트 IP
 * @param title 게시글 제목
 * @param description 게시글 내용
 */
async function updatePostingCache(clientIp: string, title: string, description: string): Promise<void> {
    try {
        const cacheKey = getPostingCacheKey(clientIp);

        // 포스팅 쿨다운 설정 (60초)
        await client.setex(cacheKey, POSTING_COOLDOWN_TIME, Date.now().toString());
    } catch (error) {
        console.error('Redis 포스팅 캐시 업데이트 오류:', error);
        // Redis 오류가 포스팅을 막지 않도록 함
    }
}

export default async (fastify: FastifyInstance, opts: any) => {
    const TYPE_PROPERTY = {
        type: 'string',
        description: '타입',
        enum: ['O', 'M'],
        default: 'O',
    };

    fastify.get<{
        Querystring: {
            type?: 'O' | 'M';
        };
    }>(
        '/V1/board',
        {
            schema: {
                description: '게시판 조회',
                tags: ['Post'],
                summary: '게시판 조회',
                querystring: {
                    type: 'object',
                    properties: {
                        type: TYPE_PROPERTY,
                    },
                },
            },
        },
        async (req, res) =>
            await query(
                `
SELECT
    pb.bord_id
    , pb.name
    , pb.show_yn
    , pb.create_at
    , pb.update_at
FROM post_bord pb
WHERE 1=1
${calTo('AND pb.type = ?', req.query.type)}
ORDER BY pb.order_by asc
                    `
            )
    );

    fastify.get<{
        Querystring: Paging & {};
    }>(
        '/V1',
        {
            schema: {
                description: '게시글 조회',
                tags: ['Post'],
                summary: '게시글 조회',
                querystring: {
                    allOf: [
                        { $ref: 'paging#' },
                        {
                            type: 'object',
                            properties: {
                                bord_id: { type: 'number', description: '게시판ID' },
                                type: TYPE_PROPERTY,
                            },
                        },
                    ],
                },
                response: fastify.pagingResponse({
                    id: { type: 'number', description: '게시글ID' },
                    bord_id: { type: 'number', description: '게시판ID' },
                    title: { type: 'string', description: '제목' },
                    description: { type: 'string', description: '내용' },
                    use_yn: { type: 'string', description: '사용여부' },
                    commant_yn: { type: 'string', description: '댓글여부' },
                    create_at: { type: 'string', description: '생성일' },
                    update_at: { type: 'string', description: '수정일' },
                    user: { type: 'string', description: '작성자' },
                }),
            },
        },
        async (req, res) =>
            await selectPaging(
                `
SELECT
	p.id
	, p.bord_id
	, p.title
	, p.description
	, p.use_yn
	, p.commant_yn
	, p.user
	, p.create_at
    , p.update_yn
	, p.update_at
FROM post p
WHERE 1=1
ORDER BY p.id DESC
                `,
                req.query
            )
    );

    fastify.post<{
        Querystring: {
            post_id?: number;
            bord_id: number;
        };
        Body: {
            title: string;
            description: string;
            commant_yn?: 'Y' | 'N';
            password: string;
            user: string;
        };
    }>(
        '/V1',
        {
            schema: {
                description: '게시글 등록/ 수정',
                tags: ['Post'],
                summary: '게시글 등록/ 수정',
                querystring: {
                    type: 'object',
                    properties: {
                        post_id: { type: 'number', description: '게시글ID' },
                        bord_id: { type: 'number', description: '게시판ID', default: 1 },
                    },
                },
                body: {
                    type: 'object',
                    required: ['title', 'description'],
                    properties: {
                        user: { type: 'string', description: '작성자' },
                        title: { type: 'string', description: '제목' },
                        description: { type: 'string', description: '내용' },
                        commant_yn: { type: 'string', description: '댓글여부', enum: ['Y', 'N'], default: 'Y' },
                        password: { type: 'string', description: '비밀번호' },
                    },
                },
            },
        },
        async (req, res) => {
            const { bord_id, post_id } = req.query;
            const { user, title, description, commant_yn, password } = req.body;

            // 새 게시글 작성 시에만 연속 포스팅 방지 적용
            if (!post_id) {
                // 클라이언트 IP 기반 사용자 식별
                const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

                console.log('Client IP::', clientIp);

                // Redis 기반 연속 포스팅 방지 검사
                const checkResult = await checkPostingAllowed(clientIp, title, description);
                if (!checkResult.allowed) {
                    return res.status(429).send({
                        error: checkResult.message,
                        remainingTime: checkResult.remainingTime,
                    });
                }

                // 게시글 작성 실행
                const result = await query(`INSERT INTO post SET ?`, {
                    bord_id,
                    title,
                    description,
                    commant_yn,
                    password,
                    user,
                    ip: clientIp,
                });

                // 성공적으로 작성된 경우 Redis 캐시 업데이트
                await updatePostingCache(clientIp, title, description);

                return result;
            } else {
                // 게시글 수정
                return await query(
                    `UPDATE post SET ? WHERE id = ?`,
                    {
                        bord_id,
                        title,
                        description,
                        commant_yn,
                        password,
                        user,
                    },
                    post_id
                );
            }
        }
    );
};
