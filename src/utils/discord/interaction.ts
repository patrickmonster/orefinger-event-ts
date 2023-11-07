import { IReply } from 'plugins/discord';

export const sendErrorNotFoundComponent = async (interaction: IReply) => {
    await interaction.reply({
        content: '해당 명령은 등록되지 않았습니다!',
        ephemeral: true,
    });
};
