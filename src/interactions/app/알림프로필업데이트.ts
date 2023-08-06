import axios from 'axios';
import { basename } from 'path';
import { format } from 'date-fns';

import { webhook } from 'controllers/event';
import { AppContextMenuInteraction } from 'interactions/app';
import { ApplicationCommandType, RESTPatchAPIApplicationCommandJSONBody } from 'discord-api-types/v10';

import twitch from 'utils/twitchApiInstance';
import discord from 'utils/discordApiInstance';
import { error } from 'utils/errorLog';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandType.Message;

export const exec = async (interaction: AppContextMenuInteraction) => {
    if (interaction.type !== type) return; // 유저 커맨드만
    const { target_id } = interaction;

    interaction
        .deffer({
            ephemeral: true,
        })
        .then(async replay => {
            const [target_channel] = await webhook(target_id);
            if (!target_channel) {
                await replay({
                    embeds: [{ title: '이런... 알림이 아닌것 같아요! 방송알리미가 전송하는 맨트에 해당 명령을 해 주세요!' }],
                });
            } else {
                const { user_id, hook_id, hook_token } = target_channel;
                const {
                    data: { data },
                } = await twitch.get<{
                    data: any[];
                }>(`/users?id=${user_id}`);

                const form = new FormData();
                form.append(
                    'files[0]',
                    await axios.get(data[0].profile_image_url, {
                        responseType: 'blob',
                    }),
                    'profile.png'
                );

                form.append('name', data[0].display_name);
                form.append('avatar', 'profile.png');

                try {
                    await discord.patch(`/webhooks/${hook_id}/${hook_token}`, form, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    await discord.patch(`/webhooks/${hook_id}/${hook_token}`, {
                        content: `알림 프로필이 업데이트 되었습니다!`,
                    });

                    await replay({
                        embeds: [{ title: '알림 프로필이 업데이트 되었습니다!' }],
                    });
                } catch (e) {
                    const tag = error('PROFILE', e);
                    await interaction.follow({
                        embeds: [
                            {
                                title: '문제가 발생하였습니다...!',
                                description: `오류가 발생하였습니다..!\n${tag}`,
                            },
                        ],
                    });
                }
            }
        })
        .catch(async err => {
            error('INTERACTION', err);
        });
};

const api: RESTPatchAPIApplicationCommandJSONBody = {
    name,
    type,
    dm_permission: false,
};

// 인터렉션 이벤트
export default api;
