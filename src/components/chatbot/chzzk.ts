import { callCommand, upsertChatPermission } from 'controllers/chat/chzzk';
import { ChatDonation, ChatMessage } from 'interfaces/chzzk/chat';
import ChzzkChat from 'utils/chat/chzzk';
import { ENCRYPT_KEY, sha256 } from 'utils/cryptoPw';

export type Chat = (ChatMessage | ChatDonation) & {
    reply: (message: string) => void;
};

// 봇 접두사
const prefix = '@';

/**
 * 채팅 명령어 처리
 */
export default (client: ChzzkChat, chat: Chat) => {
    const {
        message,
        profile: { userRoleCode },
        extras: { streamingChannelId },
    } = chat;
    if (!client || !message) return;
    const [userCommand, ...args] = message.split(' ');

    const command = client.commands.find(({ command }) => command.toUpperCase() === userCommand.trim().toUpperCase());

    if (command) {
        const { answer, count } = command;
        chat.reply(`${answer}`.replace(/\{count\}/g, `${count + 1}`));
        command.count = count + 1;
        callCommand(streamingChannelId, command.command).catch(() => {});
    } else {
        if (
            client.commands.length &&
            [`${prefix}명령어`, `${prefix}l`, `${prefix}L`, `${prefix}list`].includes(userCommand)
        ) {
            chat.reply(`명령어 리스트 https://r.orefinger.click/bot/${streamingChannelId}`);
            return;
        }

        if (!message.startsWith(prefix) || userRoleCode == 'common_user') {
            if ('e229d18df2edef8c9114ae6e8b20373a' !== chat.profile.userIdHash) return;
        }

        switch (userCommand) {
            case `${prefix}`: {
                chat.reply(`명령어 리스트 https://r.orefinger.click/bot/${streamingChannelId}`);
                break;
            }
            case `${prefix}AUTH`: {
                const [user, key] = args;
                if (!key || !user) {
                    chat.reply('인증키가 없어욧! - AUTH [인증키]');
                    return;
                }
                const origin = sha256(`${user}:${streamingChannelId}`, ENCRYPT_KEY).replace(/[^a-zA-Z0-9]/g, '');
                if (origin !== key) {
                    chat.reply('초오오비상!! 누가 해킹하려고 해욧! (대충 인증키가 틀렸다는거에요)');
                    return;
                }

                upsertChatPermission(user, streamingChannelId, userRoleCode)
                    .then(() => {
                        chat.reply('뿌뿌루 빰빰🎉 관리자가 등록되었어요!📌');
                    })
                    .catch(() => {
                        chat.reply('앗...! 등록에 실패했어요! 관리자에게 문의해주세요!📌 (아마 코드가 없는거 같아요)');
                    });

                break;
            }
            case `${prefix}d`:
            case `${prefix}D`:
            case `${prefix}delete`: {
                const [question] = args;

                if (!question) {
                    chat.reply('명령어를 입력해주세요. - remove [명령어]');
                    return;
                }

                const idx = client.commands.findIndex(({ command }) => command === question.trim());
                if (idx === -1) {
                    chat.reply('해당 명령어가 없습니다.');
                    return;
                }

                client.commands.splice(idx, 1);
                chat.reply(`명령어가 삭제되었습니다. - ${question}`);
                break;
            }
            case `${prefix}help`: {
                chat.reply(`https://r.orefinger.click/help?t=bot`);
                break;
            }
            case `${prefix}h`:
            case `${prefix}H`: {
                chat.reply(`d [c] - DELETE / l - LIST / r - RELOAD / h - HELP`);
                break;
            }
            case `${prefix}인사`: {
                chat.reply(`안녕하세요! 저는 디스코드에서 방송알림을 전송하고 있어요...! 🎉`);
                break;
            }
            default:
                break;
        }
    }
};
