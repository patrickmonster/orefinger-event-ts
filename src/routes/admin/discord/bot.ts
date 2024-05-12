import { FastifyInstance } from 'fastify';

import axios from 'axios';
import socket from 'components/socket/socketClient';
import { CLIENT_EVENT } from 'components/socket/socketInterface';
import { selectNotice } from 'controllers/notification';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Params: { noticeId: string };
    }>(
        '/join/chzzk/:noticeId',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '채팅에 강제 입장',
                tags: ['Main'],
                deprecated: false,
            },
        },
        async req => {
            const { noticeId } = req.params;

            const {
                list: [notice],
            } = await selectNotice({ page: 1, limit: 1 }, { noticeId });

            if (!notice) {
                return { success: false, message: '채널이 등록되지 않았습니다!' };
            }

            const { data } = await axios
                .get(`https://api.chzzk.naver.com/service/v2/channels/${notice.hash_id}/live-detail`, {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    },
                })
                .catch(() => ({ data: {} }));

            if (!data.chatChannelId) {
                return { success: false, message: '채널이 존재하지 않습니다!' };
            }

            socket.emit(CLIENT_EVENT.liveOnline, {
                noticeId,
                hashId: notice.hash_id,
                liveStatus: data.liveStatus,
            });

            return { success: true };
        }
    );
};
