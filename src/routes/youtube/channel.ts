import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createYutubeUser, createYutubeChannel, createYutubeEvent, insertYoutubeVideo } from 'controllers/youtube';

import axios from 'axios';
import { parseString } from 'xml2js';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.post<{
        Params: { youtube_id: string; auth_id: string };
        Body: { is_save: boolean; login: string };
    }>(
        '/channel/:youtube_id/register/:auth_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['Youtube'],
                summary: '유튜브 채널 등록',
                description: '유튜브 채널 등록',
                params: {
                    type: 'object',
                    properties: {
                        youtube_id: { type: 'string', description: '유튜브 채널 ID' },
                        auth_id: { type: 'string', description: '인증 ID' },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        is_save: { type: 'boolean', description: '선처리 저장 여부' },
                        login: { type: 'string', description: '유튜브 채널 로그인' },
                    },
                },
            },
        },
        (req, res) => {
            const { auth_id, youtube_id } = req.params;
            const { is_save, login } = req.body;

            axios.get(`https://www.youtube.com/feeds/videos.xml?channel_id=${youtube_id}`).then(({ data }) => {
                parseString(data, async (err, { feed }) => {
                    if (err) {
                        return res.send({ success: false, message: err.message });
                    }

                    try {
                        const {
                            author: [
                                {
                                    name: [name],
                                },
                            ],
                            published: [published],
                            entry,
                        } = feed;

                        await createYutubeUser(youtube_id, auth_id, login, name);

                        await createYutubeEvent(
                            youtube_id, // youtube_id
                            JSON.stringify([
                                {
                                    name: name,
                                    value: published.split('T')[0],
                                    inline: true,
                                },
                                {
                                    name: 'YOUTUBE',
                                    value: `https://www.youtube.com/channel/${youtube_id}`,
                                    inline: true,
                                },
                            ]) // data
                        );

                        const list = entry.map((o: any) => {
                            const {
                                id: [id],
                                title: [title],
                                'yt:videoId': [video_id],
                                'yt:channelId': [channel_id],
                            } = o;

                            return {
                                id,
                                title,
                                video_id,
                                channel_id,
                            };
                        });

                        if (is_save) await insertYoutubeVideo(list);
                        res.send({ success: true, message: '등록되었습니다.', data: list });
                    } catch (e: any) {
                        res.send({ success: false, message: e.message });
                    }
                });
            });

            // return data;
        }
    );
    //
    fastify.post<{
        Params: { youtube_id: string; channel_id: string };
        Body: { user_name: string; description: string };
    }>(
        '/channel/:youtube_id/target/:channel_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['Youtube'],
                summary: '알림 등록',
                description: '유튜브 채널 알림 등록',
                params: {
                    type: 'object',
                    properties: {
                        youtube_id: { type: 'string', description: '유튜브 채널 ID' },
                        channel_id: { type: 'string', description: '채널 ID' },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        user_name: { type: 'string', description: '유저 이름' },
                        description: { type: 'string', description: '제목' },
                    },
                },
            },
        },
        async req => {
            const { youtube_id, channel_id } = req.params;
            const { user_name, description } = req.body;

            try {
                await createYutubeChannel(youtube_id, user_name, channel_id, description);
                return { success: true, message: '등록되었습니다.' };
            } catch (e: any) {
                console.log(e);
                return { success: false, message: e.message };
            }
        }
    );
};
