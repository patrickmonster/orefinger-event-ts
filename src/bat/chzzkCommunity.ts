import axios from 'axios';
import { insertVideoEvents, selectEventBats, selectVideoEvents } from 'controllers/bat';
import { deleteNoticeChannel } from 'controllers/notice';
import { APIEmbed } from 'discord-api-types/v10';
import { NoticeChannel } from 'interfaces/notice';
import discord from 'utils/discordApiInstance';
import sleep from 'utils/sleep';

import { ChzzkContent, Comment, CommentDetail, User } from 'interfaces/API/Chzzk';

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param video_object
 * @returns
 */
const convertVideoObject = (
    videoObject: {
        comment: CommentDetail;
        user: User;
    },
    name?: string
): APIEmbed => {
    const {
        content: title,
        objectType,
        objectId: channelId,
        commentId,
        attaches: [postImageObject],
    } = videoObject.comment;

    const { user: channelUser } = videoObject;

    return {
        title,
        url: `https://chzzk.naver.com/${channelId}/community/detail/${commentId}`,
        image: {
            url: postImageObject ? postImageObject.attachValue : '',
        },
        author: {
            name: name ?? channelUser.userNickname,
            icon_url: channelUser.profileImageUrl,
        },
    };
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param notice_id
 * @param hash_id
 * @returns
 */
const getChannelVideos = async (notice_id: number, hash_id: string) =>
    new Promise<{
        videos: any[];
    }>((resolve, reject) => {
        axios
            .get<{
                code: number;
                message: string;
                content: {
                    comments: ChzzkContent<Array<Comment>> & { commentCount: number };
                };
            }>(
                `https://apis.naver.com/nng_main/nng_comment_api/v1/type/CHANNEL_POST/id/${hash_id}/comments?limit=10&offset=0&orderType=DESC&pagingType=PAGE`
            )
            .then(async ({ data: response }) => {
                const {
                    content: {
                        comments: { data, commentCount },
                    },
                } = response;
                const oldVideos = await selectVideoEvents(notice_id);

                console.log(`ckzzk community :: ${commentCount}/${oldVideos.length}`);
                const videos = [];
                for (const { comment, user } of data) {
                    if (
                        comment.objectType !== 'CHANNEL_POST' ||
                        oldVideos.some(({ video_id }) => video_id == comment.commentId.toString())
                    )
                        continue;

                    try {
                        await insertVideoEvents(notice_id, comment.commentId.toString(), comment.content);
                        videos.push(
                            convertVideoObject({
                                comment,
                                user,
                            })
                        );
                    } catch (e) {
                        continue;
                    }
                }
                resolve({ videos });
            })
            .catch(reject);
    });

/**
 * 각 채널 별로 메세지를 전송합니다
 * @param channels
 * @param message TODO : message 객체
 */
const sendChannels = async (channels: NoticeChannel[], message: any) => {
    for (const { notice_id, channel_id } of channels) {
        console.log('sendChannels', notice_id, channel_id);
        discord.post(`/channels/${channel_id}/messages`, message).catch(() => {
            deleteNoticeChannel(notice_id, channel_id).catch(e => {
                console.log('Error: ', e);
            });
        });
    }
};

// 5분마다 실행되는 함수
const interval = async () => {
    const random = Math.floor(Math.random() * 100); // Random delay
    let pageIndex = 0;
    do {
        console.log('탐색 :: Chzzk', new Date(), pageIndex);
        const { list, totalPage } = await selectEventBats(6, {
            page: pageIndex,
            limit: 10,
        });

        for (const { channels, notice_id, hash_id, message, name, img_idx } of list) {
            try {
                const { videos } = await getChannelVideos(notice_id, hash_id);
                for (const video of videos) {
                    await sendChannels(channels, {
                        content: message,
                        embeds: [
                            {
                                ...video,
                                author: {
                                    name: name ?? 'Chzzk',
                                    url: `https://chzzk.naver.com/${hash_id}`,
                                },
                            },
                        ],
                    });
                }
            } catch (e) {
                console.log('Error: ', hash_id);
                continue;
            }
        }

        if (list.length === 0 || pageIndex >= totalPage) break;
        pageIndex++;
        await sleep(100 * random); // Cull down the request
    } while (true);

    console.log('탐색 :: Chzzk Community', new Date(), pageIndex);
};

setInterval(interval, 1000 * 60 * 30); // 5분마다 실행
console.log('Chzzk Community Batch Start!');
// interval();
