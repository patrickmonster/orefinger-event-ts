import { FastifyInstance } from 'fastify';
import { paramsToFormat, query } from 'utils/database/mobinogi';

const INSERT_CNT = 10000;

const insertUserStateList = async (list: string[]) => {
    if (list.length === 0) return;
    const result = await query(`
INSERT INTO user_state (idx, server_type, user_id, create_at, update_at, use_yn)
VALUES ${list.join(', ')}
ON DUPLICATE KEY UPDATE
    update_at=VALUES(update_at)
    , use_yn=VALUES(use_yn)
        `);
    console.log('INSERT ::', result);
    return result;
};

const insertUserStateClassList = async (list: string[]) => {
    if (list.length === 0) return;
    const result = await query(`
INSERT INTO user_state_class (user_idx, class_type, \`level\`, \`rank\`, update_at, use_yn)
VALUES ${list.join(', ')}
ON DUPLICATE KEY UPDATE
    update_at=VALUES(update_at)
    , use_yn=VALUES(use_yn)
        `);
    console.log('INSERT ::', result);
    return result;
};

const insertUserStateLifeList = async (list: string[]) => {
    if (list.length === 0) return;
    const result = await query(`
INSERT INTO user_state_life (user_idx, vitality, attractiveness)
VALUES ${list.join(', ')}
ON DUPLICATE KEY UPDATE
    vitality=VALUES(vitality)
    , attractiveness=VALUES(attractiveness)
        `);

    console.log('INSERT ::', result);
    return result;
};

const convertCsv = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onLine: (lines: string[]) => Promise<boolean>
) => {
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        let i = 0;
        let list = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            const linesToProcess = i === 0 ? lines.slice(1) : lines;

            i++;

            const isEnd = await onLine(linesToProcess);
            if (isEnd) break;
        }
    } finally {
        reader.releaseLock();
    }
};

export default async (fastify: FastifyInstance, opts: any) => {
    let isProcessing = false;

    fastify.get<{
        Params: { target: string };
    }>(
        '/async/:target',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '서버간 데이터 동기화를 진행합니다 - ',
                tags: ['infra'],
                params: {
                    type: 'object',
                    properties: {
                        target: { type: 'string', enum: ['mobinogi'] },
                    },
                    required: ['target'],
                },
            },
        },
        async req => {
            const { target } = req.params;

            if (isProcessing) {
                return { success: false, error: 'Another process is still running.' };
            }

            isProcessing = true;
            switch (target) {
                case 'mobinogi': {
                    try {
                        await Promise.all([
                            (async () => {
                                // user_states
                                const response = await fetch(
                                    `https://mobingi.ngrok.io/media/data/user_states?key=${process.env.MOBINOGI_OREFINGER}`
                                );

                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }

                                const reader = response.body?.getReader();
                                if (!reader) {
                                    throw new Error('Response body is not readable');
                                }

                                let list: string[] = [];
                                await convertCsv(reader, async lines => {
                                    list.push(
                                        ...lines.map(line => {
                                            let [idx, server_type, user_id, create_at, update_at, use_yn] = line
                                                .split(',')
                                                .map(part => part.replace(/^"|"$/g, ''));

                                            create_at = new Date(create_at)
                                                .toISOString()
                                                .slice(0, 19)
                                                .replace('T', ' ');
                                            update_at = new Date(update_at)
                                                .toISOString()
                                                .slice(0, 19)
                                                .replace('T', ' ');

                                            use_yn = use_yn === 'true' ? 'Y' : 'N';

                                            return paramsToFormat([
                                                idx,
                                                server_type,
                                                user_id,
                                                create_at,
                                                update_at,
                                                use_yn,
                                            ]);
                                        })
                                    );

                                    if (list.length > INSERT_CNT) {
                                        insertUserStateList(list).catch(console.error);
                                        list = [];
                                    }

                                    return false;
                                });

                                if (list.length > 0) {
                                    insertUserStateList(list).catch(console.error);
                                    list = [];
                                }
                            })(),
                            (async () => {
                                // user_states_class
                                const response = await fetch(
                                    `https://mobingi.ngrok.io/media/data/user_states_class?key=${process.env.MOBINOGI_OREFINGER}`
                                );

                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }

                                const reader = response.body?.getReader();
                                if (!reader) {
                                    throw new Error('Response body is not readable');
                                }

                                let list: string[] = [];
                                let lifeList: string[] = [];

                                await convertCsv(reader, async lines => {
                                    const l = lines.map(line => {
                                        let [
                                            user_idx,
                                            class_type,
                                            level,
                                            rank,
                                            use_yn,
                                            vitality,
                                            attractiveness,
                                            update_at,
                                        ] = line.split(',').map(part => part.replace(/^"|"$/g, ''));

                                        update_at = new Date(update_at).toISOString().slice(0, 19).replace('T', ' ');

                                        use_yn = use_yn === 'true' ? 'Y' : 'N';
                                        rank = rank || '0';

                                        return {
                                            user_idx,
                                            class_type,
                                            level,
                                            rank,
                                            use_yn,
                                            vitality,
                                            attractiveness,
                                            update_at,
                                        };
                                    });

                                    // "user_idx","class_type","level","rank","use_yn","vitality","attractiveness","update_at"
                                    // 0,2,552,2180181,true,152,474,"2025-10-09T12:59:59.000Z"
                                    for (const {
                                        user_idx,
                                        class_type,
                                        level,
                                        rank,
                                        use_yn,
                                        vitality,
                                        attractiveness,
                                        update_at,
                                    } of l) {
                                        // (user_idx, class_type, \`level\`, \`rank\`, update_at, use_yn)
                                        list.push(
                                            paramsToFormat([user_idx, class_type, level, rank, update_at, use_yn])
                                        );
                                        lifeList.push(paramsToFormat([user_idx, vitality, attractiveness]));
                                    }
                                    // list.push(
                                    //     ...
                                    // );

                                    if (list.length > INSERT_CNT) {
                                        await insertUserStateClassList(list);
                                        await insertUserStateLifeList(lifeList);
                                        list = [];
                                    }

                                    return false;
                                });

                                if (list.length > 0) {
                                    await insertUserStateClassList(list);
                                    await insertUserStateLifeList(lifeList);
                                    list = [];
                                }
                            })(),
                        ]);
                    } catch (e) {
                        return { success: false, error: e };
                    }

                    isProcessing = false;
                    return { success: true };
                }
            }
        }
    );
};
