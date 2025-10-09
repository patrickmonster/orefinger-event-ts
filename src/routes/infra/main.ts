import { FastifyInstance } from 'fastify';

import { sendMessageByChannels } from 'components/notice';
import { insertLiveEvents, insertVideoEvents, updateLiveEvents } from 'controllers/bat';
import { disableNotice } from 'controllers/notice';
import { APIEmbed } from 'discord-api-types/v10';
import { NoticeChannel } from 'interfaces/notice';
import { query, selectPersent } from 'utils/database';
import { appendTextWing, createActionRow, createSuccessButton, createUrlButton } from 'utils/discord/component';
import { openApi } from 'utils/discordApiInstance';

/**
 * 채널 온라인 정보를 가져옴
 * @param noticeId
 * @returns
 */
const getChannels = async (noticeId: string) =>
    await query<NoticeChannel>(
        `
SELECT 
	vng.notice_id
	, vng.notice_type
	, vng.hash_id
	, vng.video_yn
	, nc.channel_id
	, IF(vw.webhook_id IS NOT NULL
		, json_object(
			'content', vng.message, 'name', vng.name,
			'channel_id', nc.channel_id
			, 'notice_id', vng.notice_id
			, 'guild_id', vng.guild_id
			, 'create_at', nc.create_at
			, 'update_at', nc.update_at
			, 'url', concat('webhooks/', vw.webhook_id, '/', vw.token)
			, 'channel_type', 1
			, 'embed', IF(vng.embed_id IS NOT NULL, (SELECT embed FROM v_embed_user veu WHERE veu.embed_id = vng.embed_id LIMIT 1), NULL)	
		)
		, json_object(
			'content', vng.message
			, 'name', vng.name
			, 'channel_id', nc.channel_id
			, 'notice_id', vng.notice_id
			, 'guild_id', vng.guild_id
			, 'create_at', nc.create_at
			, 'update_at', nc.update_at
			, 'channel_type', 0
			, 'embed', IF(vng.embed_id IS NOT NULL OR vng.embed_id <> 0, (SELECT embed FROM v_embed_user veu WHERE veu.embed_id = vng.embed_id LIMIT 1), NULL)
		)
	) AS channel
FROM v_notice_guild vng 
INNER JOIN notice_channel nc
	USING(guild_id, notice_id)
LEFT JOIN v_webhook vw USING(channel_id)
WHERE 1=1
AND nc.use_yn = 'Y'
AND vng.notice_id = ?
                `,
        noticeId
    );

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.addSchema({
        $id: 'discordEmbed',
        type: 'object',
        properties: {
            url: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            image: {
                type: 'object',
                properties: {
                    url: { type: 'string' },
                    width: { type: 'number' },
                    height: { type: 'number' },
                },
            },
            color: { type: 'string' },
            thumbnail: {
                type: 'object',
                properties: {
                    url: { type: 'string' },
                },
                required: ['url'],
            },
            fields: {
                type: 'array',
                items: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'string' } } },
            },
            //
            footer: { type: 'object', properties: { text: { type: 'string' }, icon_url: { type: 'string' } } },
            timestamp: { type: 'string', format: 'date-time' },
        },
    });

    fastify.get(
        '/target',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '온라인 알림 리스트를 가져옵니다.',
                tags: ['infra'],
            },
        },
        async req =>
            await query(
                `
SELECT
	notice_type_id
	, tag
	, use_yn
	, video_yn
	, auth_type
    , timmer
    , loop_time
    , lib
FROM notice_type nt 
WHERE 1=1
AND nt.scan_yn = 'Y'
                `
            )
    );

    fastify.get<{
        Querystring: { index: number; length: number };
        Params: { noticeType: 2 | 4 | 5 };
    }>(
        '/list/:noticeType',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '온라인 알림 리스트를 가져옵니다.',
                tags: ['infra'],
                querystring: {
                    type: 'object',
                    properties: {
                        index: { type: 'number', description: '서버 순번', default: 0 },
                        length: { type: 'number', description: '총 서버 개수', default: 1 },
                    },
                },
                params: {
                    type: 'object',
                    properties: {
                        noticeType: {
                            type: 'number',
                            description: '알림 타입 (2 : 유튜브, 4 : 치지직, 5 : 숲)',
                            enum: [2, 4, 5],
                        },
                    },
                },
            },
        },
        async req =>
            await selectPersent(
                `
SELECT notice_id
	, hash_id 
	, notice_type 
	, count(0) AS C
FROM v_notice_origin
INNER JOIN notice_guild USING(notice_id)
WHERE 1=1
AND notice_type = ?
GROUP BY notice_id, hash_id, notice_type
ORDER BY notice_id
                `,
                { index: req.query.index, length: req.query.length },
                req.params.noticeType
            )
    );

    fastify.post<{
        Params: { noticeId: string; liveId: string };
        Body: {
            embed: APIEmbed;
            image: string;
            title: string;
            game: string;
            live_at: string;
            chat: string;
            create_at?: string;
            button?: {
                url: string;
                emoji: string;
            };
        };
    }>(
        '/online/:noticeId/:liveId',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '온라인 알림을 보냅니다.',
                summary: '온라인 알림 전송',
                tags: ['infra'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        noticeId: {
                            type: 'string',
                            description: '라이브 ID',
                        },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        embed: { $ref: 'discordEmbed#' },
                        image: { type: 'string' },
                        title: { type: 'string' },
                        game: { type: 'string' },
                        live_at: { type: 'string' },
                        chat: { type: 'string' },
                        button: {
                            type: 'object',
                            properties: {
                                url: { type: 'string' },
                                emoji: { type: 'string' },
                            },
                            required: ['url', 'emoji'],
                        },
                    },
                    required: ['embed', 'image', 'title', 'game', 'live_at', 'chat'],
                },
            },
        },
        async req => {
            const { noticeId, liveId } = req.params;
            try {
                const result = await query(
                    `
SELECT
	nl.notice_id
	, nl.id
	, nl.live_at
	, nl.end_at
FROM notice_live nl 
WHERE 1=1
AND nl.notice_id = ?
AND nl.end_at IS NOT NULL
ORDER BY nl.live_at DESC
                    `,
                    noticeId
                );

                await insertLiveEvents(noticeId, liveId, req.body);

                // 정상 상태
                const channels = (await getChannels(noticeId)).filter(ch => !ch.video_yn);

                if (!result || result.length < 0) {
                    console.log('LIVE START ::', noticeId, liveId);

                    await sendMessageByChannels(
                        channels.map(channel => ({
                            ...channel,
                            message: {
                                content: channel.content || undefined,
                                embeds: channel.embed ? [channel.embed] : [],
                                components: [
                                    createActionRow(
                                        createSuccessButton(`notice attendance ${noticeId}`, {
                                            label: appendTextWing('📌출석체크\u3164', 8), // 크기보정
                                        }),
                                        createSuccessButton(`notice logs ${noticeId}`, {
                                            label: '📊방송이력\u3164', // 크기보정
                                        }),
                                        req.body.button
                                            ? createUrlButton(req.body.button.url, {
                                                  emoji: { id: req.body.button.emoji },
                                              })
                                            : undefined
                                    ),
                                ],
                                username: '방송알리미',
                                avatar_url:
                                    'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                            },
                        }))
                    );

                    if (channels.length) {
                        const [channel] = channels;
                        const { notice_id } = channel;
                        openApi.post(`${process.env.WEB_HOOK_URL}`, {
                            content: `
${notice_id}]${channels.length}개 채널에 알림이 전송되었습니다.
${channels.reduce((p, c) => `${p}\n<#${c.channel_id}> ${noticeId} ${req.body.button?.url} `, '')}
                            `,
                        });
                    }
                    return { success: true, message: '알림이 전송되었습니다.' };
                } else {
                    return { success: true, message: '라이브 정보가 업데이트 되었습니다' };
                }
            } catch (error) {
                console.error(error);
                return { success: false, message: '알림 전송에 실패했습니다.' };
            }
        }
    );

    fastify.post<{
        Params: { noticeId: number };
    }>(
        '/offline/:noticeId',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '오프라인 알림을 보냅니다.',
                summary: '오프라인 알림 전송',
                tags: ['infra'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        noticeId: {
                            type: 'number',
                            description: '라이브 ID',
                        },
                    },
                },
            },
        },
        async req => {
            const { noticeId } = req.params;

            try {
                const { changedRows } = await updateLiveEvents(noticeId);
                if (changedRows == 0) return { success: false, message: '알림 상태 변경 실패' };
                console.log('LIVE END ::', noticeId, changedRows);
                return { success: true, message: '알림 상태가 변경되었습니다.' };
            } catch (error) {
                console.error(error);
                return { success: false, message: '알림 전송에 실패했습니다.' };
            }
        }
    );

    fastify.delete<{
        Params: { noticeId: number; liveId: string };
    }>(
        '/list/:noticeId',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '알림을 비활성화 합니다.',
                summary: '알림 비활성화',
                tags: ['infra'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        noticeId: {
                            type: 'number',
                            description: '라이브 ID',
                        },
                    },
                },
            },
        },
        async req =>
            await disableNotice(req.params.noticeId)
                .then(() => ({ success: true, message: '알림이 비활성화 되었습니다.' }))
                .catch(error => {
                    console.error(error);
                    return { success: false, message: '알림 비활성화에 실패했습니다.' };
                })
    );

    fastify.post<{
        Params: { noticeId: string; videoId: string };
        Body: {
            data: {
                title: string;
                videoId: string;
                hashId: string;
                embed: APIEmbed;
            }[];
        };
    }>(
        '/video/:noticeId',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '비디오 타입 알림을 보냅니다.',
                summary: '비디오 알림 전송',
                tags: ['infra'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        noticeId: {
                            type: 'string',
                            description: '라이브 ID',
                        },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    videoId: { type: 'string' },
                                    hashId: { type: 'string' },
                                    embed: { $ref: 'discordEmbed#' },
                                },
                                required: ['title', 'videoId', 'hashId', 'embed'],
                            },
                        },
                    },
                    required: ['data'],
                },
            },
        },
        async req => {
            const { noticeId, videoId } = req.params;
            const { data } = req.body;

            const list = [];
            let successCnt = 0;

            for (const { title, embed, hashId } of data) {
                if (!videoId || !title) continue;
                try {
                    await insertVideoEvents(noticeId, videoId, title);
                    // 정상 상태

                    list.push({
                        title,
                        videoId,
                        noticeId,
                        embed: {
                            ...embed,
                            author: {
                                name: title || '방송알리미',
                                url: `https://www.youtube.com/channel/${hashId}`,
                                icon_url:
                                    'https://cdn.discordapp.com/attachments/682449668428529743/1125234663045201950/yt_icon_rgb.png',
                            },
                        },
                    });
                } catch (error) {
                    console.error(error);
                    return { success: false, message: '알림 전송에 실패했습니다.' };
                }
            }

            for (const { title, noticeId, embed, videoId } of list) {
                // 정상 상태
                const channels = (await getChannels(noticeId)).filter(ch => ch.video_yn);
                try {
                    console.log('VIDEO UPLOAD ::', noticeId, title);

                    await sendMessageByChannels(
                        channels.map(channel => ({
                            ...channel,
                            hook: {
                                name: title || '방송알리미',
                            },
                            message: {
                                content: channel.content,
                                embeds: [embed],
                            },
                        }))
                    );
                    successCnt++;

                    if (channels.length) {
                        const [channel] = channels;
                        const { notice_id } = channel;
                        openApi.post(`${process.env.WEB_HOOK_URL}`, {
                            content: `
${notice_id}]${channels.length}개 채널에 알림이 전송되었습니다.
${channels.reduce((p, c) => `${p}\n<#${c.channel_id}> ${noticeId} https://www.youtube.com/watch?v=${videoId} `, '')}
                            `,
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            }

            return { success: true, message: `${successCnt}개의 알림이 전송되었습니다.`, list };
        }
    );
};
