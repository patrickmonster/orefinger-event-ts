import { appInteraction } from 'interactions/app';

import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { createMenuinputCommand } from 'utils/discord/component';
import { hasNot } from 'utils/discord/permission';

export const exec = async (interaction: appInteraction) => {
    if (interaction.type !== ApplicationCommandType.User) return; // 유저 커맨드만
    const { member, channel, resolved, target_id } = interaction;
    // uploadUrl

    if (!member) return;
    const { permissions } = member;

    if (hasNot(permissions, PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({
            content: '권한이 없습니다. 해당 역할은 `채널관리자` 권한이 필요합니다.',
            ephemeral: true,
        });
    }
};

const api = createMenuinputCommand(
    {
        dm_permission: false,
    },
    __filename
);

// 인터렉션 이벤트
export const isAdmin = true; // 봇 관리자만 사용 가능
export default api;
