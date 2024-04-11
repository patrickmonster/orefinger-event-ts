import { webhookCreate } from 'components/discord';
import { insertFile } from 'controllers/CDN/file';
import { upsertWebhook } from 'controllers/guild/webhook';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { AppContextMenuInteraction } from 'interactions/app';
import { createMenuinputCommand } from 'utils/discord/component';
import { sendWebhook } from 'utils/discordApiInstance';
import { uploadProfile } from 'utils/s3Apiinstance';

export const exec = async (interaction: AppContextMenuInteraction) => {
    if (interaction.type !== ApplicationCommandType.User) return; // 유저 커맨드만
    const { target_id, resolved, channel, guild_id } = interaction;
    const { users, members } = resolved;

    if (!members) {
        return interaction.reply({ content: '멤버 정보가 없습니다.', ephemeral: true });
    }

    await interaction.differ({ ephemeral: true });

    const member = members[target_id];
    const user = users[target_id];

    const nickname = member.nick || user?.global_name || user?.username;
    const { key, type, length } = await uploadProfile(target_id, member?.avatar || user.avatar || undefined);
    const { insertId } = await insertFile({
        name: nickname,
        auth_id: target_id,
        src: key,
        content_type: type,
        size: length,
    });

    const { id, token } = await webhookCreate(channel.id, { name: '방송알리미' });

    await upsertWebhook(channel.id, {
        name: nickname,
        auth_id: target_id,
        webhook_id: id,
        token: token,
        img_idx: insertId,
        guild_id: guild_id,
    });

    await sendWebhook(id, `${token}`, {
        content: `${nickname}님의 프로필 사진이 업로드 되었습니다.`,
        avatar_url: `https://cdn.orefinger.click/${key}`,
    });
    await interaction.remove();
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
